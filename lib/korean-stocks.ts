// 한국 주식 & ETF 종합 매핑 데이터
// 로컬 DB는 KRX/공공데이터포털 API의 폴백 역할
// { ticker → koName } 매핑이 정규화된 형태로 저장됨

export interface StockEntry {
  ticker: string;
  koName: string;
  market: 'KOSPI' | 'KOSDAQ';
}

// 정규화된 종목 데이터베이스 (ticker 기준, 중복 없음)
export const stockEntries: StockEntry[] = [
  // ========== KOSPI 시가총액 상위 ==========
  { ticker: "005930.KS", koName: "삼성전자", market: "KOSPI" },
  { ticker: "000660.KS", koName: "SK하이닉스", market: "KOSPI" },
  { ticker: "373220.KS", koName: "LG에너지솔루션", market: "KOSPI" },
  { ticker: "207940.KS", koName: "삼성바이오로직스", market: "KOSPI" },
  { ticker: "005380.KS", koName: "현대차", market: "KOSPI" },
  { ticker: "000270.KS", koName: "기아", market: "KOSPI" },
  { ticker: "068270.KS", koName: "셀트리온", market: "KOSPI" },
  { ticker: "005490.KS", koName: "POSCO홀딩스", market: "KOSPI" },
  { ticker: "035420.KS", koName: "NAVER", market: "KOSPI" },
  { ticker: "035720.KS", koName: "카카오", market: "KOSPI" },
  { ticker: "006400.KS", koName: "삼성SDI", market: "KOSPI" },
  { ticker: "051910.KS", koName: "LG화학", market: "KOSPI" },
  { ticker: "028260.KS", koName: "삼성물산", market: "KOSPI" },
  { ticker: "012450.KS", koName: "한화에어로스페이스", market: "KOSPI" },
  { ticker: "066570.KS", koName: "LG전자", market: "KOSPI" },
  { ticker: "003550.KS", koName: "LG", market: "KOSPI" },
  { ticker: "105560.KS", koName: "KB금융", market: "KOSPI" },
  { ticker: "055550.KS", koName: "신한지주", market: "KOSPI" },
  { ticker: "086790.KS", koName: "하나금융지주", market: "KOSPI" },
  { ticker: "032830.KS", koName: "삼성생명", market: "KOSPI" },
  { ticker: "015760.KS", koName: "한국전력", market: "KOSPI" },
  { ticker: "009150.KS", koName: "삼성전기", market: "KOSPI" },
  { ticker: "017670.KS", koName: "SK텔레콤", market: "KOSPI" },
  { ticker: "034730.KS", koName: "SK", market: "KOSPI" },
  { ticker: "096770.KS", koName: "SK이노베이션", market: "KOSPI" },
  { ticker: "003670.KS", koName: "포스코퓨처엠", market: "KOSPI" },
  { ticker: "033780.KS", koName: "KT&G", market: "KOSPI" },
  { ticker: "138040.KS", koName: "메리츠금융지주", market: "KOSPI" },
  { ticker: "010130.KS", koName: "고려아연", market: "KOSPI" },
  { ticker: "009540.KS", koName: "한국조선해양", market: "KOSPI" },
  { ticker: "329180.KS", koName: "HD현대중공업", market: "KOSPI" },
  { ticker: "267250.KS", koName: "HD현대", market: "KOSPI" },
  { ticker: "042660.KS", koName: "한화오션", market: "KOSPI" },
  { ticker: "009830.KS", koName: "한화솔루션", market: "KOSPI" },
  { ticker: "000810.KS", koName: "삼성화재", market: "KOSPI" },
  { ticker: "018260.KS", koName: "삼성에스디에스", market: "KOSPI" },
  { ticker: "011170.KS", koName: "롯데케미칼", market: "KOSPI" },
  { ticker: "030200.KS", koName: "KT", market: "KOSPI" },
  { ticker: "036570.KS", koName: "엔씨소프트", market: "KOSPI" },
  { ticker: "012330.KS", koName: "현대모비스", market: "KOSPI" },
  { ticker: "011200.KS", koName: "HMM", market: "KOSPI" },
  { ticker: "010950.KS", koName: "S-Oil", market: "KOSPI" },
  { ticker: "034020.KS", koName: "두산에너빌리티", market: "KOSPI" },
  { ticker: "047050.KS", koName: "포스코인터내셔널", market: "KOSPI" },
  { ticker: "323410.KS", koName: "카카오뱅크", market: "KOSPI" },
  { ticker: "352820.KS", koName: "하이브", market: "KOSPI" },
  { ticker: "259960.KS", koName: "크래프톤", market: "KOSPI" },
  { ticker: "316140.KS", koName: "우리금융지주", market: "KOSPI" },
  { ticker: "024110.KS", koName: "기업은행", market: "KOSPI" },
  { ticker: "010140.KS", koName: "삼성중공업", market: "KOSPI" },
  { ticker: "009240.KS", koName: "한샘", market: "KOSPI" },
  { ticker: "004020.KS", koName: "현대제철", market: "KOSPI" },
  { ticker: "021240.KS", koName: "코웨이", market: "KOSPI" },
  { ticker: "011790.KS", koName: "SKC", market: "KOSPI" },
  { ticker: "336260.KS", koName: "두산퓨얼셀", market: "KOSPI" },
  { ticker: "064350.KS", koName: "현대로템", market: "KOSPI" },
  { ticker: "003490.KS", koName: "대한항공", market: "KOSPI" },
  { ticker: "180640.KS", koName: "한진칼", market: "KOSPI" },
  { ticker: "402340.KS", koName: "SK스퀘어", market: "KOSPI" },
  { ticker: "000100.KS", koName: "유한양행", market: "KOSPI" },
  { ticker: "006800.KS", koName: "미래에셋증권", market: "KOSPI" },
  { ticker: "161390.KS", koName: "한국타이어앤테크놀로지", market: "KOSPI" },
  { ticker: "078930.KS", koName: "GS", market: "KOSPI" },
  { ticker: "326030.KS", koName: "SK바이오팜", market: "KOSPI" },
  { ticker: "097950.KS", koName: "CJ제일제당", market: "KOSPI" },
  { ticker: "051900.KS", koName: "LG생활건강", market: "KOSPI" },
  { ticker: "090430.KS", koName: "아모레퍼시픽", market: "KOSPI" },
  { ticker: "000120.KS", koName: "CJ대한통운", market: "KOSPI" },
  { ticker: "016360.KS", koName: "삼성증권", market: "KOSPI" },
  { ticker: "088350.KS", koName: "한화생명", market: "KOSPI" },
  { ticker: "010620.KS", koName: "현대미포조선", market: "KOSPI" },
  { ticker: "271560.KS", koName: "오리온", market: "KOSPI" },
  { ticker: "128940.KS", koName: "한미약품", market: "KOSPI" },
  { ticker: "000880.KS", koName: "한화", market: "KOSPI" },
  { ticker: "302440.KS", koName: "SK바이오사이언스", market: "KOSPI" },
  { ticker: "003410.KS", koName: "쌍용C&E", market: "KOSPI" },
  { ticker: "006360.KS", koName: "GS건설", market: "KOSPI" },
  { ticker: "011780.KS", koName: "금호석유", market: "KOSPI" },
  { ticker: "377300.KS", koName: "카카오페이", market: "KOSPI" },
  { ticker: "001570.KS", koName: "금양", market: "KOSPI" },
  { ticker: "010060.KS", koName: "OCI홀딩스", market: "KOSPI" },
  { ticker: "281820.KS", koName: "케이씨텍", market: "KOSPI" },
  { ticker: "361610.KS", koName: "SK아이이테크놀로지", market: "KOSPI" },
  { ticker: "241560.KS", koName: "두산밥캣", market: "KOSPI" },
  { ticker: "007070.KS", koName: "GS리테일", market: "KOSPI" },
  { ticker: "000720.KS", koName: "현대건설", market: "KOSPI" },
  { ticker: "004170.KS", koName: "신세계", market: "KOSPI" },
  { ticker: "139480.KS", koName: "이마트", market: "KOSPI" },
  { ticker: "002790.KS", koName: "아모레G", market: "KOSPI" },
  { ticker: "032640.KS", koName: "LG유플러스", market: "KOSPI" },
  { ticker: "003240.KS", koName: "태광산업", market: "KOSPI" },
  { ticker: "005830.KS", koName: "DB손해보험", market: "KOSPI" },
  { ticker: "071050.KS", koName: "한국금융지주", market: "KOSPI" },
  { ticker: "003090.KS", koName: "대웅", market: "KOSPI" },
  { ticker: "069960.KS", koName: "현대백화점", market: "KOSPI" },
  { ticker: "009420.KS", koName: "한올바이오파마", market: "KOSPI" },
  { ticker: "035250.KS", koName: "강원랜드", market: "KOSPI" },
  { ticker: "047810.KS", koName: "한국항공우주", market: "KOSPI" },
  { ticker: "004990.KS", koName: "롯데지주", market: "KOSPI" },
  { ticker: "005940.KS", koName: "NH투자증권", market: "KOSPI" },
  { ticker: "071970.KS", koName: "STX중공업", market: "KOSPI" },

  // ========== KOSDAQ 주요 종목 ==========
  { ticker: "247540.KQ", koName: "에코프로비엠", market: "KOSDAQ" },
  { ticker: "086520.KQ", koName: "에코프로", market: "KOSDAQ" },
  { ticker: "263750.KQ", koName: "펄어비스", market: "KOSDAQ" },
  { ticker: "293490.KQ", koName: "카카오게임즈", market: "KOSDAQ" },
  { ticker: "196170.KQ", koName: "알테오젠", market: "KOSDAQ" },
  { ticker: "403870.KQ", koName: "HPSP", market: "KOSDAQ" },
  { ticker: "112040.KQ", koName: "위메이드", market: "KOSDAQ" },
  { ticker: "145020.KQ", koName: "휴젤", market: "KOSDAQ" },
  { ticker: "095340.KQ", koName: "ISC", market: "KOSDAQ" },
  { ticker: "036930.KQ", koName: "주성엔지니어링", market: "KOSDAQ" },
  { ticker: "058470.KQ", koName: "리노공업", market: "KOSDAQ" },
  { ticker: "041510.KQ", koName: "에스엠", market: "KOSDAQ" },
  { ticker: "035900.KQ", koName: "JYP Ent.", market: "KOSDAQ" },
  { ticker: "278280.KQ", koName: "천보", market: "KOSDAQ" },
  { ticker: "039030.KQ", koName: "이오테크닉스", market: "KOSDAQ" },
  { ticker: "257720.KQ", koName: "실리콘투", market: "KOSDAQ" },
  { ticker: "383310.KQ", koName: "에코프로에이치엔", market: "KOSDAQ" },
  { ticker: "005290.KQ", koName: "동진쎄미켐", market: "KOSDAQ" },
  { ticker: "336570.KQ", koName: "원텍", market: "KOSDAQ" },
  { ticker: "078340.KQ", koName: "컴투스", market: "KOSDAQ" },
  { ticker: "067310.KQ", koName: "하나마이크론", market: "KOSDAQ" },
  { ticker: "054870.KQ", koName: "한중엔시에스", market: "KOSDAQ" },
  { ticker: "060310.KQ", koName: "3S", market: "KOSDAQ" },
  { ticker: "141080.KQ", koName: "레고켐바이오", market: "KOSDAQ" },
  { ticker: "328130.KQ", koName: "루닛", market: "KOSDAQ" },
  { ticker: "377480.KQ", koName: "자람테크놀로지", market: "KOSDAQ" },
  { ticker: "357780.KQ", koName: "솔브레인", market: "KOSDAQ" },
  { ticker: "092870.KQ", koName: "엑시콘", market: "KOSDAQ" },
  { ticker: "240810.KQ", koName: "원익IPS", market: "KOSDAQ" },
  { ticker: "131970.KQ", koName: "테스나", market: "KOSDAQ" },
  { ticker: "214150.KQ", koName: "클래시스", market: "KOSDAQ" },
  { ticker: "137310.KQ", koName: "에스디바이오센서", market: "KOSDAQ" },
  { ticker: "222160.KQ", koName: "NPX반도체", market: "KOSDAQ" },
  { ticker: "228760.KQ", koName: "지노믹트리", market: "KOSDAQ" },
  { ticker: "067630.KQ", koName: "에이치엘비", market: "KOSDAQ" },
  { ticker: "950140.KQ", koName: "잉글우드랩", market: "KOSDAQ" },
];

