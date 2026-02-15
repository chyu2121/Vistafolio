import { NextResponse } from 'next/server';
import YahooFinanceClass from 'yahoo-finance2';

const yahooFinance = new YahooFinanceClass();
const FALLBACK_RATE = 1300;

async function fetchExchangeRate(): Promise<number> {
    try {
        // Yahoo Finance에서 USD/KRW 환율 조회
        const quote: any = await yahooFinance.quote('USDKRW=X');
        const rate = quote.regularMarketPrice;

        if (typeof rate === 'number' && rate > 0) {
            return rate;
        }
    } catch (error) {
        console.error('Exchange rate fetch error:', error);
    }

    // 폴백: 외부 API 시도
    try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        if (data.rates?.KRW) {
            return data.rates.KRW;
        }
    } catch (error) {
        console.error('Fallback exchange rate API error:', error);
    }

    // 최종 폴백
    return FALLBACK_RATE;
}

export async function GET() {
    try {
        const rate = await fetchExchangeRate();
        return NextResponse.json({
            rate,
            baseCurrency: 'USD',
            targetCurrency: 'KRW',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Exchange rate API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch exchange rate', rate: 1300 },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
