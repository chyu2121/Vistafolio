import { NextRequest, NextResponse } from "next/server";

const FINLIFE_BASE = "https://finlife.fss.or.kr/finlifeapi";
const AUTH = process.env.FINLIFE_API_KEY ?? "";

// 금융권역 코드
// 020000: 은행, 030200: 저축은행, 030300: 신협, 050000: 보험, 060000: 금융투자
const TOP_FIN_GRP_NO = "020000";

export interface ProductBase {
    fin_co_no: string;
    fin_prdt_cd: string;
    kor_co_nm: string;
    fin_prdt_nm: string;
    join_way: string;
    spcl_cnd: string;
    join_member: string;
    dcls_strt_day: string;
    dcls_end_day: string | null;
    max_limit: number | null;
    // 적금 전용
    rsrv_type_nm?: string;
}

export interface ProductOption {
    fin_co_no: string;
    fin_prdt_cd: string;
    intr_rate_type_nm: string;
    save_trm: string; // 개월 수 (문자열)
    intr_rate: number; // 기본금리
    intr_rate2: number; // 최고금리
    // 적금 전용
    rsrv_type?: string;
    rsrv_type_nm?: string;
}

export interface MergedProduct {
    fin_co_no: string;
    fin_prdt_cd: string;
    kor_co_nm: string;
    fin_prdt_nm: string;
    join_way: string;
    spcl_cnd: string;
    join_member: string;
    dcls_strt_day: string;
    max_limit: number | null;
    options: ProductOption[];
    // 최고금리 (옵션 중 최대값, 정렬용)
    best_rate: number;
    // 적금 전용
    rsrv_type_nm?: string;
}

async function fetchProducts(type: "deposit" | "saving"): Promise<MergedProduct[]> {
    const endpoint =
        type === "deposit"
            ? `${FINLIFE_BASE}/depositProductsSearch.json`
            : `${FINLIFE_BASE}/savingProductsSearch.json`;

    const url = `${endpoint}?auth=${AUTH}&topFinGrpNo=${TOP_FIN_GRP_NO}&pageNo=1`;

    const res = await fetch(url, { next: { revalidate: 3600 } }); // 1시간 캐시
    if (!res.ok) throw new Error(`finlife API error: ${res.status}`);

    const json = await res.json();
    const result = json?.result;
    if (!result || result.err_cd !== "000") {
        throw new Error(`finlife API returned error: ${result?.err_msg}`);
    }

    const baseList: ProductBase[] = result.baseList ?? [];
    const optionList: ProductOption[] = result.optionList ?? [];

    // baseList와 optionList를 fin_prdt_cd 기준으로 join
    const merged: MergedProduct[] = baseList.map((base) => {
        const options = optionList.filter(
            (opt) =>
                opt.fin_co_no === base.fin_co_no &&
                opt.fin_prdt_cd === base.fin_prdt_cd
        );
        const best_rate = options.reduce(
            (max, opt) => Math.max(max, opt.intr_rate2 ?? 0),
            0
        );
        return {
            fin_co_no: base.fin_co_no,
            fin_prdt_cd: base.fin_prdt_cd,
            kor_co_nm: base.kor_co_nm,
            fin_prdt_nm: base.fin_prdt_nm.replace(/\n/g, " ").trim(),
            join_way: base.join_way,
            spcl_cnd: base.spcl_cnd,
            join_member: base.join_member,
            dcls_strt_day: base.dcls_strt_day,
            max_limit: base.max_limit,
            options,
            best_rate,
        };
    });

    // 최고금리 내림차순 정렬
    return merged.sort((a, b) => b.best_rate - a.best_rate);
}

export async function GET(req: NextRequest) {
    const type = (req.nextUrl.searchParams.get("type") ?? "deposit") as
        | "deposit"
        | "saving";

    if (!AUTH) {
        return NextResponse.json(
            { error: "FINLIFE_API_KEY is not configured" },
            { status: 500 }
        );
    }

    try {
        const products = await fetchProducts(type);
        return NextResponse.json({ products });
    } catch (err) {
        console.error("[savings API]", err);
        return NextResponse.json(
            { error: "Failed to fetch savings products" },
            { status: 502 }
        );
    }
}
