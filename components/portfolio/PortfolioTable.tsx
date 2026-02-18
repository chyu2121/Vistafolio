"use client";

import React, { useState, useRef, useEffect } from "react";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { PortfolioEntry } from "@/hooks/usePortfolio";


interface PortfolioTableProps {
    entries: PortfolioEntry[];
    onRemove: (id: string) => void;
    displayCurrency: "USD" | "KRW";
    exchangeRate: number;
    onUpdate?: (id: string, updates: Partial<PortfolioEntry>) => void;
}

interface EditableNumberProps {
    value: number;
    onUpdate: (value: number) => void;
    format: (value: number) => React.ReactNode;
}

function EditableNumber({ value, onUpdate, format }: EditableNumberProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        const num = parseFloat(localValue);
        if (!isNaN(num) && num >= 0) {
            onUpdate(num);
        } else {
            setLocalValue(value.toString()); // revert
        }
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                    ref={inputRef}
                    type="number"
                    step="any"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") {
                            setLocalValue(value.toString());
                            setIsEditing(false);
                        }
                    }}
                    className="w-24 rounded bg-white/10 px-2 py-1 text-right text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#93C572]"
                />
            </div>
        );
    }

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                setLocalValue(value.toString());
                setIsEditing(true);
            }}
            className="group/edit flex items-center gap-1 rounded px-1.5 py-0.5 -ml-1.5 transition-colors hover:bg-white/5 hover:text-white"
        >
            {format(value)}
            <span className="opacity-0 transition-opacity group-hover/edit:opacity-100 text-[10px] text-[#93C572] ml-1">
                ✎
            </span>
        </button>
    );
}

