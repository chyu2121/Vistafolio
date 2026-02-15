const YahooFinanceClass = require('yahoo-finance2').default;
const yahooFinance = new YahooFinanceClass();

async function search(query) {
  try {
    const result = await yahooFinance.search(query, {
      newsCount: 0,
      quotesCount: 8,
    });
    
    console.log(`\n=== ${query} 검색 ===`);
    if (result.quotes) {
      result.quotes.forEach(q => {
        if (q.symbol.includes('K')) {
          console.log(`${q.symbol} - ${q.longname || q.shortname}`);
        }
      });
    }
  } catch (e) {}
}

(async () => {
  await search('두산');
  await search('fuelcell');
})();