// ========== 한국 ETF ==========
export const etfEntries: StockEntry[] = [
  { ticker: "069500.KS", koName: "KODEX 200", market: "KOSPI" },
  { ticker: "114800.KS", koName: "KODEX 인버스", market: "KOSPI" },
  { ticker: "122630.KS", koName: "KODEX 레버리지", market: "KOSPI" },
  { ticker: "229200.KS", koName: "KODEX 코스닥150", market: "KOSPI" },
  { ticker: "133690.KS", koName: "TIGER 나스닥100", market: "KOSPI" },
  { ticker: "360750.KS", koName: "TIGER 미국S&P500", market: "KOSPI" },
  { ticker: "381170.KS", koName: "TIGER 미국테크TOP10 INDXX", market: "KOSPI" },
  { ticker: "379800.KS", koName: "KODEX 미국S&P500TR", market: "KOSPI" },
  { ticker: "379810.KS", koName: "KODEX 미국나스닥100TR", market: "KOSPI" },
  { ticker: "132030.KS", koName: "KODEX 골드선물(H)", market: "KOSPI" },
  { ticker: "148020.KS", koName: "KBSTAR 200", market: "KOSPI" },
  { ticker: "252670.KS", koName: "KODEX 200선물인버스2X", market: "KOSPI" },
  { ticker: "305720.KS", koName: "KODEX 2차전지산업", market: "KOSPI" },
  { ticker: "364690.KS", koName: "KODEX 반도체", market: "KOSPI" },
  { ticker: "455850.KS", koName: "KODEX 미국빅테크10(H)", market: "KOSPI" },
  { ticker: "102110.KS", koName: "TIGER 200", market: "KOSPI" },
  { ticker: "091160.KS", koName: "KODEX 반도체", market: "KOSPI" },
  { ticker: "466920.KS", koName: "TIGER 미국필라델피아반도체나스닥", market: "KOSPI" },
  { ticker: "395160.KS", koName: "TIGER 미국배당+7%프리미엄다우존스", market: "KOSPI" },
  { ticker: "411060.KS", koName: "ACE 미국빅테크TOP7 Plus", market: "KOSPI" },
];

