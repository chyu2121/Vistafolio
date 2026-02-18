"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import ColorThief from "colorthief";
import { PortfolioEntry } from "@/hooks/usePortfolio";


interface ChartItem {
    ticker: string;
    name: string;
    value: number;
    logoUrl: string;
    color: string;
}

// RGB 문자열을 HSL로 변환
function rgbToHsl(rgb: string): [number, number, number] {
    const m = rgb.match(/\d+/g);
    if (!m) return [0, 0, 50];
    const r = parseInt(m[0]) / 255;
    const g = parseInt(m[1]) / 255;
    const b = parseInt(m[2]) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return [h * 360, s * 100, l * 100];
}

// 인접 조각 색상 대비 보정: 색상(Hue) 기준으로 정렬 후 명도 조정
function ensureColorContrast(items: ChartItem[]): ChartItem[] {
    if (items.length < 2) return items;

    // Hue 기준으로 정렬하여 유사 색상이 인접하지 않도록
    const sorted = [...items].sort((a, b) => {
        const [ha] = rgbToHsl(a.color);
        const [hb] = rgbToHsl(b.color);
        return ha - hb;
    });

    // 인접 쌍 확인 후 명도 조정
    const result = [...sorted];
    for (let i = 0; i < result.length; i++) {
        const curr = result[i];
        const next = result[(i + 1) % result.length];
        const [h1, , l1] = rgbToHsl(curr.color);
        const [h2, s2, l2] = rgbToHsl(next.color);

        const hueDiff = Math.abs(h1 - h2);
        const minHueDiff = Math.min(hueDiff, 360 - hueDiff);

        if (minHueDiff < 22 && Math.abs(l1 - l2) < 18) {
            const newL = l2 > 55 ? Math.max(20, l2 - 28) : Math.min(82, l2 + 28);
            result[(i + 1) % result.length] = {
                ...next,
                color: `hsl(${h2.toFixed(0)}, ${s2.toFixed(0)}%, ${newL.toFixed(0)}%)`,
            };
        }
    }
    return result;
}

