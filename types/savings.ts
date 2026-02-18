export interface ProductOption {
    fin_co_no: string;
    fin_prdt_cd: string;
    intr_rate_type_nm: string;
    save_trm: string;
    intr_rate: number;
    intr_rate2: number;
    rsrv_type?: string;
    rsrv_type_nm?: string;
}

export interface Product {
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
    best_rate: number;
    // For bookmark compat
    type?: "deposit" | "saving";
    savedAt?: number;
}
