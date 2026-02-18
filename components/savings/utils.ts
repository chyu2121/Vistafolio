export const TERM_LABELS: Record<string, string> = {
    "1": "1개월",
    "3": "3개월",
    "6": "6개월",
    "12": "12개월",
    "24": "24개월",
    "36": "36개월",
};

export const POPULAR_TERMS = ["6", "12", "24", "36"];
export const TAX_RATE = 0.154;

export function formatDate(yyyymmdd: string) {
    if (!yyyymmdd || yyyymmdd.length < 8) return "-";
    return `${yyyymmdd.slice(0, 4)}.${yyyymmdd.slice(4, 6)}.${yyyymmdd.slice(6, 8)}`;
}

export function formatLimit(limit: number | null) {
    if (!limit) return "제한없음";
    if (limit >= 100_000_000) return `${(limit / 100_000_000).toFixed(0)}억원`;
    if (limit >= 10_000) return `${(limit / 10_000).toFixed(0)}만원`;
    return `${limit.toLocaleString()}원`;
}

export function formatWon(amount: number) {
    if (amount >= 100_000_000) {
        const uk = Math.floor(amount / 100_000_000);
        const man = Math.round((amount % 100_000_000) / 10_000);
        return man > 0 ? `${uk}억 ${man.toLocaleString()}만원` : `${uk}억원`;
    }
    if (amount >= 10_000) return `${Math.round(amount / 10_000).toLocaleString()}만원`;
    return `${Math.round(amount).toLocaleString()}원`;
}

export function getJoinWayIcons(joinWay: string) {
    const ways = joinWay.split(",").map((w) => w.trim());
    return ways.slice(0, 3);
}

export function rateColor(rate: number) {
    // 4.0% 이상: 피스타치오 (#93C572)
    // 3.0% 이상: 밝은 그린 (#86efac)
    // 그 외: 슬레이트 (#cbd5e1)
    if (rate >= 4.0) return "#93C572";
    if (rate >= 3.0) return "#86efac";
    return "#cbd5e1";
}

export function calcResult(
    type: "deposit" | "saving",
    amount: number,
    rate: number,
    termMonths: number
) {
    if (!amount || !rate || !termMonths) return null;
    const r = rate / 100;

    let principal: number;
    let grossInterest: number;

    if (type === "deposit") {
        principal = amount;
        grossInterest = principal * r * (termMonths / 12);
    } else {
        principal = amount * termMonths;
        grossInterest = amount * r * (termMonths * (termMonths + 1)) / (2 * 12);
    }

    const tax = grossInterest * TAX_RATE;
    const netInterest = grossInterest - tax;
    const netTotal = principal + netInterest;

    return { principal, grossInterest, tax, netInterest, netTotal };
}
