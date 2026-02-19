"use client";

import { useRouter, usePathname } from "next/navigation";

export const CATEGORIES = [
    { id: "all",         label: "전체" },
    { id: "stock_basic", label: "주식 입문" },
    { id: "etf",         label: "ETF·펀드" },
    { id: "savings",     label: "예적금·CMA" },
    { id: "tax_account", label: "절세 계좌" },
    { id: "dividend",    label: "배당 투자" },
    { id: "roadmap",     label: "재테크 로드맵" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

interface Props {
    current: string;
}

export default function CategoryTabs({ current }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    const handleClick = (id: string) => {
        const params = new URLSearchParams();
        if (id !== "all") params.set("category", id);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ id, label }) => {
                const active = current === id || (id === "all" && !current);
                return (
                    <button
                        key={id}
                        onClick={() => handleClick(id)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                            active
                                ? "bg-[#93C572] text-[#111] shadow-[0_0_12px_rgba(147,197,114,0.3)]"
                                : "border border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white"
                        }`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
