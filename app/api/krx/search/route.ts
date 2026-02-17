import { NextResponse } from 'next/server';
import publicDataClient from '@/lib/public-data-client';
import { getKoreanName } from '@/lib/korean-stocks';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length < 1) {
        return NextResponse.json({ results: [] });
    }

    const query = q.trim();

    try {
        // 공공데이터포털 KRX API에서 종목 검색
        const stocks = await publicDataClient.searchStock(query);

        if (stocks.length === 0) {
            return NextResponse.json({ results: [] });
        }

        const results = stocks.map((stock) => {
            const exchangeCode = publicDataClient.getExchangeCode(stock.market);
            const ticker = `${stock.code}.${exchangeCode}`;
            const koName = getKoreanName(ticker);

            return {
                ticker,
                name: koName ?? stock.name,
                exchange: stock.market,
                source: 'krx',
            };
        });

        return NextResponse.json({ results });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('KRX search error:', errorMessage);
        return NextResponse.json(
            { error: `Search failed: ${errorMessage}`, results: [] },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
