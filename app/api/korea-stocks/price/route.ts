import { NextResponse } from 'next/server';
import kisClient from '@/lib/kis-client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');

    if (!ticker || ticker.trim().length < 1) {
        return NextResponse.json(
            { error: 'Ticker is required' },
            { status: 400 }
        );
    }

    try {
        // 티커에서 6자리 코드만 추출 (예: "005930.KS" → "005930")
        const symbol = ticker.replace(/\.[KQ]S?$/, '');

        // KIS API에서 현재가 조회
        const priceData = await kisClient.getPrice(symbol);

        if (!priceData) {
            return NextResponse.json(
                { error: 'Price data not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ticker,
            price: priceData.price,
            currency: priceData.currency,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Korean stock price error:', errorMessage);
        return NextResponse.json(
            { error: `Failed to fetch price: ${errorMessage}` },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
