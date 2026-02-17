// 한국 주식 현재가 조회 (무료 대안)
// Naver 금융에서 크롤링

class KoreanStockPriceClient {
  private baseUrl = 'https://finance.naver.com';

  /**
   * Naver 금융에서 한국 주식 현재가 조회
   * @param symbol 종목코드 (예: 005930 for 삼성전자)
   */
  async getPrice(symbol: string): Promise<{ price: number; currency: string } | null> {
    try {
      const url = `${this.baseUrl}/item/main.naver?code=${symbol}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'ko-KR,ko;q=0.9',
          'Referer': 'https://finance.naver.com/',
        },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch price for ${symbol}: ${response.statusText}`);
        return null;
      }

      const html = await response.text();

      // Naver 금융 현재가: no_up(상승), no_down(하락), no_static(보합) 클래스 모두 처리
      const priceMatch = html.match(
        /<strong[^>]*class="[^"]*(?:no_up|no_down|no_static)[^"]*"[^>]*><span[^>]*>([0-9,]+)<\/span>/
      );

      if (priceMatch && priceMatch[1]) {
        const price = parseFloat(priceMatch[1].replace(/,/g, ''));
        if (!isNaN(price) && price > 0) {
          return { price, currency: 'KRW' };
        }
      }

      // 대체 패턴 1: strong 태그 내부 span 없는 경우
      const altMatch1 = html.match(
        /<strong[^>]*class="[^"]*(?:no_up|no_down|no_static)[^"]*"[^>]*>([0-9,]+)<\/strong>/
      );
      if (altMatch1 && altMatch1[1]) {
        const price = parseFloat(altMatch1[1].replace(/,/g, ''));
        if (!isNaN(price) && price > 0) {
          return { price, currency: 'KRW' };
        }
      }

      // 대체 패턴 2: blind 태그 기반
      const altMatch2 = html.match(
        /<span class="blind">현재가<\/span>[\s\S]*?<strong[^>]*>([0-9,]+)<\/strong>/
      );
      if (altMatch2 && altMatch2[1]) {
        const price = parseFloat(altMatch2[1].replace(/,/g, ''));
        if (!isNaN(price) && price > 0) {
          return { price, currency: 'KRW' };
        }
      }

      console.warn(`Could not extract price from HTML for ${symbol}`);
      return null;
    } catch (error) {
      console.error(`Korean stock price error for ${symbol}:`, error);
      return null;
    }
  }
}

const koreanStockPriceClient = new KoreanStockPriceClient();
export default koreanStockPriceClient;
