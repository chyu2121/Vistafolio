"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { isKoreanStock, koreanStockLogos } from "@/lib/korean-stocks";

export interface PortfolioEntry {
    id: string;
    ticker: string;
    name: string;
    currency: "USD" | "KRW";
    quantity: number;
    avgPrice: number;
    currentPrice: number | null;
    logoUrl: string;
}

interface PriceCache {
    price: number;
    timestamp: number;
}

interface ExchangeRateCache {
    rate: number;
    timestamp: number;
}

const CACHE_TTL = 30_000; // 30초
const EXCHANGE_RATE_CACHE_TTL = 3600000; // 1시간

function getLogoUrl(ticker: string): string {
    // 한국 주식의 경우 매핑된 로고 사용
    if (isKoreanStock(ticker)) {
        // 정확한 티커로 매핑 확인
        if (koreanStockLogos[ticker]) {
            return koreanStockLogos[ticker];
        }
        // 매핑되지 않은 한국 주식은 parqet 폴백
        const base = ticker.split(".")[0];
        return `https://assets.parqet.com/logos/symbol/${base}?format=png`;
    }

    // 미국 주식/ETF: parqet CDN 사용
    return `https://assets.parqet.com/logos/symbol/${ticker}?format=png`;
}

export function usePortfolio() {
    const [entries, setEntries] = useState<PortfolioEntry[]>([]);
    const [displayCurrency, setDisplayCurrency] = useState<"USD" | "KRW">("USD");
    const [exchangeRate, setExchangeRate] = useState<number>(1300); // 폴백값
    const [user, setUser] = useState<any>(null);
    const [portfolios, setPortfolios] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const priceCacheRef = useRef<Record<string, PriceCache>>({});
    const exchangeRateCacheRef = useRef<ExchangeRateCache | null>(null);

    // Supabase 클라이언트 초기화
    const supabase = useRef(
        createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        )
    ).current;

    const fetchExchangeRate = useCallback(async () => {
        const now = Date.now();
        const cached = exchangeRateCacheRef.current;

        if (cached && now - cached.timestamp < EXCHANGE_RATE_CACHE_TTL) {
            setExchangeRate(cached.rate);
            return cached.rate;
        }

        try {
            const res = await fetch(`/api/exchange-rate`);
            if (!res.ok) return exchangeRate;
            const data = await res.json();
            if (typeof data.rate === "number") {
                exchangeRateCacheRef.current = {
                    rate: data.rate,
                    timestamp: now,
                };
                setExchangeRate(data.rate);
                return data.rate;
            }
            return exchangeRate;
        } catch {
            return exchangeRate;
        }
    }, [exchangeRate]);

    const fetchPrice = useCallback(async (ticker: string): Promise<number | null> => {
        const cached = priceCacheRef.current[ticker];
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.price;
        }

        try {
            const res = await fetch(`/api/price?ticker=${encodeURIComponent(ticker)}`);
            if (!res.ok) return null;
            const data = await res.json();
            if (typeof data.price === "number") {
                priceCacheRef.current[ticker] = {
                    price: data.price,
                    timestamp: Date.now(),
                };
                return data.price;
            }
            return null;
        } catch {
            return null;
        }
    }, []);

    const addEntry = useCallback(
        async (
            ticker: string,
            name: string,
            currency: "USD" | "KRW",
            quantity: number,
            avgPrice: number
        ) => {
            const currentPrice = await fetchPrice(ticker);
            // 검색 시 공공데이터포털/KRX에서 받아온 name이 이미 올바른 종목명
            const displayName = name;
            const newEntry: PortfolioEntry = {
                id: `${ticker}-${Date.now()}`,
                ticker,
                name: displayName,
                currency,
                quantity,
                avgPrice,
                currentPrice,
                logoUrl: getLogoUrl(ticker),
            };
            setEntries((prev) => [...prev, newEntry]);
        },
        [fetchPrice]
    );

    const removeEntry = useCallback((id: string) => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
    }, []);

    const updateEntry = useCallback((id: string, updates: Partial<PortfolioEntry>) => {
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    }, []);

    const refreshPrices = useCallback(async () => {
        setEntries((prev) =>
            prev.map((e) => ({ ...e })) // trigger re-render first
        );

        await fetchExchangeRate();

        const updated = await Promise.all(
            entries.map(async (e) => {
                // 캐시 무효화 후 재조회
                delete priceCacheRef.current[e.ticker];
                const price = await fetchPrice(e.ticker);
                return price !== null ? { ...e, currentPrice: price } : e;
            })
        );
        setEntries(updated);
    }, [entries, fetchPrice, fetchExchangeRate]);

    // 초기 환율 로드 + 사용자 정보 확인
    useEffect(() => {
        fetchExchangeRate();

        // 사용자 정보 확인
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            if (data.user) {
                loadPortfolios();
            }
        });
    }, []);

    // 포트폴리오 목록 로드
    const loadPortfolios = useCallback(async () => {
        try {
            const { data } = await supabase.auth.getUser();
            if (!data.user) return;

            const { data: portfolios, error } = await supabase
                .from("portfolios")
                .select("*")
                .eq("user_id", data.user.id)
                .order("updated_at", { ascending: false });

            if (!error && portfolios) {
                setPortfolios(portfolios);
            }
        } catch (err) {
            console.error("Failed to load portfolios:", err);
        }
    }, []);

    // 현재 포트폴리오 저장
    const savePortfolio = useCallback(
        async (portfolioName: string) => {
            try {
                const { data } = await supabase.auth.getUser();
                if (!data.user) {
                    alert("로그인 후 저장 가능합니다");
                    return;
                }

                setIsSaving(true);

                // 기존 활성 포트폴리오 비활성화
                await supabase
                    .from("portfolios")
                    .update({ is_active: false })
                    .eq("user_id", data.user.id);

                // 새 포트폴리오 저장
                const { error } = await supabase.from("portfolios").insert([
                    {
                        user_id: data.user.id,
                        name: portfolioName,
                        entries,
                        display_currency: displayCurrency,
                        is_active: true,
                    },
                ]);

                if (error) throw error;
                alert(`"${portfolioName}" 포트폴리오가 저장되었습니다`);
                loadPortfolios();
            } catch (err: any) {
                console.error("Failed to save portfolio:", err);
                alert("포트폴리오 저장에 실패했습니다");
            } finally {
                setIsSaving(false);
            }
        },
        [entries, displayCurrency]
    );

    // 포트폴리오 로드
    const loadPortfolioData = useCallback(async (portfolioId: string) => {
        try {
            const { data: portfolio, error } = await supabase
                .from("portfolios")
                .select("*")
                .eq("id", portfolioId)
                .single();

            if (error) throw error;

            // entry.name에 공공데이터포털/KRX에서 받아온 종목명이 이미 저장되어 있음
            const convertedEntries = (portfolio.entries || []).map((entry: PortfolioEntry) => entry);

            setEntries(convertedEntries);
            setDisplayCurrency(portfolio.display_currency || "USD");

            // 활성 포트폴리오로 표시
            await supabase
                .from("portfolios")
                .update({ is_active: true })
                .eq("id", portfolioId);

            await supabase
                .from("portfolios")
                .update({ is_active: false })
                .eq("id", { neq: portfolioId })
                .eq("user_id", portfolio.user_id);

            alert(`"${portfolio.name}" 포트폴리오가 로드되었습니다`);
            loadPortfolios();
        } catch (err: any) {
            console.error("Failed to load portfolio:", err);
            alert("포트폴리오 로드에 실패했습니다");
        }
    }, []);

    // 포트폴리오 삭제
    const deletePortfolio = useCallback(async (portfolioId: string) => {
        try {
            if (!confirm("정말 이 포트폴리오를 삭제하시겠습니까?")) return;

            const { error } = await supabase
                .from("portfolios")
                .delete()
                .eq("id", portfolioId);

            if (error) throw error;
            alert("포트폴리오가 삭제되었습니다");
            loadPortfolios();
        } catch (err: any) {
            console.error("Failed to delete portfolio:", err);
            alert("포트폴리오 삭제에 실패했습니다");
        }
    }, []);

    // 통화 전환 헬퍼 함수
    const convertPrice = useCallback((price: number | null, fromCurrency: "USD" | "KRW", toCurrency: "USD" | "KRW"): number | null => {
        if (price === null) return null;
        if (fromCurrency === toCurrency) return price;

        if (fromCurrency === "USD" && toCurrency === "KRW") {
            return price * exchangeRate;
        } else if (fromCurrency === "KRW" && toCurrency === "USD") {
            return price / exchangeRate;
        }
        return price;
    }, [exchangeRate]);

    return {
        entries,
        addEntry,
        removeEntry,
        refreshPrices,
        displayCurrency,
        setDisplayCurrency,
        exchangeRate,
        convertPrice,
        user,
        portfolios,
        savePortfolio,
        loadPortfolioData,
        deletePortfolio,
        isSaving,
        updateEntry,
    };
}
