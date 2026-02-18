import { NextResponse } from 'next/server';
import { koreanStockLogos } from '@/lib/korean-stocks';
import publicDataClient from '@/lib/public-data-client';
import krxOpenAPIClient from '@/lib/krx-open-api-client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length < 1) {
        return NextResponse.json({ results: [] });
    }

    const query = q.trim();
    // .KS/.KQ/.KN 형식이면 접미사 제거 후 코드만 추출해 검색
    const searchQuery = query.replace(/\.(KS|KQ|KN)$/i, '');

    try {
        // KRX Open API 시도 (우선순위 1)
        try {
            const krxOpenResults = await krxOpenAPIClient.searchStock(searchQuery);
            if (krxOpenResults.length > 0) {
                return NextResponse.json({
                    results: krxOpenResults.map((item) => {
                        const exchangeCode = krxOpenAPIClient.getExchangeCode(item.market);
                        const ticker = `${item.code}.${exchangeCode}`;
                        return {
                            ticker,
                            name: item.name,
                            exchange: item.market,
                            type: 'korean',
                            source: 'krx-open',
                            logo: koreanStockLogos[ticker],
                        };
                    }),
                });
            }
        } catch (error) {
            console.warn('KRX Open API search failed:', error);
        }

        // 공공데이터포털 시도 (폴백)
        try {
            const krxResults = await publicDataClient.searchStock(searchQuery);
            if (krxResults.length > 0) {
                return NextResponse.json({
                    results: krxResults.map((item) => {
                        const exchangeCode = publicDataClient.getExchangeCode(item.market);
                        const ticker = `${item.code}.${exchangeCode}`;
                        return {
                            ticker,
                            name: item.name,
                            exchange: item.market,
                            type: 'korean',
                            source: 'public-data',
                            logo: koreanStockLogos[ticker],
                        };
                    }),
                });
            }
        } catch (error) {
            console.warn('Public Data API search failed:', error);
        }

        // 어디서도 결과 없음
        return NextResponse.json({ results: [] });
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
