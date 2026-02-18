"use client";

import { useState, useMemo } from "react";
import {
    Building2,
    Smartphone,
    Globe,
    Star,
    Clock,
    Users,
    Calculator,
    ChevronDown,
} from "lucide-react";
import { useSavingsBookmark } from "@/hooks/useSavingsBookmark";
import { Product } from "@/types/savings";
import {
    TERM_LABELS,
    POPULAR_TERMS,
    formatDate,
    formatLimit,
    formatWon,
    getJoinWayIcons,
    rateColor,
    calcResult
} from "./utils";

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

function RateBar({ base, max }: { base: number; max: number }) {
    const globalMax = 7;
    const baseW = Math.min((base / globalMax) * 100, 100);
    const maxW = Math.min((max / globalMax) * 100, 100);
    return (
        <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="absolute inset-y-0 left-0 rounded-full bg-white/20" style={{ width: `${maxW}%` }} />
            <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${baseW}%`, background: "linear-gradient(90deg, #93C572, #bef264)" }}
            />
        </div>
    );
}

function TermBadge({
    term, base, max, selected, onClick,
}: {
    term: string; base: number; max: number; selected: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-all text-xs font-medium ${selected
                ? "border-[#93C572] bg-[#93C572]/20 text-[#93C572]"
                : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10"
                }`}
        >
            <span className="text-slate-400 mb-0.5">{TERM_LABELS[term] ?? `${term}개월`}</span>
            <span className="text-white font-bold">{max.toFixed(2)}%</span>
            <span className="text-slate-500 text-[10px]">기본 {base.toFixed(2)}%</span>
        </button>
    );
}

// ─── 계산기 섹션 ──────────────────────────────────────────────────────────────

