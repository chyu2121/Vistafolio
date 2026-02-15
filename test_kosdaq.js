const YahooFinanceClass = require('yahoo-finance2').default;
const yahooFinance = new YahooFinanceClass();

async function test() {
  try {
    // KOSDAQ 종목 테스트 - 숫자만
    const result = await yahooFinance.search('323410', {
      newsCount: 0,
      quotesCount: 5,
    });
    
    console.log('=== 323410 검색 결과 ===');
    if (result.quotes) {
      result.quotes.forEach(q => {
        console.log(`Ticker: ${q.symbol}, Name: ${q.longname || q.shortname}`);
      });
    }
    
    // .KQ 형식으로 테스트
    const result2 = await yahooFinance.search('323410.KQ', {
      newsCount: 0,
      quotesCount: 5,
    });
    
    console.log('\n=== 323410.KQ 검색 결과 ===');
    if (result2.quotes) {
      result2.quotes.forEach(q => {
        console.log(`Ticker: ${q.symbol}, Name: ${q.longname || q.shortname}`);
      });
    }
    
    // .KS 형식으로 테스트
    const result3 = await yahooFinance.search('323410.KS', {
      newsCount: 0,
      quotesCount: 5,
    });
    
    console.log('\n=== 323410.KS 검색 결과 ===');
    if (result3.quotes) {
      result3.quotes.forEach(q => {
        console.log(`Ticker: ${q.symbol}, Name: ${q.longname || q.shortname}`);
      });
    }
    
  } catch (error) {
    console.error('에러:', error.message);
  }
}

test();
