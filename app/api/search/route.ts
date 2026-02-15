import YahooFinanceClass from 'yahoo-finance2';
import { NextResponse } from 'next/server';
import { findStock, getKoreanName } from '@/lib/korean-stocks';
import kisClient from '@/lib/kis-client';

const yahooFinance = new YahooFinanceClass();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length < 1) {
        return NextResponse.json({ results: [] });
    }

    const query = q.trim();

    try {
        // 1. 먼저 한국 주식 database에서 확인
        const stockInfo = findStock(query);

        if (stockInfo) {
            // 한국 주식이면 KIS API 또는 database 데이터 사용
            const koName = getKoreanName(stockInfo.ticker);
            return NextResponse.json({
                results: [
                    {
                        ticker: stockInfo.ticker,
                        name: koName !== stockInfo.ticker ? koName : stockInfo.ticker,
                        exchange: stockInfo.ticker.endsWith('.KQ') ? 'KOSDAQ' : 'KOSPI',
                        type: 'korean',
                    },
                ],
            });
        }

        // 2. 한국 주식으로 보이면 KIS API에서 검색
        const isKoreanQuery =
            /^[가-힣a-zA-Z0-9\-]+$/.test(query) && // 한글이나 영문 포함
            !query.match(/\.[A-Z]{1,3}$/); // 티커 형식 아님

        if (isKoreanQuery) {
            try {
                const kisResults = await kisClient.searchStock(query);
                if (kisResults.length > 0) {
                    return NextResponse.json({
                        results: kisResults.map((item) => ({
                            ticker: `${item.symbol}.${item.exchange}`,
                            name: item.name,
                            exchange: item.market,
                            type: 'korean',
                        })),
                    });
                }
            } catch (error) {
                console.warn('KIS search failed, falling back to Yahoo Finance:', error);
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
