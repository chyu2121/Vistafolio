// 한국 주식 유틸리티
// 종목 검색/시세는 공공데이터포털 API (public-data-client.ts, public-data-stock-price.ts) 가 담당
// 이 파일은 로고 매핑, 티커 판별 유틸만 제공

/**
 * 한국 주식 판별 (.KS = KOSPI, .KQ = KOSDAQ, .KN = KONEX)
 */
export function isKoreanStock(ticker: string): boolean {
  return ticker.includes(".KS") || ticker.includes(".KQ") || ticker.includes(".KN");
}


// 한국 주식 로고 URL 매핑 (공공데이터포털이 로고를 제공하지 않으므로 유지)
export const koreanStockLogos: Record<string, string> = {
  "005930.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/1200px-Samsung_Logo.svg.png",
  "005380.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Hyundai_Motor_Company_logo.svg/1200px-Hyundai_Motor_Company_logo.svg.png",
  "000270.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Kia_logo.svg/1200px-Kia_logo.svg.png",
  "066570.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/LG_logo_%282015%29.svg/1200px-LG_logo_%282015%29.svg.png",
  "035420.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Naver_logo.svg/1200px-Naver_logo.svg.png",
  "035720.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Kakao_logo.svg/1200px-Kakao_logo.svg.png",
  "000660.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/SK_Hynix_logo.svg/1200px-SK_Hynix_logo.svg.png",
  "051910.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/LG_logo_%282015%29.svg/1200px-LG_logo_%282015%29.svg.png",
  "005490.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Posco_logo.svg/1200px-Posco_logo.svg.png",
  "323410.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Kakao_Bank_logo.svg/1200px-Kakao_Bank_logo.svg.png",
  "000100.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Yuhan.svg/1200px-Yuhan.svg.png",
  "003490.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Korean_Air_logo.svg/1200px-Korean_Air_logo.svg.png",
  "207940.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Samsung_Biologics.svg/1200px-Samsung_Biologics.svg.png",
  "373220.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/LG_logo_%282015%29.svg/1200px-LG_logo_%282015%29.svg.png",
  "006400.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/1200px-Samsung_Logo.svg.png",
  "352820.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/HIVE_logo.svg/1200px-HIVE_logo.svg.png",
  "259960.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Krafton_Logo.svg/1200px-Krafton_Logo.svg.png",
  "034020.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Doosan_logo.svg/1200px-Doosan_logo.svg.png",
  "009150.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/1200px-Samsung_Logo.svg.png",
  "017670.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/SK_Telecom_logo.svg/1200px-SK_Telecom_logo.svg.png",
  "034730.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/SK_logo.svg/1200px-SK_logo.svg.png",
  "028260.KS": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/1200px-Samsung_Logo.svg.png",
};
