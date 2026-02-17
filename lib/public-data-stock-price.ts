// 공공데이터포털 금융위원회_주식시세정보 API 클라이언트
// https://www.data.go.kr/data/15094808/openapi.do

interface StockPriceResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: Array<{
          basDt: string;      // 기준일자
          isinCd: string;     // ISIN코드
          mrktCtg: string;    // 시장구분
          itmsNm: string;     // 종목명
          clpr: number | string;  // 종가
          vs: number | string;    // 전일대비
          nrsRate: number | string; // 등락률
          trqu: number | string;  // 거래량
          trms: number | string;  // 거래대금
        }>;
      };
    };
  };
}

interface KrxStockListResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: Array<{
          srtnCd: string;   // 단축코드 (예: A005930)
          isinCd: string;   // ISIN코드
          itmsNm: string;   // 종목명
          mrktCtg: string;  // 시장구분
        }>;
      };
    };
  };
}

class PublicDataStockPrice {
  private apiKey: string;
  private priceBaseUrl = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';
  private krxBaseUrl = 'https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo';
  private isinCache: Map<string, string> = new Map(); // symbol -> ISIN 매핑 캐시

  constructor() {
    this.apiKey = process.env.PUBLIC_DATA_STOCK_API_KEY || '';

    if (!this.apiKey) {
      console.warn('PUBLIC_DATA_STOCK_API_KEY not configured. Korean stock price features will be unavailable.');
    }
  }

  /**
   * 종목코드로부터 ISIN 코드 조회 (KRX 상장종목정보 API 이용)
   * @param symbol 종목코드 (예: 005930)
   */
  private async getIsinCode(symbol: string): Promise<string | null> {
    // 캐시 확인
    if (this.isinCache.has(symbol)) {
      return this.isinCache.get(symbol) || null;
    }

    if (!this.apiKey) {
      return null;
    }

    try {
      const params = new URLSearchParams({
        serviceKey: this.apiKey,
        numOfRows: '100',
        pageNo: '1',
        resultType: 'json',
        likeSrtnCd: symbol,
      });

      const url = `${this.krxBaseUrl}?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`KRX API request failed for ${symbol}: ${response.statusText}`);
        return null;
      }

      const data: KrxStockListResponse = await response.json();

      if (
        data.response.header.resultCode !== '00' ||
        !data.response.body.items?.item
      ) {
        console.warn(`KRX API returned no results for ${symbol}`);
        return null;
      }

      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      // 정확히 일치하는 종목 찾기 (srtnCd에서 'A' 제거 후 비교)
      const matchedItem = items.find(item => {
        const code = item.srtnCd.replace(/^A/, '');
        return code === symbol;
      });

      if (matchedItem) {
        this.isinCache.set(symbol, matchedItem.isinCd);
        return matchedItem.isinCd;
      }

      console.warn(`Could not find ISIN for symbol ${symbol}`);
      return null;
    } catch (error) {
      console.error(`Error getting ISIN for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * 종목 현재가 조회
   * @param symbol 종목코드 (예: 005930 for 삼성전자)
   */
  async getPrice(symbol: string): Promise<{ price: number; currency: string } | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      // 1단계: ISIN 코드 조회
      const isinCd = await this.getIsinCode(symbol);
      if (!isinCd) {
        console.warn(`Could not get ISIN code for symbol ${symbol}`);
        return null;
      }

      // 2단계: ISIN으로 주가 조회
      const params = new URLSearchParams({
        serviceKey: this.apiKey,
        numOfRows: '10',
        pageNo: '1',
        resultType: 'json',
        isinCd: isinCd,
      });

      const url = `${this.priceBaseUrl}?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`Public Data Stock API request failed: ${response.statusText}`);
        return null;
      }

      const data: StockPriceResponse = await response.json();

      if (
        data.response.header.resultCode !== '00' ||
        !data.response.body.items?.item ||
        data.response.body.items.item.length === 0
      ) {
        console.warn(`Public Data Stock API returned no results: ${data.response.header.resultMsg}`);
        return null;
      }

      const item = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item[0]
        : data.response.body.items.item;

      // 종가 추출 (숫자로 변환)
      const price = typeof item.clpr === 'string'
        ? parseFloat(item.clpr)
        : item.clpr;

      if (isNaN(price)) {
        console.warn(`Invalid price value for ${symbol}: ${item.clpr}`);
        return null;
      }

      return {
        price,
        currency: 'KRW',
      };
    } catch (error) {
      console.error(`Public Data stock price error for ${symbol}:`, error);
      return null;
    }
  }
}

const publicDataStockPrice = new PublicDataStockPrice();

// Naver 금융 폴백을 위한 동적 임포트 (순환 참조 방지)
let naverStockPrice: any = null;

async function getNaverClient() {
  if (!naverStockPrice) {
    try {
      const module = await import('./naver-stock-price');
      naverStockPrice = module.default;
    } catch (error) {
      console.error('Failed to load Naver stock price client:', error);
    }
  }
  return naverStockPrice;
}

// 공공데이터포털 실패 시 Naver로 폴백하는 래퍼 함수
export async function getPriceWithFallback(symbol: string): Promise<{ price: number; currency: string } | null> {
  // 1차: 공공데이터포털 시도
  const publicDataResult = await publicDataStockPrice.getPrice(symbol);
  if (publicDataResult) {
    return publicDataResult;
  }

  // 2차: Naver 금융 폴백
  console.log(`Public Data API failed for ${symbol}, trying Naver...`);
  const naverClient = await getNaverClient();
  if (naverClient) {
    return await naverClient.getPrice(symbol);
  }

  return null;
}

export default publicDataStockPrice;
