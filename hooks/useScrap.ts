import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import type { AnalyzedNews, Market } from "@/app/vista_news/page";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ScrapedArticle extends AnalyzedNews {
  id: string;
  ticker: string;
  companyName: string;
  market: Market;
  scrapedAt: string;
}

interface UseScrapOptions {
  ticker: string;
  companyName: string;
  market: Market;
}

export function useScrap({ ticker, companyName, market }: UseScrapOptions) {
  const [scrapedUrls, setScrapedUrls] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  // 현재 티커에 대한 기존 스크랩 목록 로드
  useEffect(() => {
    if (!userId || !ticker) return;
    supabase
      .from("scraped_news")
      .select("url")
      .eq("user_id", userId)
      .eq("ticker", ticker)
      .then(({ data }) => {
        if (data) setScrapedUrls(new Set(data.map((r) => r.url)));
      });
  }, [userId, ticker]);

  const toggle = useCallback(
    async (news: AnalyzedNews) => {
      if (!userId) return;
      const url = news.url;

      setLoading((prev) => new Set(prev).add(url));

      if (scrapedUrls.has(url)) {
        // 스크랩 취소
        await supabase
          .from("scraped_news")
          .delete()
          .eq("user_id", userId)
          .eq("url", url);
        setScrapedUrls((prev) => {
          const next = new Set(prev);
          next.delete(url);
          return next;
        });
      } else {
        // 스크랩 추가
        await supabase.from("scraped_news").insert({
          user_id: userId,
          ticker,
          company_name: companyName,
          market,
          title: news.title,
          url,
          source: news.source,
          published_at: news.publishedAt,
          sentiment: news.sentiment,
          impact: news.impact,
          summary: news.summary,
          reason: news.reason,
          score: news.score,
        });
        setScrapedUrls((prev) => new Set(prev).add(url));
      }

      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(url);
        return next;
      });
    },
    [userId, ticker, companyName, market, scrapedUrls]
  );

  return {
    isLoggedIn: !!userId,
    isScrapped: (url: string) => scrapedUrls.has(url),
    isLoading: (url: string) => loading.has(url),
    toggle,
  };
}

// 스크랩 목록 페이지용 hook
export function useScraps() {
  const [articles, setArticles] = useState<ScrapedArticle[]>([]);
  const [fetching, setFetching] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
      else setFetching(false);
    });
  }, []);

  const load = useCallback(async (uid: string) => {
    setFetching(true);
    const { data } = await supabase
      .from("scraped_news")
      .select("*")
      .eq("user_id", uid)
      .order("scraped_at", { ascending: false });

    if (data) {
      setArticles(
        data.map((row) => ({
          id: row.id,
          ticker: row.ticker,
          companyName: row.company_name,
          market: row.market as Market,
          title: row.title,
          url: row.url,
          source: row.source,
          publishedAt: row.published_at,
          sentiment: row.sentiment,
          impact: row.impact,
          summary: row.summary,
          reason: row.reason,
          score: row.score,
          scrapedAt: row.scraped_at,
        }))
      );
    }
    setFetching(false);
  }, []);

  useEffect(() => {
    if (userId) load(userId);
  }, [userId, load]);

  const remove = useCallback(
    async (id: string) => {
      await supabase.from("scraped_news").delete().eq("id", id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    },
    []
  );

  return { articles, fetching, isLoggedIn: !!userId, remove, reload: () => userId && load(userId) };
}