function formatCurrency(value: number, currency: "USD" | "KRW"): string {
    if (currency === "KRW") {
        return `₩${value.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}`;
    }
    return `$${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatPrice(value: number | null, currency: "USD" | "KRW"): string {
    if (value === null) return "—";
    return formatCurrency(value, currency);
}

function convertPrice(price: number | null, fromCurrency: "USD" | "KRW", toCurrency: "USD" | "KRW", exchangeRate: number): number | null {
    if (price === null) return null;
    if (fromCurrency === toCurrency) return price;

    if (fromCurrency === "USD" && toCurrency === "KRW") {
        return price * exchangeRate;
    } else if (fromCurrency === "KRW" && toCurrency === "USD") {
        return price / exchangeRate;
    }
    return price;
}

export default function PortfolioTable({ entries, onRemove, displayCurrency, exchangeRate, onUpdate }: PortfolioTableProps) {
    if (entries.length === 0) {
        return (
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-neutral-500">
                추가된 종목이 없습니다
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                    <thead>
                        <tr className="border-b border-white/10">
                            {[
                                "종목명",
                                "티커",
                                "보유수량",
                                "평균단가",
                                "현재가",
                                "수익률",
                                "총매입금액",
                                "평가금액",
                                "",
                            ].map((h) => (
                                <th
                                    key={h}
                                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-neutral-400"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {entries.map((entry) => {
                            // 모든 가격을 displayCurrency로 변환
                            const convertedAvgPrice = convertPrice(entry.avgPrice, entry.currency, displayCurrency, exchangeRate) ?? 0;
                            const convertedCurrentPrice = convertPrice(entry.currentPrice, entry.currency, displayCurrency, exchangeRate);

                            const currentValue =
                                convertedCurrentPrice !== null
                                    ? entry.quantity * convertedCurrentPrice
                                    : null;
                            const totalBuy = entry.quantity * convertedAvgPrice;
                            const profitRate =
                                convertedCurrentPrice !== null
                                    ? ((convertedCurrentPrice - convertedAvgPrice) / convertedAvgPrice) * 100
                                    : null;
                            const isProfit = profitRate !== null && profitRate >= 0;

                            return (
                                <tr
                                    key={entry.id}
                                    className="group transition-colors hover:bg-white/[0.03]"
                                >
                                    {/* 종목명 */}
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={entry.logoUrl}
                                                alt={entry.ticker}
                                                className="h-5 w-5 rounded-sm object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = "none";
                                                }}
                                            />
                                            <span className="font-medium text-white">
                                                {entry.name}
                                            </span>
                                        </div>
                                    </td>

                                    {/* 티커 */}
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <span className="rounded-md bg-white/8 px-2 py-0.5 font-mono text-xs text-neutral-300">
                                            {entry.ticker}
                                        </span>
                                    </td>

                                    {/* 보유수량 */}
                                    <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                                        {onUpdate ? (
                                            <EditableNumber
                                                value={entry.quantity}
                                                onUpdate={(newQty) => onUpdate(entry.id, { quantity: newQty })}
                                                format={(val) => (
                                                    <span className="flex items-baseline gap-1">
                                                        <span>{val.toLocaleString("en-US")}</span>
                                                        <span className="text-xs text-neutral-500">주</span>
                                                    </span>
                                                )}
                                            />
                                        ) : (
                                            <span>
                                                {entry.quantity.toLocaleString("en-US")}
                                                <span className="ml-1 text-xs text-neutral-500">주</span>
                                            </span>
                                        )}
                                    </td>

                                    {/* 평균단가 */}
                                    <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                                        {onUpdate ? (
                                            <EditableNumber
                                                value={convertedAvgPrice}
                                                onUpdate={(newVal) => {
                                                    const originalPrice = convertPrice(newVal, displayCurrency, entry.currency, exchangeRate);
                                                    if (originalPrice !== null) {
                                                        onUpdate(entry.id, { avgPrice: originalPrice });
                                                    }
                                                }}
                                                format={(val) => formatCurrency(val, displayCurrency)}
                                            />
                                        ) : (
                                            formatCurrency(convertedAvgPrice, displayCurrency)
                                        )}
                                    </td>

                                    {/* 현재가 */}
                                    <td className="whitespace-nowrap px-4 py-3">
                                        {convertedCurrentPrice !== null ? (
                                            <span
                                                className="text-white"
                                            >
                                                {formatPrice(convertedCurrentPrice, displayCurrency)}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-neutral-500">
                                                <div className="h-3 w-3 animate-spin rounded-full border border-neutral-600 border-t-neutral-400" />
                                                조회 중
                                            </span>
                                        )}
                                    </td>

                                    {/* 수익률 */}
                                    <td className="whitespace-nowrap px-4 py-3">
                                        {profitRate === null ? (
                                            <span className="text-neutral-500">—</span>
                                        ) : (
                                            <span
                                                className={`flex items-center gap-1 font-semibold ${isProfit ? "text-[#FF0000]" : "text-[#0000FF]"
                                                    }`}
                                            >
                                                {isProfit ? (
                                                    <TrendingUp className="h-3.5 w-3.5" />
                                                ) : (
                                                    <TrendingDown className="h-3.5 w-3.5" />
                                                )}
                                                {isProfit ? "+" : ""}
                                                {profitRate.toFixed(2)}%
                                            </span>
                                        )}
                                    </td>

                                    {/* 총매입금액 */}
                                    <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                                        {formatCurrency(totalBuy, displayCurrency)}
                                    </td>

                                    {/* 평가금액 */}
                                    <td className="whitespace-nowrap px-4 py-3">
                                        {currentValue !== null ? (
                                            <span
                                                className={
                                                    profitRate !== null && profitRate >= 0
                                                        ? "text-[#FF0000]"
                                                        : profitRate !== null
                                                            ? "text-[#0000FF]"
                                                            : "text-neutral-300"
                                                }
                                            >
                                                {formatCurrency(currentValue, displayCurrency)}
                                                <span className="ml-1 text-xs opacity-80">
                                                    ({currentValue >= totalBuy ? "+" : "-"}
                                                    {formatCurrency(Math.abs(currentValue - totalBuy), displayCurrency)})
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="text-neutral-500">—</span>
                                        )}
                                    </td>

                                    {/* 삭제 */}
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => onRemove(entry.id)}
                                            className="text-neutral-600 opacity-0 transition-all group-hover:opacity-100 hover:text-rose-400"
                                            title="종목 삭제"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* 합계 행 */}
            <div className="border-t border-white/10 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>총 {entries.length}개 종목</span>
                    <div className="flex gap-6">
                        {(() => {
                            let totalBuy = 0;
                            let totalEval = 0;

                            entries.forEach((e) => {
                                const convertedAvgPrice = convertPrice(e.avgPrice, e.currency, displayCurrency, exchangeRate) ?? 0;
                                const convertedCurrentPrice = convertPrice(e.currentPrice, e.currency, displayCurrency, exchangeRate);

                                totalBuy += e.quantity * convertedAvgPrice;
                                if (convertedCurrentPrice !== null) {
                                    totalEval += e.quantity * convertedCurrentPrice;
                                }
                            });

                            const sign = totalEval >= totalBuy ? "+" : "";
                            const diff = totalEval - totalBuy;
                            const pct = totalBuy > 0 ? (diff / totalBuy) * 100 : 0;

                            return (
                                <span className="flex items-center gap-1.5">
                                    <span className="text-neutral-500">{displayCurrency}</span>
                                    <span className={pct >= 0 ? "text-[#FF0000]" : "text-[#0000FF]"}>
                                        {sign}{pct.toFixed(2)}%
                                    </span>
                                </span>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}
