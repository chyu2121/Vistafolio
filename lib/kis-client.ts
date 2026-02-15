// 한국투자증권 API 클라이언트
// https://apiportal.koreainvestment.com/

interface KISAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expiresAt: number;
}

interface KISStock {
  stck_cntg_hour: string;
  prdy_vrss_sign: string;
  prdy_vrss: string;
  stck_oprc: string;
  stck_hgpr: string;
  stck_lwpr: string;
  stck_clpr: string;
  acml_vol: string;
  acml_tr_pbmn: string;
  cpfn: string;
  rstc_wdth_prc: string;
  stck_fcam: string;
  stck_sspr: string;
  aspr_unit: string;
  hts_frgn_ehrt: string;
  frgn_ntby_qty: string;
  pgtr_rate: string;
  sgtr_rate: string;
  shtn_ovrs_rate: string;
  tvol: string;
  tvolq: string;
  new_hgpr: string;
  new_lwpr: string;
  prdy_oprc: string;
  prdy_hgpr: string;
  prdy_lwpr: string;
  iscd_stat_clcd: string;
  marg_rate: string;
  beta: string;
  eps: string;
  per: string;
  roe: string;
  pbr: string;
  sps: string;
  vol_tnrt: string;
  nv: string;
}

interface KISSearchResult {
  output: Array<{
    symbol: string;
    corpName: string;
    market: string; // KOSPI, KOSDAQ, etc
  }>;
}

class KISClient {
  private appKey: string;
  private appSecret: string;
  private baseUrl = 'https://openapi.koreainvestment.com';
  private tokenUrl = 'https://oauth2.koreainvestment.com/oauth2/tokenP';
  private token: KISAuthToken | null = null;

  constructor() {
    this.appKey = process.env.KIS_APPKEY || '';
    this.appSecret = process.env.KIS_APPSECRET || '';

    if (!this.appKey || !this.appSecret) {
      console.warn('KIS API keys not configured. Korean stock features will be unavailable.');
    }
  }

  /**
   * 토큰 발급 (매 요청마다 새로 발급)
   */
  private async getToken(): Promise<string> {
    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          appkey: this.appKey,
          appsecret: this.appSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.statusText}`);
      }

      const data: KISAuthToken = await response.json();
      this.token = {
        ...data,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      return data.access_token;
    } catch (error) {
      console.error('KIS token error:', error);
      throw error;
    }
  }

  /**
   * 현재가 조회
   * @param symbol 종목코드 (예: 005930 for 삼성전자)
   */
  async getPrice(symbol: string): Promise<{ price: number; currency: string } | null> {
    if (!this.appKey || !this.appSecret) {
      return null;
    }

    try {
      const token = await this.getToken();

      const response = await fetch(
        `${this.baseUrl}/uapi/domestic-stock/v1/quotations/inquire-price?fid_cond_mrkt_div_code=J&fid_input_iscd=${symbol}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'appkey': this.appKey,
            'appsecret': this.appSecret,
            'tr_id': 'FHKST01010100',
          },
        }
      );

      if (!response.ok) {
        console.warn(`KIS price request failed for ${symbol}: ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      if (data.output) {
        const price = parseFloat(data.output.stck_clpr || data.output.stck_prpr);
        return {
          price,
          currency: 'KRW',
        };
      }

      return null;
    } catch (error) {
      console.error(`KIS price error for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * 종목 검색
   * @param keyword 검색어 (한글명 또는 영문명)
   */
  async searchStock(keyword: string): Promise<
    Array<{
      symbol: string;
      name: string;
      market: string;
      exchange: string;
    }>
  > {
    if (!this.appKey || !this.appSecret) {
      return [];
    }

    try {
      const token = await this.getToken();

      const response = await fetch(
        `${this.baseUrl}/uapi/domestic-stock/v1/quotations/search-stock?keyword=${encodeURIComponent(keyword)}&limit=20`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'appkey': this.appKey,
            'appsecret': this.appSecret,
            'tr_id': 'CTPF1604R',
          },
        }
      );

      if (!response.ok) {
        console.warn(`KIS search failed for "${keyword}": ${response.statusText}`);
        return [];
      }

      const data = await response.json();

      if (!data.output || !Array.isArray(data.output)) {
        return [];
      }

      return data.output
        .map((item: any) => ({
          symbol: item.stck_shrn_iscd || item.symbol,
          name: item.htsell400 || item.corpName || '',
          market: item.market === 'K' ? 'KOSPI' : item.market === 'Q' ? 'KOSDAQ' : 'KONEX',
          exchange: item.market === 'K' ? 'KS' : item.market === 'Q' ? 'KQ' : 'KN',
        }))
        .slice(0, 6); // 상위 6개만 반환
    } catch (error) {
      console.error(`KIS search error for "${keyword}":`, error);
      return [];
    }
  }

  /**
   * 종목 정보 조회
   */
  async getStockInfo(symbol: string): Promise<any> {
    if (!this.appKey || !this.appSecret) {
      return null;
    }

    try {
      const token = await this.getToken();

      const response = await fetch(
        `${this.baseUrl}/uapi/domestic-stock/v1/quotations/inquire-price?fid_cond_mrkt_div_code=J&fid_input_iscd=${symbol}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'appkey': this.appKey,
            'appsecret': this.appSecret,
            'tr_id': 'FHKST01010100',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`KIS stock info error for ${symbol}:`, error);
      return null;
    }
  }
}

// 싱글톤 인스턴스
const kisClient = new KISClient();

export default kisClient;
export type { KISClient, KISStock, KISSearchResult };
