import YahooFinanceClass from 'yahoo-finance2';
import { NextResponse } from 'next/server';
import { koreanStockLogos } from '@/lib/korean-stocks';
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
        // 한국 주식으로 판단하는 조건:
        // 1. 한글 포함
        // 2. 6자리 숫자 (종목코드 직접 입력)
        // 3. .KS / .KQ / .KN 접미사 (한국 티커 직접 입력)
        const isKoreanTicker = /\.(KS|KQ|KN)$/i.test(query);
        const isKoreanCode = /^\d{6}$/.test(query);
        const hasKorean = /[가-힣]/.test(query);
        const isKoreanQuery = hasKorean || isKoreanCode || isKoreanTicker;

        // .KS/.KQ/.KN 형식이면 접미사 제거 후 코드만 추출해 검색
        const searchQuery = isKoreanTicker ? query.replace(/\.(KS|KQ|KN)$/i, '') : query;

        if (isKoreanQuery) {
            // KRX Open API 시도 (우선순위 1)
            try {
                const krxOpenResults = await krxOpenAPIClient.searchStock(searchQuery);
                if (krxOpenResults.length > 0) {
                    console.log(`Search "${query}": Found ${krxOpenResults.length} results from KRX Open API`);
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
                } else {
                    console.log(`Search "${query}": KRX Open API returned no results`);
                }
            } catch (error) {
                console.warn('KRX Open API search failed:', error);
            }

            // 공공데이터포털 시도 (폴백)
            try {
                const krxResults = await publicDataClient.searchStock(searchQuery);
                if (krxResults.length > 0) {
                    console.log(`Search "${query}": Found ${krxResults.length} results from Public Data API`);
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
                } else {
                    console.log(`Search "${query}": Public Data API returned no results`);
                }
            } catch (error) {
                console.warn('Public Data API search failed:', error);
            }

            // 한국 쿼리인데 어디서도 결과를 찾지 못한 경우 빈 결과 반환
            // Yahoo Finance에 한국주식 검색을 위임하지 않음
            console.log(`Search "${query}": No Korean stock results found`);
            return NextResponse.json({ results: [] });
        }

        // 글로벌 주식으로 Yahoo Finance 검색 (한국 쿼리가 아닌 경우에만)
        const result = await yahooFinance.search(query, {
            newsCount: 0,
            quotesCount: 8,
        });

        const results = (result.quotes || [])
            .filter((item: any) => {
                if (!(item.quoteType === 'EQUITY' || item.quoteType === 'ETF') || !item.symbol) return false;
                // 한국 주식 티커(.KS, .KQ, .KN)는 Yahoo 결과에서 제외
                const sym = item.symbol as string;
                if (sym.endsWith('.KS') || sym.endsWith('.KQ') || sym.endsWith('.KN')) return false;
                return true;
            })
            .slice(0, 6)
            .map((item: any) => {
                const ticker = item.symbol as string;
                const displayName = item.longname || item.shortname || ticker;

                return {
                    ticker,
                    name: displayName,
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
