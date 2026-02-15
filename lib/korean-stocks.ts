// 한국 주식 & ETF 종합 매핑 데이터
// { 검색어(한글/영문) → { ticker, koName(한글명) } }

export const stockDatabase: Record<string, { ticker: string; koName: string }> = {
  // ========== KOSPI 대형주 ==========
  "삼성전자": { ticker: "005930.KS", koName: "삼성전자" },
  "삼성": { ticker: "005930.KS", koName: "삼성전자" },
  "현대차": { ticker: "005380.KS", koName: "현대차" },
  "현대": { ticker: "005380.KS", koName: "현대차" },
  "기아": { ticker: "000270.KS", koName: "기아" },
  "기아자동차": { ticker: "000270.KS", koName: "기아" },
  "lg전자": { ticker: "066570.KS", koName: "LG전자" },
  "lg": { ticker: "066570.KS", koName: "LG전자" },
  "naver": { ticker: "035420.KS", koName: "네이버" },
  "네이버": { ticker: "035420.KS", koName: "네이버" },
  "카카오": { ticker: "035720.KS", koName: "카카오" },
  "kakao": { ticker: "035720.KS", koName: "카카오" },
  "sk하이닉스": { ticker: "000660.KS", koName: "SK하이닉스" },
  "sk": { ticker: "000660.KS", koName: "SK하이닉스" },
  "lg화학": { ticker: "051910.KS", koName: "LG화학" },
  "포스코": { ticker: "005490.KS", koName: "포스코" },
  "현대로템": { ticker: "064350.KS", koName: "현대로템" },
  "현대중공업": { ticker: "009540.KS", koName: "현대중공업" },
  "한국전력": { ticker: "015760.KS", koName: "한국전력" },
  "한전": { ticker: "015760.KS", koName: "한국전력" },
  "삼성화학": { ticker: "009830.KS", koName: "삼성화학" },
  "삼성sdi": { ticker: "006400.KS", koName: "삼성SDI" },
  "삼성재": { ticker: "006400.KS", koName: "삼성SDI" },
  "삼성바이오": { ticker: "207940.KQ", koName: "삼성바이오로직스" },
  "삼성전기": { ticker: "009150.KS", koName: "삼성전기" },
  "sk이노베이션": { ticker: "096770.KS", koName: "SK이노베이션" },
  "lg에너지솔루션": { ticker: "373220.KS", koName: "LG에너지솔루션" },
  "한중엔시에스": { ticker: "054870.KQ", koName: "한중엔시에스" },
  "hanjungncs": { ticker: "107640.KQ", koName: "한중엔시에스" },
  "카카오뱅크": { ticker: "323410.KQ", koName: "카카오뱅크" },
  "카뱅": { ticker: "323410.KQ", koName: "카카오뱅크" },

  // ========== 한국 ETF ==========
  "tiger나스닥100": { ticker: "133690.KS", koName: "TIGER 나스닥100" },
  "tiger나스": { ticker: "133690.KS", koName: "TIGER 나스닥100" },
  "kodexs&p500": { ticker: "132030.KS", koName: "KODEX S&P500" },
  "kodexsp500": { ticker: "132030.KS", koName: "KODEX S&P500" },
  "kodex인버스": { ticker: "069500.KS", koName: "KODEX 인버스" },
  "kodexgold": { ticker: "132020.KS", koName: "KODEX 금" },
  "tiger천연가스": { ticker: "134790.KS", koName: "TIGER 천연가스" },

  // ========== 미국 ETF ==========
  "tsll": { ticker: "TSLL", koName: "TSLL" },
  "soxl": { ticker: "SOXL", koName: "SOXL" },
  "voo": { ticker: "VOO", koName: "VOO" },
  "spy": { ticker: "SPY", koName: "SPY" },
  "qqq": { ticker: "QQQ", koName: "QQQ" },
  "dia": { ticker: "DIA", koName: "DIA" },
  "tlt": { ticker: "TLT", koName: "TLT" },
  "ief": { ticker: "IEF", koName: "IEF" },
  "gld": { ticker: "GLD", koName: "GLD" },
  "eem": { ticker: "EEM", koName: "EEM" },

  // ========== 미국 주요 기업 ==========
  "aapl": { ticker: "AAPL", koName: "Apple" },
  "apple": { ticker: "AAPL", koName: "Apple" },
  "msft": { ticker: "MSFT", koName: "Microsoft" },
  "microsoft": { ticker: "MSFT", koName: "Microsoft" },
  "googl": { ticker: "GOOGL", koName: "Alphabet" },
  "google": { ticker: "GOOGL", koName: "Alphabet" },
  "amzn": { ticker: "AMZN", koName: "Amazon" },
  "amazon": { ticker: "AMZN", koName: "Amazon" },
  "nvda": { ticker: "NVDA", koName: "Nvidia" },
  "nvidia": { ticker: "NVDA", koName: "Nvidia" },
  "tsla": { ticker: "TSLA", koName: "Tesla" },
  "tesla": { ticker: "TSLA", koName: "Tesla" },
};

// 검색어를 처리하는 함수
export function findStock(query: string): { ticker: string; koName: string } | null {
  const normalized = query.toLowerCase().trim();

  // 정확한 매칭 시도
  if (stockDatabase[normalized]) {
    return stockDatabase[normalized];
  }

  // 부분 매칭 시도
  for (const [key, value] of Object.entries(stockDatabase)) {
    if (key.includes(normalized) || normalized.includes(key.slice(0, 3))) {
      return value;
    }
  }

  return null;
}

// 티커로부터 한글명 조회
export function getKoreanName(ticker: string): string {
  const upperTicker = ticker.toUpperCase().trim();

  // 정확한 매칭 (예: "054870.KS" === "054870.KS")
  for (const stock of Object.values(stockDatabase)) {
    if (stock.ticker.toUpperCase() === upperTicker) {
      return stock.koName;
    }
  }

  // 부분 매칭 - 기본 티커만 비교 (예: "054870" === "054870.KS")
  // Yahoo Finance 반환 형식이 다를 수 있기 때문
  for (const stock of Object.values(stockDatabase)) {
    const stockTickerBase = stock.ticker.split('.')[0].toUpperCase();
    const inputTickerBase = upperTicker.split('.')[0].toUpperCase();
    if (stockTickerBase === inputTickerBase) {
      return stock.koName;
    }
  }

  return ticker;
}

// 한국 주식 판별 (.KS, .KQ)
export function isKoreanStock(ticker: string): boolean {
  return ticker.includes(".KS") || ticker.includes(".KQ");
}

// 하위 호환성을 위한 함수
export function findKoreanStock(query: string): string | null {
  const result = findStock(query);
  return result?.ticker || null;
}
