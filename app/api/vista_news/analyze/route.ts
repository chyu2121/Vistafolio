import { NextResponse } from "next/server";
import YahooFinanceClass from "yahoo-finance2";
import OpenAI from "openai";

const yahooFinance = new YahooFinanceClass();

// OpenAI 클라이언트는 런타임에 초기화 (빌드 시점에 API 키 필요 없음)
const getOpenAIClient = () => {
  // 런타임에 환경 변수 읽기
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  console.log("[vista_news/analyze] API Key check:", {
    hasOPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    hasNEXT_PUBLIC_OPENAI_API_KEY: !!process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    apiKeyLength: apiKey?.length ?? 0,
  });
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

export interface CompanyProfile {
  sector: string;
  industry: string;
  description: string;
}

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
    // 1. 회사명 + 뉴스 + 기업 정보 가져오기
    const [quoteData, searchData, summaryData] = await Promise.allSettled([
      yahooFinance.quote(symbol),
      yahooFinance.search(symbol, { newsCount: 10, quotesCount: 1 }),
      yahooFinance.quoteSummary(symbol, { modules: ["assetProfile", "summaryProfile"] }),
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

    // 기업 프로필 원본 데이터
    let rawSector = "";
    let rawIndustry = "";
    let rawLongDescription = "";
    if (summaryData.status === "fulfilled") {
      const profile =
        (summaryData.value as { assetProfile?: { sector?: string; industry?: string; longBusinessSummary?: string } })
          .assetProfile ??
        (summaryData.value as { summaryProfile?: { sector?: string; industry?: string; longBusinessSummary?: string } })
          .summaryProfile;
      if (profile) {
        rawSector = profile.sector ?? "";
        rawIndustry = profile.industry ?? "";
        rawLongDescription = profile.longBusinessSummary ?? "";
      }
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

    const profileContext = rawSector || rawIndustry || rawLongDescription
      ? `Company profile data from Yahoo Finance:
- Sector: ${rawSector || "N/A"}
- Industry: ${rawIndustry || "N/A"}
- Business summary: ${rawLongDescription ? rawLongDescription.slice(0, 600) : "N/A"}`
      : "";

    const userPrompt = `Analyze the following news articles for ${companyName} (${symbol}, ${market} market).
${profileContext ? `\n${profileContext}\n` : ""}
News articles:
${newsListText}

Return JSON in exactly this format:
{
  "companyName": "${companyName}",
  "overall_sentiment": "bullish" | "bearish" | "neutral",
  "key_insight": "2-3 sentence overall insight in Korean",
  "company_profile": {
    "sector": "섹터명 in Korean (e.g. 기술, 금융, 헬스케어, 에너지, 소비재, 산업재, 소재, 부동산, 유틸리티, 통신, 필수소비재)",
    "industry": "업종명 in Korean (e.g. 반도체, 전기차, 클라우드 소프트웨어, 바이오테크, 투자은행)",
    "description": "이 기업이 무엇을 하는 회사인지 사회초년생도 이해할 수 있게 2~3문장으로 쉽게 설명 (한국어)"
  },
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
- key_insight: Korean overall sentiment summary (2-3 sentences)
- company_profile.description: avoid jargon, explain as if to a first-time investor in their 20s`;

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
      company_profile: analysisJson.company_profile ?? null,
    });
  } catch (err: unknown) {
    console.error("[vista_news/analyze] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";