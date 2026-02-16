import { NextResponse } from "next/server";
import YahooFinanceClass from "yahoo-finance2";
import OpenAI from "openai";

const yahooFinance = new YahooFinanceClass();

// OpenAI 클라이언트는 런타임에 초기화 (빌드 시점에 API 키 필요 없음)
const getOpenAIClient = () => {
  // 런타임에 환경 변수 읽기
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not set. " +
      "Please set the environment variable in your deployment platform."
    );
  }
  return new OpenAI({ apiKey });
};

export type Market = "US" | "KR";
export type Sentiment = "bullish" | "bearish" | "neutral";
export type Impact = "high" | "medium" | "low";

interface RawNewsItem {
  title?: string;
  link?: string;
  publisher?: string;
  providerPublishTime?: Date | number;
  uuid?: string;
}

interface AnalyzedNews {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  score: number;
  sentiment: Sentiment;
  impact: Impact;
  summary: string;
  reason: string;
}

// KR 종목코드 → Yahoo Finance 심볼 변환
function toYahooSymbol(ticker: string, market: Market): string {
  if (market === "KR") {
    if (ticker.includes(".")) return ticker;
    return `${ticker}.KS`;
  }
  return ticker;
}

// 뉴스 publishedAt 정규화
function toISO(val: Date | number | undefined): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  return new Date(val * 1000).toISOString();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  const market = (searchParams.get("market") ?? "US") as Market;

  if (!ticker) {
    return NextResponse.json({ error: "ticker is required" }, { status: 400 });
  }

  const symbol = toYahooSymbol(ticker.toUpperCase(), market);

  try {
    // 1. 회사명 + 뉴스 가져오기
    const [quoteData, searchData] = await Promise.allSettled([
      yahooFinance.quote(symbol),
      yahooFinance.search(symbol, { newsCount: 10, quotesCount: 1 }),
    ]);

    // 회사명
    let companyName = ticker.toUpperCase();
    if (quoteData.status === "fulfilled") {
      companyName =
        (quoteData.value as { longName?: string; shortName?: string }).longName ??
        (quoteData.value as { shortName?: string }).shortName ??
        ticker.toUpperCase();
    }

    // 뉴스 목록
    let rawNews: RawNewsItem[] = [];
    if (searchData.status === "fulfilled" && searchData.value.news) {
      rawNews = searchData.value.news as RawNewsItem[];
    }

    if (rawNews.length === 0) {
      return NextResponse.json(
        { error: "뉴스를 찾을 수 없습니다. 티커를 확인해주세요." },
        { status: 404 }
      );
    }

    // 2. OpenAI로 뉴스 분석
    const newsListText = rawNews
      .map(
        (n, i) =>
          `[${i + 1}] title: "${n.title ?? ""}" | source: ${n.publisher ?? "Unknown"} | published: ${toISO(n.providerPublishTime)}`
      )
      .join("\n");

    const systemPrompt = `You are a professional stock analyst. Respond ONLY with valid JSON, no markdown, no explanation.`;

    const userPrompt = `Analyze the following news articles for ${companyName} (${symbol}, ${market} market).

News articles:
${newsListText}

Return JSON in exactly this format:
{
  "companyName": "${companyName}",
  "overall_sentiment": "bullish" | "bearish" | "neutral",
  "key_insight": "2-3 sentence overall insight in Korean",
  "news": [
    {
      "index": 1,
      "sentiment": "bullish" | "bearish" | "neutral",
      "impact": "high" | "medium" | "low",
      "score": 0.0-1.0,
      "summary": "3 bullet points in Korean separated by \\n",
      "reason": "one line reason in Korean ending with → 호재/악재/중립"
    }
  ]
}

Rules:
- score: how impactful this news is for stock price (0.0 = irrelevant, 1.0 = very impactful)
- impact: high=major earnings/product/regulatory, medium=moderate, low=minor
- summary: Korean translation with 3 bullet points separated by \\n
- reason: brief Korean reason ending with → 호재/악재/중립
- key_insight: Korean overall sentiment summary (2-3 sentences)`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content ?? "{}";
    const analysisJson = JSON.parse(text);

    // 3. 결과 조합
    const analyzedNews: AnalyzedNews[] = rawNews.map((n, i) => {
      const analysis = (analysisJson.news as Array<{
        index: number;
        sentiment: Sentiment;
        impact: Impact;
        score: number;
        summary: string;
        reason: string;
      }>)?.find((a) => a.index === i + 1) ?? {
        sentiment: "neutral" as Sentiment,
        impact: "low" as Impact,
        score: 0.3,
        summary: "분석 정보 없음",
        reason: "정보 부족 → 중립",
      };

      return {
        title: n.title ?? "(제목 없음)",
        url: n.link ?? "#",
        source: n.publisher ?? "Unknown",
        publishedAt: toISO(n.providerPublishTime),
        score: typeof analysis.score === "number" ? analysis.score : 0.3,
        sentiment: analysis.sentiment ?? "neutral",
        impact: analysis.impact ?? "low",
        summary: analysis.summary ?? "",
        reason: analysis.reason ?? "",
      };
    });

    // score 내림차순 정렬
    analyzedNews.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      companyName: analysisJson.companyName ?? companyName,
      market,
      analyzedAt: new Date().toISOString(),
      news: analyzedNews,
      overall_sentiment: analysisJson.overall_sentiment ?? "neutral",
      key_insight: analysisJson.key_insight ?? "",
    });
  } catch (err: unknown) {
    console.error("[vista_news/analyze] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";