// 검색용 별칭 매핑 (검색어 → ticker)
// 사용자가 흔히 입력하는 검색어를 정확한 ticker로 연결
const searchAliases: Record<string, string> = {
  // 한글 별칭
  "삼성": "005930.KS",
  "삼전": "005930.KS",
  "하이닉스": "000660.KS",
  "현대자동차": "005380.KS",
  "기아자동차": "000270.KS",
  "네이버": "035420.KS",
  "한전": "015760.KS",
  "포스코": "005490.KS",
  "카뱅": "323410.KS",
  "현대중공업": "329180.KS",
  "한국항공": "047810.KS",
  "두산에너": "034020.KS",
  "에코프로bm": "247540.KQ",
  "삼바": "207940.KS",
  "삼성바이오": "207940.KS",
  "한화에어로": "012450.KS",
  "한화에어": "012450.KS",
  "oci": "010060.KS",
  "oci홀딩스": "010060.KS",
  "크래프톤": "259960.KS",
  "대한항공": "003490.KS",
  "삼성sdi": "006400.KS",
  // 영문 별칭
  "samsung": "005930.KS",
  "hyundai": "005380.KS",
  "kakao": "035720.KS",
  "naver": "035420.KS",
  "posco": "005490.KS",
  "celltrion": "068270.KS",
  "hive": "352820.KS",
  "krafton": "259960.KS",
};

