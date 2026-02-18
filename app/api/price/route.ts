import YahooFinanceClass from 'yahoo-finance2';
import { NextResponse } from 'next/server';
import { getPriceWithFallback } from '@/lib/public-data-stock-price';

const yahooFinance = new YahooFinanceClass();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');

    if (!ticker) {
        return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    try {
        // 한국 주식인지 확인 (.KS, .KQ, .KN 등)
        if (ticker.includes('.K')) {
            console.log(`[Price API] Treating ${ticker} as Korean stock`);
            // 한국 주식: 공공데이터포털 API 사용 (실패 시 Naver 폴백)
            const symbol = ticker.replace(/\.(KS|KQ|KN)$/, '');
            console.log(`[Price API] Symbol extracted: ${symbol}`);
            const priceData = await getPriceWithFallback(symbol);
            console.log(`[Price API] Public Data API result for ${symbol}:`, priceData);

            if (priceData) {
                return NextResponse.json({
                    ticker: ticker.toUpperCase(),
                    price: priceData.price,
                    currency: priceData.currency,
                    timestamp: new Date().toISOString(),
                });
            } else {
                // 공공데이터포털 실패 시 가격 정보 없음으로 반환 (Yahoo Finance 사용 안 함)
                console.warn(`[Price API] Public Data API failed for ${symbol}. Korean stock price unavailable.`);
                return NextResponse.json(
                    { error: `Korean stock price unavailable for ${ticker}` },
                    { status: 503 }
                );
            }
        }

        // 글로벌 주식: Yahoo Finance 사용
        console.log(`[Price API] Treating ${ticker} as global stock`);
        const quote: any = await yahooFinance.quote(ticker);
        const { regularMarketPrice, currency } = quote;

        return NextResponse.json({
            ticker: ticker.toUpperCase(),
            price: regularMarketPrice,
            currency: currency,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error(`Error fetching price for ${ticker}:`, error);
        return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
