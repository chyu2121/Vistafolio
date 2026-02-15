// KRX Open API 클라이언트
// https://openapi.krx.co.kr/
// Base URL: https://data-dbg.krx.co.kr/svc/apis
// 인증: AUTH_KEY 쿼리 파라미터

interface KRXStockItem {
  ISU_CD: string;      // 종목코드 (단축코드)
  ISU_NM: string;      // 종목명
  MKT_NM: string;      // 시장명 (KOSPI, KOSDAQ, KONEX)
  SECT_TP_NM?: string; // 섹터 구분
  KIND_STKCERT_TP_NM?: string; // 종목 유형
}

interface KRXResponse {
  OutBlock_1: KRXStockItem[];
}

// 인메모리 캐시
let stockCache: KRXStockItem[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24시간

class KRXOpenAPIClient {
  private apiKey: string;
  private baseUrl = 'https://data-dbg.krx.co.kr/svc/apis';

  constructor() {
    this.apiKey = process.env.KRX_OPEN_API_KEY || '';

    if (!this.apiKey) {
      console.warn('KRX_OPEN_API_KEY not configured. KRX Open API features will be unavailable.');
    }
  }

  /**
   * 오늘 날짜를 YYYYMMDD 형식으로 반환 (거래일 기준)
   */
  private getBasDate(): string {
    const now = new Date();
    // 주말이면 금요일로 조정
    const day = now.getDay();
    if (day === 0) now.setDate(now.getDate() - 2); // 일요일 → 금요일
    if (day === 6) now.setDate(now.getDate() - 1); // 토요일 → 금요일

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }

  /**
   * 상장종목 전체 조회 (캐시 활용)
   */
  async getAllListedStocks(): Promise<KRXStockItem[]> {
    if (!this.apiKey) return [];

    // 캐시가 유효하면 반환
    const now = Date.now();
    if (stockCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return stockCache;
    }

    try {
      const basDd = this.getBasDate();
      const url = `${this.baseUrl}/sto/stk_isu_base_info?AUTH_KEY=${encodeURIComponent(this.apiKey)}&basDd=${basDd}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`KRX Open API request failed: ${response.status} ${response.statusText}`);
        return [];
      }

      const data: KRXResponse = await response.json();

      if (!data.OutBlock_1 || !Array.isArray(data.OutBlock_1)) {
        console.warn('KRX Open API returned unexpected response structure');
        return [];
      }

      // 캐시 갱신
      stockCache = data.OutBlock_1;
      cacheTimestamp = now;

      return stockCache;
    } catch (error) {
      console.error('KRX Open API getAllListedStocks error:', error);
      return [];
    }
  }

  /**
   * 종목 검색 (이름 또는 코드로 필터링)
   */
  async searchStock(keyword: string): Promise<
    Array<{
      code: string;
      name: string;
      market: string;
    }>
  > {
    if (!this.apiKey) {
      console.warn('KRX Open API key not available');
      return [];
    }

    try {
      const allStocks = await this.getAllListedStocks();
      if (allStocks.length === 0) return [];

      const kw = keyword.trim().toUpperCase();
      const isNumeric = /^\d+$/.test(kw);

      const filtered = allStocks.filter((item) => {
        if (!item.ISU_CD || !item.ISU_NM) return false;
        if (isNumeric) {
          // 숫자면 종목코드 포함 검색
          return item.ISU_CD.includes(kw);
        } else {
          // 문자면 종목명 포함 검색 (대소문자 무시)
          return item.ISU_NM.toUpperCase().includes(kw);
        }
      });

      return filtered.slice(0, 6).map((item) => ({
        code: item.ISU_CD.trim(),
        name: item.ISU_NM.trim(),
        market: this.normalizeMarket(item.MKT_NM),
      }));
    } catch (error) {
      console.error(`KRX Open API search error for "${keyword}":`, error);
      return [];
    }
  }

  /**
   * 시장구분 정규화
   */
  private normalizeMarket(mktNm: string): string {
    const mktMap: Record<string, string> = {
      '유가증권': 'KOSPI',
      'KOSPI': 'KOSPI',
      '코스닥': 'KOSDAQ',
      'KOSDAQ': 'KOSDAQ',
      '코넥스': 'KONEX',
      'KONEX': 'KONEX',
    };
    return mktMap[mktNm?.trim()] || mktNm || 'KOSPI';
  }

  /**
   * 시장명 → 거래소 코드 변환
   */
  getExchangeCode(market: string): string {
    const exchangeMap: Record<string, string> = {
      KOSPI: 'KS',
      KOSDAQ: 'KQ',
      KONEX: 'KN',
    };
    return exchangeMap[market] || 'KS';
  }
}

// 싱글톤 인스턴스
const krxOpenAPIClient = new KRXOpenAPIClient();

export default krxOpenAPIClient;
export { KRXOpenAPIClient };