// 모든 종목 (주식 + ETF) 통합
const allEntries = [...stockEntries, ...etfEntries];

// ticker → StockEntry 빠른 검색용 인덱스
const tickerIndex = new Map<string, StockEntry>();
for (const entry of allEntries) {
  tickerIndex.set(entry.ticker.toUpperCase(), entry);
}

// ========== 미국 주식 (기존 호환성) ==========
export const globalStocks: Record<string, { ticker: string; koName: string }> = {
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
  "meta": { ticker: "META", koName: "Meta" },
  "nflx": { ticker: "NFLX", koName: "Netflix" },
  "netflix": { ticker: "NFLX", koName: "Netflix" },
  // ETF
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
};

/**
 * 로컬 DB에서 한국 종목 검색 (복수 결과 반환)
 * KRX/공공데이터포털 API 폴백용
 */
export function searchStocks(query: string): Array<{ ticker: string; name: string; market: string }> {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: Array<{ ticker: string; name: string; market: string }> = [];
  const seen = new Set<string>();

  // 1. 별칭 정확 매칭
  if (searchAliases[q]) {
    const entry = tickerIndex.get(searchAliases[q].toUpperCase());
    if (entry) {
      results.push({ ticker: entry.ticker, name: entry.koName, market: entry.market });
      seen.add(entry.ticker);
    }
  }

  // 2. 종목명 포함 매칭
  for (const entry of allEntries) {
    if (seen.has(entry.ticker)) continue;
    if (entry.koName.toLowerCase().includes(q)) {
      results.push({ ticker: entry.ticker, name: entry.koName, market: entry.market });
      seen.add(entry.ticker);
    }
    if (results.length >= 8) break;
  }

  // 3. 종목코드 매칭 (숫자 입력 시)
  if (/^\d+$/.test(q) && results.length < 8) {
    for (const entry of allEntries) {
      if (seen.has(entry.ticker)) continue;
      const code = entry.ticker.split('.')[0];
      if (code.includes(q)) {
        results.push({ ticker: entry.ticker, name: entry.koName, market: entry.market });
        seen.add(entry.ticker);
      }
      if (results.length >= 8) break;
    }
  }

  return results.slice(0, 8);
}

