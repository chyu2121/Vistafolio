import YahooFinanceClass from 'yahoo-finance2';
import { NextResponse } from 'next/server';
import { getKoreanName } from '@/lib/korean-stocks';
import publicDataClient from '@/lib/public-data-client';
import krxOpenAPIClient from '@/lib/krx-open-api-client';

const yahooFinance = new YahooFinanceClass();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length < 1) {
        return NextResponse.json({ results: [] });
    }

    const query = q.trim();

    try {
        // 한국 주식으로 보이면 API에서 검색
        const isKoreanQuery =
            /^[가-힣a-zA-Z0-9\-]+$/.test(query) && // 한글이나 영문 포함
            !query.match(/\.[A-Z]{1,3}$/); // 티커 형식 아님

        if (isKoreanQuery) {
            // KRX Open API 시도 (우선순위 1)
            try {
                const krxOpenResults = await krxOpenAPIClient.searchStock(query);
                if (krxOpenResults.length > 0) {
                    return NextResponse.json({
                        results: krxOpenResults.map((item) => {
                            const exchangeCode = krxOpenAPIClient.getExchangeCode(item.market);
                            const ticker = `${item.code}.${exchangeCode}`;
                            const koName = getKoreanName(ticker);

                            return {
                                ticker,
                                name: koName !== ticker ? koName : item.name,
                                exchange: item.market,
                                type: 'korean',
                                source: 'krx-open',
                            };
                        }),
                    });
                }
            } catch (error) {
                console.warn('KRX Open API search failed:', error);
            }

            // 공공데이터포털 시도 (폴백)
            try {
                const krxResults = await publicDataClient.searchStock(query);
                if (krxResults.length > 0) {
                    return NextResponse.json({
                        results: krxResults.map((item) => {
                            const exchangeCode = publicDataClient.getExchangeCode(item.market);
                            const ticker = `${item.code}.${exchangeCode}`;
                            const koName = getKoreanName(ticker);

                            return {
                                ticker,
                                name: koName !== ticker ? koName : item.name,
                                exchange: item.market,
                                type: 'korean',
                                source: 'krx',
                            };
                        }),
                    });
                }
            } catch (error) {
                console.warn('KRX search failed:', error);
            }

        }

        // 3. 글로벌 주식으로 Yahoo Finance 검색
        const result = await yahooFinance.search(query, {
            newsCount: 0,
            quotesCount: 8,
        });

        const results = (result.quotes || [])
            .filter((item: any) => (item.quoteType === 'EQUITY' || item.quoteType === 'ETF') && item.symbol)
            .slice(0, 6)
            .map((item: any) => {
                const ticker = item.symbol as string;
                return {
                    ticker,
                    name: item.longname || item.shortname || ticker,
                    exchange: item.exchange || '',
                    type: 'global',
                    source: 'yahoo',
                };
            });

        return NextResponse.json({ results });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Search error:', errorMessage);
        return NextResponse.json(
            { error: `Search failed: ${errorMessage}`, results: [] },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
