import { NextResponse } from 'next/server';
import kisClient from '@/lib/kis-client';
import { findStock, getKoreanName } from '@/lib/korean-stocks';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length < 1) {
        return NextResponse.json({ results: [] });
    }

    const query = q.trim();

    try {
        // 1. 먼저 database에서 매핑된 한국 주식인지 확인
        const stockInfo = findStock(query);

        let results: any[] = [];

        if (stockInfo) {
            // Database에 있는 종목이면 그 정보 사용
            const koName = getKoreanName(stockInfo.ticker);
            results = [
                {
                    ticker: stockInfo.ticker,
                    name: koName !== stockInfo.ticker ? koName : stockInfo.ticker,
                    exchange: stockInfo.ticker.endsWith('.KQ') ? 'KOSDAQ' : 'KOSPI',
                },
            ];
        } else {
            // 2. KIS API에서 한국 주식 검색
            const kisResults = await kisClient.searchStock(query);

            results = kisResults.map((item) => {
                const fullTicker = `${item.symbol}.${item.exchange}`;
                const koName = getKoreanName(fullTicker);

                return {
                    ticker: fullTicker,
                    name: koName !== fullTicker ? koName : item.name,
                    exchange: item.market,
                };
            });
        }

        return NextResponse.json({ results });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Korean stock search error:', errorMessage);
        return NextResponse.json(
            { error: `Search failed: ${errorMessage}`, results: [] },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
