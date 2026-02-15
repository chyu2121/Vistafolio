import YahooFinanceClass from 'yahoo-finance2';
import { NextResponse } from 'next/server';
import kisClient from '@/lib/kis-client';

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
            // 한국 주식: KIS API 사용
            const symbol = ticker.replace(/\.[KQ]S?$/, '');
            const priceData = await kisClient.getPrice(symbol);

            if (priceData) {
                return NextResponse.json({
                    ticker: ticker.toUpperCase(),
                    price: priceData.price,
                    currency: priceData.currency,
                    timestamp: new Date().toISOString(),
                });
            } else {
                return NextResponse.json(
                    { error: 'Failed to fetch Korean stock price' },
                    { status: 500 }
                );
            }
        }

        // 글로벌 주식: Yahoo Finance 사용
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
