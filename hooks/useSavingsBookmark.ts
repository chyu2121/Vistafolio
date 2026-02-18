import { useState, useEffect, useCallback } from "react";

// Product 타입은 vista_savings/page.tsx와 호환되도록 정의
// (실제 데이터 전체를 저장하여 오프라인/상세페이지에서도 쓸 수 있게 함)
export interface SavedProduct {
    fin_co_no: string;
    fin_prdt_cd: string;
    kor_co_nm: string;
    fin_prdt_nm: string;
    join_way: string;
    spcl_cnd: string;
    join_member: string;
    dcls_strt_day: string;
    max_limit: number | null;
    options: any[];
    best_rate: number;
    type: "deposit" | "saving";
    savedAt: number;
}

const STORAGE_KEY = "vista_savings_bookmarks";

export function useSavingsBookmark() {
    const [bookmarks, setBookmarks] = useState<SavedProduct[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage
    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setBookmarks(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse bookmarks", e);
            }
        }
        setIsLoaded(true);
    }, []);

    const isBookmarked = useCallback((fin_prdt_cd: string) => {
        return bookmarks.some((b) => b.fin_prdt_cd === fin_prdt_cd);
    }, [bookmarks]);

    const toggleBookmark = useCallback((product: any, type: "deposit" | "saving") => {
        setBookmarks((prev) => {
            const exists = prev.find((b) => b.fin_prdt_cd === product.fin_prdt_cd);
            let next;
            if (exists) {
                next = prev.filter((b) => b.fin_prdt_cd !== product.fin_prdt_cd);
            } else {
                const newBookmark: SavedProduct = {
                    ...product,
                    type,
                    savedAt: Date.now(),
                };
                next = [newBookmark, ...prev];
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const removeBookmark = useCallback((fin_prdt_cd: string) => {
        setBookmarks((prev) => {
            const next = prev.filter((b) => b.fin_prdt_cd !== fin_prdt_cd);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    return { bookmarks, isBookmarked, toggleBookmark, removeBookmark, isLoaded };
}
