// Naver 금융 웹 페이지에서 현재가 추출 (크롤링)
// 우선주 포함 모든 한국 주식을 지원

class NaverStockPrice {
  /**
   * Naver 금융 페이지에서 현재가 추출
   * @param symbol 종목코드 (예: 005930 for 삼성전자, 005385 for 현대차 우B)
   */
  async getPrice(symbol: string): Promise<{ price: number; currency: string } | null> {
    try {
      const url = `https://finance.naver.com/item/main.naver?code=${symbol}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://finance.naver.com/',
        },
      });

      if (!response.ok) {
        console.warn(`Naver page fetch failed for ${symbol}: ${response.statusText}`);
        return null;
      }

      const html = await response.text();

      // 패턴: <dd> 안에 "현재가" 텍스트 다음 숫자 추출
      // 형식: <dd>현재가 181,200 전일대비 ...
      let priceMatch = html.match(/<dd>현재가\s+([0-9,]+)\s/);

      if (priceMatch && priceMatch[1]) {
        const price = parseFloat(priceMatch[1].replace(/,/g, ''));
        if (!isNaN(price)) {
          return {
            price,
            currency: 'KRW',
          };
        }
      }

      // 폴백: em 태그 내 숫자 찾기
      const emMatch = html.match(/<em[^>]*class="[^"]*(?:no_up|no_down|up|down)[^"]*"[^>]*>([0-9,]+)/);
      if (emMatch && emMatch[1]) {
        const price = parseFloat(emMatch[1].replace(/,/g, ''));
        if (!isNaN(price)) {
          return {
            price,
            currency: 'KRW',
          };
        }
      }

      console.warn(`Could not extract price from HTML for ${symbol}`);
      return null;
    } catch (error) {
      console.error(`Naver stock price error for ${symbol}:`, error);
      return null;
    }
  }
}

const naverStockPrice = new NaverStockPrice();
export default naverStockPrice;