function CalcSection({
    product,
    tab,
    termMap,
    color,
}: {
    product: Product;
    tab: "deposit" | "saving";
    termMap: Record<string, { base: number; max: number }>;
    color: string;
}) {
    const terms = Object.keys(termMap).sort((a, b) => Number(a) - Number(b));

    // 기본 기간: 12개월이 있으면 12, 없으면 첫번째
    const defaultTerm = terms.includes("12") ? "12" : (terms[0] ?? "12");
    const [calcTerm, setCalcTerm] = useState(defaultTerm);
    const [rawInput, setRawInput] = useState("");

    // 최대한도 (원 단위)
    const maxLimit = product.max_limit;

    // 입력값 → 숫자
    const amount = Number(rawInput.replace(/[^0-9]/g, "")) || 0;

    // 선택 기간의 최고금리 사용
    const rate = termMap[calcTerm]?.max ?? 0;

    const result = useMemo(
        () => calcResult(tab, amount, rate, Number(calcTerm)),
        [tab, amount, rate, calcTerm]
    );

    // 최대한도 적용 버튼
    const applyMax = () => {
        if (maxLimit) setRawInput(maxLimit.toString());
    };

    const handleInput = (v: string) => {
        const num = v.replace(/[^0-9]/g, "");
        setRawInput(num);
    };

    const displayValue = amount > 0 ? amount.toLocaleString() : "";

    return (
        <div className="px-5 pb-5 border-t border-white/5">
            <p className="text-xs font-semibold text-[#93C572] mb-3 flex items-center gap-1.5 pt-3">
                <Calculator size={11} />
                세후 수령액 계산
            </p>

            {/* 기간 선택 */}
            <div className="flex gap-1.5 flex-wrap mb-3">
                {terms.map((t) => (
                    <button
                        key={t}
                        onClick={() => setCalcTerm(t)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${calcTerm === t
                            ? "border-[#93C572] bg-[#93C572]/20 text-[#93C572]"
                            : "border-white/10 bg-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300"
                            }`}
                    >
                        {TERM_LABELS[t] ?? `${t}개월`}
                        <span className="ml-1 text-[10px] opacity-70">{termMap[t].max.toFixed(2)}%</span>
                    </button>
                ))}
            </div>

            {/* 금액 입력 */}
            <div className="relative mb-2">
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder={tab === "deposit" ? "예치금액 입력 (원)" : "월 납입액 입력 (원)"}
                    value={displayValue}
                    onChange={(e) => handleInput(e.target.value.replace(/,/g, ""))}
                    className="w-full px-3 py-2.5 pr-20 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#93C572]/50 transition-all"
                />
                {maxLimit && (
                    <button
                        onClick={applyMax}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-[#93C572]/20 border border-[#93C572]/30 text-[#93C572] text-[10px] font-semibold hover:bg-[#93C572]/30 transition-all whitespace-nowrap"
                    >
                        최대 {formatLimit(maxLimit)}
                    </button>
                )}
            </div>

            {/* 결과 */}
            {result && amount > 0 ? (
                <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/5 flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                            {tab === "deposit" ? "원금" : `총 납입액 (${calcTerm}개월)`}
                        </span>
                        <span className="text-xs text-slate-300 font-medium">
                            {formatWon(result.principal)}
                        </span>
                    </div>
                    <div className="px-3 py-2 border-b border-white/5 flex justify-between items-center">
                        <span className="text-xs text-slate-500">세전 이자</span>
                        <span className="text-xs text-slate-300">
                            +{formatWon(result.grossInterest)}
                        </span>
                    </div>
                    <div className="px-3 py-2 border-b border-white/5 flex justify-between items-center">
                        <span className="text-xs text-slate-500">이자소득세 (15.4%)</span>
                        <span className="text-xs text-red-400">
                            −{formatWon(result.tax)}
                        </span>
                    </div>
                    <div className="px-3 py-2.5 flex justify-between items-center bg-white/5">
                        <span className="text-xs font-bold text-white">세후 수령액</span>
                        <span className="text-sm font-black" style={{ color }}>
                            {formatWon(result.netTotal)}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl bg-white/5 border border-dashed border-white/10 px-3 py-4 text-center text-xs text-slate-600">
                    금액을 입력하면 세후 수령액을 계산합니다
                </div>
            )}
        </div>
    );
}

// ─── 상품 카드 ────────────────────────────────────────────────────────────────

// ─── 상품 카드 ────────────────────────────────────────────────────────────────

export default function ProductCard({
    product, tab,
}: {
    product: Product; tab: "deposit" | "saving";
}) {
    const [expanded, setExpanded] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

    // Bookmark Hook
    const { isBookmarked, toggleBookmark } = useSavingsBookmark();
    const bookmarked = isBookmarked(product.fin_prdt_cd);

    const termMap = useMemo(() => {
        const map: Record<string, { base: number; max: number }> = {};
        for (const opt of product.options) {
            const trm = opt.save_trm;
            if (!map[trm] || opt.intr_rate2 > map[trm].max) {
                map[trm] = { base: opt.intr_rate, max: opt.intr_rate2 };
            }
        }
        return map;
    }, [product.options]);

    const terms = Object.keys(termMap).sort((a, b) => Number(a) - Number(b));
    const displayTerms = terms.filter((t) => POPULAR_TERMS.includes(t));
    const allTerms = terms;

    const selectedData = selectedTerm ? termMap[selectedTerm] : null;
    const highlightRate = selectedData?.max ?? product.best_rate;
    const highlightBase = selectedData?.base ?? (product.options[0]?.intr_rate ?? 0);

    const color = rateColor(product.best_rate);

    return (
        <div
            className="relative rounded-2xl border border-white/10 bg-slate-800/60 hover:border-white/20 transition-all duration-300 overflow-hidden"
        >
            {/* 북마크 버튼 */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // 저장 시 타입과 함께 저장
                        const type = product.type ?? tab;
                        toggleBookmark(product, type);
                    }}
                    className={`p-1.5 rounded-full transition-all hover:bg-white/10 ${bookmarked ? "text-yellow-400" : "text-slate-500 hover:text-white"
                        }`}
                >
                    <Star
                        size={18}
                        className={`transition-all ${bookmarked ? "fill-yellow-400" : ""}`}
                    />
                </button>
            </div>


            {/* 상단 정보 */}
            <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                        style={{ background: `${color}22`, color }}
                    >
                        {product.kor_co_nm.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                        <p className="text-xs text-slate-400 mb-0.5">{product.kor_co_nm}</p>
                        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
                            {product.fin_prdt_nm}
                        </h3>
                    </div>
                </div>

                {/* 최고금리 */}
                <div className="mb-4">
                    <div className="flex items-end gap-2 mb-1">
                        <span className="text-3xl font-black" style={{ color }}>
                            {highlightRate.toFixed(2)}
                        </span>
                        <span className="text-lg font-bold text-slate-300 mb-0.5">%</span>
                        <span className="text-xs text-slate-500 mb-1 ml-1">최고금리</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                        <span>기본 {highlightBase.toFixed(2)}%</span>
                        <span>·</span>
                        <span>우대 +{(highlightRate - highlightBase).toFixed(2)}%</span>
                    </div>
                    <RateBar base={highlightBase} max={highlightRate} />
                </div>

                {/* 기간 선택 */}
                {displayTerms.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mb-4">
                        {displayTerms.map((t) => (
                            <TermBadge
                                key={t}
                                term={t}
                                base={termMap[t].base}
                                max={termMap[t].max}
                                selected={selectedTerm === t}
                                onClick={() => setSelectedTerm((prev) => (prev === t ? null : t))}
                            />
                        ))}
                    </div>
                )}

                {/* 가입방법 */}
                <div className="flex gap-1.5 flex-wrap mb-3">
                    {getJoinWayIcons(product.join_way).map((way) => (
                        <span
                            key={way}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400"
                        >
                            {way.includes("스마트폰") ? <Smartphone size={10} /> : way.includes("인터넷") ? <Globe size={10} /> : <Building2 size={10} />}
                            {way}
                        </span>
                    ))}
                </div>

                <p className="text-xs text-slate-500 line-clamp-1">
                    <Users size={10} className="inline mr-1" />
                    {product.join_member}
                </p>
            </div>

            {/* ── 세후 수령액 계산기 ── */}
            <CalcSection product={product} tab={tab} termMap={termMap} color={color} />

            {/* 우대조건 및 상세 토글 */}
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-3 border-t border-white/5 text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
                <span>우대조건 및 상세</span>
                <ChevronDown
                    size={14}
                    className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                />
            </button>

            {expanded && (
                <div className="px-5 pb-5 space-y-3 border-t border-white/5">
                    {product.spcl_cnd && product.spcl_cnd !== "해당사항 없음" && product.spcl_cnd !== "없음" && (
                        <div>
                            <p className="text-xs font-semibold text-[#93C572] mb-1 flex items-center gap-1">
                                <Star size={10} /> 우대조건
                            </p>
                            <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">
                                {product.spcl_cnd}
                            </p>
                        </div>
                    )}

                    {allTerms.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                                <Clock size={10} /> 기간별 금리
                            </p>
                            <div className="rounded-xl overflow-hidden border border-white/10">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-white/5 text-slate-500">
                                            <th className="py-1.5 px-3 text-left font-medium">기간</th>
                                            <th className="py-1.5 px-3 text-right font-medium">기본금리</th>
                                            <th className="py-1.5 px-3 text-right font-medium">최고금리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allTerms.map((t) => (
                                            <tr key={t} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-1.5 px-3 text-slate-300">{TERM_LABELS[t] ?? `${t}개월`}</td>
                                                <td className="py-1.5 px-3 text-right text-slate-400">{termMap[t].base.toFixed(2)}%</td>
                                                <td className="py-1.5 px-3 text-right font-bold" style={{ color }}>{termMap[t].max.toFixed(2)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 text-xs text-slate-500">
                        <span><span className="text-slate-600">한도 </span>{formatLimit(product.max_limit)}</span>
                        <span><span className="text-slate-600">공시 </span>{formatDate(product.dcls_strt_day)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
