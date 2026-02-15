
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

async function test() {
    console.log("--- Testing 'Samsung' with lang='ko-KR' ---");
    try {
        const resKor = await yahooFinance.search('Samsung', { lang: 'ko-KR', quotesCount: 5 });
        resKor.quotes.forEach(q => {
            console.log(`${q.symbol}: ${q.longname} (${q.quoteType})`);
        });
    } catch (e) {
        console.error(e);
    }

    console.log("\n--- Testing 'TSLL' (US ETF) ---");
    try {
        const resEtf = await yahooFinance.search('TSLL', { quotesCount: 5 });
        resEtf.quotes.forEach(q => {
            console.log(`${q.symbol}: ${q.longname} (${q.quoteType})`);
        });
    } catch (e) {
        console.error(e);
    }

    console.log("\n--- Testing 'Tiger' (KR ETF) with lang='ko-KR' ---");
    try {
        const resTiger = await yahooFinance.search('Tiger Nasdaq', { lang: 'ko-KR', quotesCount: 5 });
        resTiger.quotes.forEach(q => {
            console.log(`${q.symbol}: ${q.longname} (${q.quoteType})`);
        });
    } catch (e) {
        console.error(e);
    }
}

test();
