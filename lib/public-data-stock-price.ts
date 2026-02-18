// 공공데이터포털 금융위원회_주식시세정보 API 클라이언트
// https://www.data.go.kr/data/15094808/openapi.do
// 전일 종가 기준 (D+1, 매 영업일 오후 1시 갱신)

interface StockPriceItem {
  basDt: string;
  isinCd: string;
  mrktCtg: string;
  itmsNm: string;
  clpr: number | string;  // 종가
}

interface StockPriceResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      items: { item: StockPriceItem | StockPriceItem[] };
      totalCount: number;
    };
  };
}

class PublicDataStockPrice {
  private apiKey: string;
  private priceUrl = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';

  constructor() {
    this.apiKey = process.env.PUBLIC_DATA_STOCK_API_KEY || '';
    if (!this.apiKey) {
      console.warn('PUBLIC_DATA_STOCK_API_KEY not configured.');
    }
  }

  /**
   * 종목코드로 전일 종가 조회
   * @param symbol 종목코드 6자리 (예: 005930)
   */
  async getPrice(symbol: string): Promise<{ price: number; currency: string } | null> {
    if (!this.apiKey) return null;

    try {
      // 종목코드로 직접 조회 (ISIN 조회 단계 불필요)
      const params = new URLSearchParams({
        serviceKey: this.apiKey,
        numOfRows: '5',
        pageNo: '1',
        resultType: 'json',
        likeSrtnCd: symbol,
      });

      const response = await fetch(`${this.priceUrl}?${params}`, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        console.warn(`Stock price API failed for ${symbol}: ${response.status}`);
        return null;
      }

      const data: StockPriceResponse = await response.json();

      if (
        data.response.header.resultCode !== '00' ||
        !data.response.body.items?.item
      ) {
        console.warn(`Stock price API no result for ${symbol}: ${data.response.header.resultMsg}`);
        return null;
      }

      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      if (items.length === 0) return null;

      const price = typeof items[0].clpr === 'string'
        ? parseFloat(items[0].clpr)
        : items[0].clpr;

      if (isNaN(price) || price <= 0) {
        console.warn(`Invalid price for ${symbol}: ${items[0].clpr}`);
        return null;
      }

      return { price, currency: 'KRW' };
    } catch (error) {
      console.error(`Stock price error for ${symbol}:`, error);
      return null;
    }
  }
}

const publicDataStockPrice = new PublicDataStockPrice();

export async function getPriceWithFallback(symbol: string): Promise<{ price: number; currency: string } | null> {
  return await publicDataStockPrice.getPrice(symbol);
}

export default publicDataStockPrice;