// 문자열 해시 기반 색상 생성 (폴백)
function hashColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 62%, 52%)`;
}

// 이미지에서 주조색 추출
async function extractDominantColor(url: string, fallbackKey: string): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        const timer = setTimeout(() => resolve(hashColor(fallbackKey)), 2500);

        img.onload = () => {
            clearTimeout(timer);
            try {
                const ct = new ColorThief();
                const [r, g, b] = ct.getColor(img);
                resolve(`rgb(${r}, ${g}, ${b})`);
            } catch {
                resolve(hashColor(fallbackKey));
            }
        };
        img.onerror = () => {
            clearTimeout(timer);
            resolve(hashColor(fallbackKey));
        };
    });
}

interface DonutChartProps {
    entries: PortfolioEntry[];
    displayCurrency: "USD" | "KRW";
    exchangeRate: number;
    colorSeed?: number;
}

const W = 864;
const H = 600;
const OUTER_R = 210;
const INNER_R = OUTER_R * 0.52;
const LABEL_R = OUTER_R + 36;

export default function DonutChart({ entries, displayCurrency, exchangeRate, colorSeed }: DonutChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const colorCacheRef = useRef<Record<string, string>>({});
    const [chartItems, setChartItems] = useState<ChartItem[]>([]);

    // 가격 변환 함수
    const convertPrice = useCallback((price: number, fromCurrency: "USD" | "KRW", toCurrency: "USD" | "KRW"): number => {
        if (fromCurrency === toCurrency) return price;
        if (fromCurrency === "USD" && toCurrency === "KRW") {
            return price * exchangeRate;
        } else if (fromCurrency === "KRW" && toCurrency === "USD") {
            return price / exchangeRate;
        }
        return price;
    }, [exchangeRate]);

    // 유효 엔트리에서 차트 기본 데이터 구성
    const rawItems = useMemo<ChartItem[]>(() => {
        return entries
            .filter((e) => e.currentPrice !== null && e.quantity > 0)
            .map((e) => ({
                ticker: e.ticker,
                // entry.name에 공공데이터포털/KRX에서 받아온 종목명이 이미 저장되어 있음
                name: e.name,
                value: e.quantity * convertPrice(e.currentPrice ?? 0, e.currency, displayCurrency),
                logoUrl: e.logoUrl,
                color: colorCacheRef.current[e.ticker] ?? "",
            }));
    }, [entries, displayCurrency, convertPrice]);

    // 색상 추출 (캐싱 포함)
    useEffect(() => {
        if (rawItems.length === 0) {
            setChartItems([]);
            return;
        }
        let cancelled = false;

        (async () => {
            const withColors = await Promise.all(
                rawItems.map(async (item) => {
                    let baseColor = colorCacheRef.current[item.ticker];
                    if (!baseColor) {
                        baseColor = await extractDominantColor(item.logoUrl, item.ticker);
                        colorCacheRef.current[item.ticker] = baseColor;
                    }

                    // Apply hue rotation based on seed
                    const [h, s, l] = rgbToHsl(baseColor);
                    const newH = (h + (colorSeed || 0) * 137.5) % 360; // Use golden angle for good distribution
                    const color = `hsl(${newH.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`;

                    return { ...item, color };
                })
            );
            if (!cancelled) {
                setChartItems(ensureColorContrast(withColors));
            }
        })();

        return () => { cancelled = true; };
    }, [rawItems, colorSeed]);

    // D3 차트 렌더링
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        if (chartItems.length === 0) return;

        const total = d3.sum(chartItems, (d) => d.value);
        const cx = W / 2;
        const cy = H / 2;

        const pie = d3
            .pie<ChartItem>()
            .value((d) => d.value)
            .sort(null)
            .padAngle(0.018);

        const arcGen = d3
            .arc<d3.PieArcDatum<ChartItem>>()
            .innerRadius(INNER_R)
            .outerRadius(OUTER_R)
            .cornerRadius(4);

        const midArcGen = d3
            .arc<d3.PieArcDatum<ChartItem>>()
            .innerRadius(INNER_R + (OUTER_R - INNER_R) * 0.55)
            .outerRadius(INNER_R + (OUTER_R - INNER_R) * 0.55);

        const g = svg.append("g").attr("transform", `translate(${cx},${cy})`);
        const pieData = pie(chartItems);

        // 조각 그리기
        g.selectAll(".slice")
            .data(pieData)
            .enter()
            .append("path")
            .attr("class", "slice")
            .attr("fill", (d) => d.data.color)
            .attr("stroke", "#111111")
            .attr("stroke-width", 2)
            .attr("d", arcGen as any)
            .attr("opacity", 0)
            .transition()
            .duration(900)
            .ease(d3.easeQuadOut)
            .attr("opacity", 1);

        // 지시선과 라벨을 위한 별도 그룹 생성 (로고보다 먼저 그리기)
        const labelGroup = g.append("g").attr("class", "labels-group");

        // 지시선 + 라벨 그룹 생성 (비중 1.5% 이상 조각만)
        const labelData = pieData.filter((d) => d.data.value / total >= 0.015);

        // 라벨 y위치 충돌 방지 (같은 사이드 기준 정렬)
        const leftLabels = labelData
            .filter((d) => {
                const mid = (d.startAngle + d.endAngle) / 2;
                return mid >= Math.PI;
            })
            .sort((a, b) => {
                const posA = d3.arc<d3.PieArcDatum<ChartItem>>()
                    .innerRadius(LABEL_R).outerRadius(LABEL_R)
                    .centroid(a as any);
                const posB = d3.arc<d3.PieArcDatum<ChartItem>>()
                    .innerRadius(LABEL_R).outerRadius(LABEL_R)
                    .centroid(b as any);
                return posA[1] - posB[1];
            });

        const rightLabels = labelData
            .filter((d) => {
                const mid = (d.startAngle + d.endAngle) / 2;
                return mid < Math.PI;
            })
            .sort((a, b) => {
                const posA = d3.arc<d3.PieArcDatum<ChartItem>>()
                    .innerRadius(LABEL_R).outerRadius(LABEL_R)
                    .centroid(a as any);
                const posB = d3.arc<d3.PieArcDatum<ChartItem>>()
                    .innerRadius(LABEL_R).outerRadius(LABEL_R)
                    .centroid(b as any);
                return posA[1] - posB[1];
            });

        const drawLabel = (d: d3.PieArcDatum<ChartItem>, idx: number, sideItems: d3.PieArcDatum<ChartItem>[]) => {
            const midAngle = (d.startAngle + d.endAngle) / 2;
            const isRight = midAngle < Math.PI;

            const posA = arcGen.centroid(d as any);
            const posB = [
                Math.cos(midAngle - Math.PI / 2) * (OUTER_R + 18),
                Math.sin(midAngle - Math.PI / 2) * (OUTER_R + 18),
            ];

            // Y 간격 보정 (최소 22px 간격 보장)
            const baseY = posB[1];
            const minSpacing = 22;
            let adjustedY = baseY;

            if (idx > 0) {
                const prevY = (sideItems[idx - 1] as any).__labelY ?? posB[1];
                if (Math.abs(baseY - prevY) < minSpacing) {
                    adjustedY = prevY + (baseY >= prevY ? minSpacing : -minSpacing);
                }
            }
            (d as any).__labelY = adjustedY;

            const endX = isRight ? OUTER_R + 68 : -(OUTER_R + 68);
            const posC: [number, number] = [endX, adjustedY];

            const pct = ((d.data.value / total) * 100).toFixed(1);
            // 이름이 너무 길면 앞 8자만 표시 (ticker 숫자코드 대신)
            const shortName = d.data.name.length > 12 ? d.data.name.slice(0, 8) + "…" : d.data.name;

            // 지시선 (꺾인 선)
            labelGroup.append("polyline")
                .attr("points", `${posA[0]},${posA[1]} ${posB[0]},${posB[1]} ${posC[0]},${posC[1]}`)
                .attr("fill", "none")
                .attr("stroke", d.data.color)
                .attr("stroke-width", 1.2)
                .attr("opacity", 0.7);

            // 끝점 원형 마커
            labelGroup.append("circle")
                .attr("cx", posC[0])
                .attr("cy", posC[1])
                .attr("r", 2.5)
                .attr("fill", d.data.color)
                .attr("opacity", 0.9);

            const labelX = endX + (isRight ? 6 : -6);

            // 종목명 (상단)
            labelGroup.append("text")
                .attr("x", labelX)
                .attr("y", posC[1] - 5)
                .attr("text-anchor", isRight ? "start" : "end")
                .attr("fill", "#ffffff")
                .attr("font-size", "11px")
                .attr("font-weight", "600")
                .attr("letter-spacing", "0.02em")
                .text(shortName);

            // 티커 + 비중 (하단)
            labelGroup.append("text")
                .attr("x", labelX)
                .attr("y", posC[1] + 9)
                .attr("text-anchor", isRight ? "start" : "end")
                .attr("fill", "rgba(255,255,255,0.5)")
                .attr("font-size", "9.5px")
                .text(`${d.data.ticker}  ${pct}%`);
        };

        rightLabels.forEach((d, i) => drawLabel(d, i, rightLabels));
        leftLabels.forEach((d, i) => drawLabel(d, i, leftLabels));

        // 로고 이미지 (조각 중앙, 충분히 큰 조각에만) - 지시선보다 위에 올라오도록 마지막에 그리기
        g.selectAll(".logo")
            .data(pieData.filter((d) => d.endAngle - d.startAngle > 0.25))
            .enter()
            .append("image")
            .attr("class", "logo")
            .attr("href", (d) => d.data.logoUrl)
            .attr("width", 24)
            .attr("height", 24)
            .attr("x", -12)
            .attr("y", -12)
            .attr("transform", (d) => {
                const [x, y] = midArcGen.centroid(d as any);
                return `translate(${x},${y})`;
            })
            .attr("opacity", 0)
            .transition()
            .delay(500)
            .duration(400)
            .attr("opacity", 0.9);

        // 중앙 텍스트
        g.append("text")
            .attr("text-anchor", "middle")
            .attr("y", -16)
            .attr("fill", "rgba(255,255,255,0.4)")
            .attr("font-size", "11px")
            .attr("letter-spacing", "0.05em")
            .text("총 평가금액");

        const currencySymbol = displayCurrency === "USD" ? "$" : "₩";
        const formattedTotal = displayCurrency === "USD"
            ? total >= 1_000_000
                ? `${currencySymbol}${(total / 1_000_000).toFixed(2)}M`
                : `${currencySymbol}${total.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
            : total >= 1_000_000_000
                ? `${currencySymbol}${(total / 1_000_000_000).toFixed(2)}B`
                : `${currencySymbol}${total.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}`;

        g.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 10)
            .attr("fill", "#ffffff")
            .attr("font-size", "20px")
            .attr("font-weight", "700")
            .attr("letter-spacing", "-0.02em")
            .text(formattedTotal);

        g.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 28)
            .attr("fill", "rgba(255,255,255,0.3)")
            .attr("font-size", "10px")
            .text(`${chartItems.length}개 종목`);
    }, [chartItems]);

    if (rawItems.length === 0) {
        return (
            <div className="flex h-[600px] flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 text-neutral-500">
                <svg className="h-14 w-14 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p className="text-sm">아래에서 종목을 추가하면 차트가 표시됩니다</p>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center rounded-2xl border border-white/10 bg-white/5 p-4">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                className="w-full max-w-[864px]"
            />
        </div>
    );
}
