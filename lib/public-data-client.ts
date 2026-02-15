// 공공데이터포털 KRX 상장종목정보 API 클라이언트
// https://www.data.go.kr/data/15094775/openapi.do

interface PublicDataStock {
  basDt: string; // 기준일자
  srtnCd: string; // 단축코드 (예: 005930)
  isinCd: string; // ISIN코드
  mktDiv: string; // 시장구분 (KOSPI, KOSDAQ, KONEX)
  itmsNm: string; // 종목명
  crno: string; // 법인등록번호
  corpNm: string; // 법인명
}

interface PublicDataResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
    body: {
      items: {
        item: PublicDataStock[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

class PublicDataClient {
  private apiKey: string;
  private baseUrl = 'https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo';

  constructor() {
    this.apiKey = process.env.PUBLIC_DATA_API_KEY || '';

    if (!this.apiKey) {
      console.warn('PUBLIC_DATA_API_KEY not configured. KRX data features will be unavailable.');
    }
  }

  /**
   * 종목 검색
   * @param keyword 검색어 (종목명 또는 단축코드)
   * @param pageNo 페이지 번호 (기본값: 1)
   */
  async searchStock(keyword: string, pageNo: number = 1): Promise<
    Array<{
      code: string;
      name: string;
      market: string;
    }>
  > {
    if (!this.apiKey) {
      console.warn('KRX API key not available');
      return [];
    }

    try {
      // 단축코드 또는 종목명으로 검색 (포함 검색)
      const params = new URLSearchParams({
        serviceKey: this.apiKey,
        pageNo: String(pageNo),
        numOfRows: '100',
        resultType: 'json',
        // 검색어 - 종목명 또는 단축코드 (포함 검색 사용)
        ...(keyword.match(/^\d+$/)
          ? { likeSrtnCd: keyword } // 숫자면 코드로 포함 검색
          : { likeItmsNm: keyword }), // 아니면 종목명으로 포함 검색
      });

      const url = `${this.baseUrl}?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`Public Data API request failed: ${response.statusText}`);
        return [];
      }

      const data: PublicDataResponse = await response.json();

      if (
        data.response.header.resultCode !== '00' ||
        !data.response.body.items?.item
      ) {
        console.warn(`Public Data API returned no results or error: ${data.response.header.resultMsg}`);
        return [];
      }

      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      return items
        .filter((item) => item.srtnCd && item.itmsNm)
        .map((item) => ({
          code: item.srtnCd,
          name: item.itmsNm,
          market: this.normalizeMarket(item.mktDiv),
        }))
        .slice(0, 6); // 상위 6개만 반환
    } catch (error) {
      console.error(`Public Data search error for "${keyword}":`, error);
      return [];
    }
  }

  /**
   * 시장구분 정규화 (KOSPI → KS, KOSDAQ → KQ 등)
   */
  private normalizeMarket(mktDiv: string): string {
    const mktMap: Record<string, string> = {
      KOSPI: 'KOSPI',
      KOSDAQ: 'KOSDAQ',
      KONEX: 'KONEX',
      'Y': 'KOSPI',
      'K': 'KOSDAQ',
      'N': 'KONEX',
    };

    return mktMap[mktDiv] || mktDiv;
  }

  /**
   * 시장구분 코드로 변환 (.KS, .KQ 등)
   */
  getExchangeCode(market: string): string {
    const exchangeMap: Record<string, string> = {
      KOSPI: 'KS',
      KOSDAQ: 'KQ',
      KONEX: 'KN',
    };

    return exchangeMap[market] || 'KS';
  }

  /**
   * 모든 상장종목 조회 (캐싱용)
   * 주의: 초기 로드 시간이 길 수 있으니 서버 스타트업 시 실행 권장
   */
  async getAllStocks(pageNo: number = 1): Promise<PublicDataStock[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        serviceKey: this.apiKey,
        pageNo: String(pageNo),
        numOfRows: '100',
        resultType: 'json',
      });

      const url = `${this.baseUrl}?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      const data: PublicDataResponse = await response.json();

      if (
        data.response.header.resultCode !== '00' ||
        !data.response.body.items?.item
      ) {
        return [];
      }

      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      return items;
    } catch (error) {
      console.error('Public Data getAllStocks error:', error);
      return [];
    }
  }
}

// 싱글톤 인스턴스
const publicDataClient = new PublicDataClient();

export default publicDataClient;
export { PublicDataClient, PublicDataStock };
