const YahooFinanceClass = require('yahoo-finance2').default;
const yahooFinance = new YahooFinanceClass();

async function search(query) {
  try {
    const result = await yahooFinance.search(query, {
      newsCount: 0,
      quotesCount: 3,
    });
    
    console.log(`\n=== ${query} 검색 결과 ===`);
    if (result.quotes && result.quotes.length > 0) {
      result.quotes.forEach(q => {
        console.log(`Ticker: ${q.symbol}, Name: ${q.longname || q.shortname}`);
      });
    } else {
      console.log('검색 결과 없음');
    }
  } catch (error) {
    console.error(`에러: ${error.message}`);
  }
}

(async () => {
  await search('삼성바이오로직스');
  await search('한화에어로스페이스');
  await search('두산퓨얼셀');
  await search('207940'); // 삼성바이오 티커
  await search('012450'); // 한화에어로스페이스 예상 티커
  await search('069730'); // 두산퓨얼셀 예상 티커
})();