/**
 * 정확한 검색 (단일 결과) - 기존 호환성
 */
export function findStock(query: string): { ticker: string; koName: string } | null {
  const normalized = query.toLowerCase().trim();

  // 별칭 매칭
  if (searchAliases[normalized]) {
    const entry = tickerIndex.get(searchAliases[normalized].toUpperCase());
    if (entry) return { ticker: entry.ticker, koName: entry.koName };
  }

  // 종목명 정확 매칭
  for (const entry of allEntries) {
    if (entry.koName.toLowerCase() === normalized) {
      return { ticker: entry.ticker, koName: entry.koName };
    }
  }

  // 글로벌 주식 매칭
  if (globalStocks[normalized]) {
    return globalStocks[normalized];
  }

  return null;
}

/**
 * 티커로부터 한글명 조회 (로컬 DB에 있는 경우만 반환)
 */
export function getKoreanName(ticker: string): string | null {
  const upperTicker = ticker.toUpperCase().trim();

  // 정확한 매칭
  const entry = tickerIndex.get(upperTicker);
  if (entry) return entry.koName;

  // 부분 매칭 - 기본 코드만 비교 (예: "005930" vs "005930.KS")
  const inputBase = upperTicker.split('.')[0];
  for (const e of allEntries) {
    if (e.ticker.split('.')[0] === inputBase) {
      return e.koName;
    }
  }

  // 글로벌 주식
  for (const stock of Object.values(globalStocks)) {
    if (stock.ticker.toUpperCase() === upperTicker) {
      return stock.koName;
    }
  }

  return null;
}

// 한국 주식 판별 (.KS, .KQ)
export function isKoreanStock(ticker: string): boolean {
  return ticker.includes(".KS") || ticker.includes(".KQ");
}

// 한국 주식 로고 URL 매핑
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
};

// 하위 호환성을 위한 함수
export function findKoreanStock(query: string): string | null {
  const result = findStock(query);
  return result?.ticker || null;
}

// 기존 호환성: stockDatabase 형태로 접근 가능
export const stockDatabase: Record<string, { ticker: string; koName: string }> = (() => {
  const db: Record<string, { ticker: string; koName: string }> = {};
  for (const entry of allEntries) {
    db[entry.koName.toLowerCase()] = { ticker: entry.ticker, koName: entry.koName };
  }
  for (const [alias, ticker] of Object.entries(searchAliases)) {
    const entry = tickerIndex.get(ticker.toUpperCase());
    if (entry) {
      db[alias] = { ticker: entry.ticker, koName: entry.koName };
    }
  }
  Object.assign(db, globalStocks);
  return db;
})();
