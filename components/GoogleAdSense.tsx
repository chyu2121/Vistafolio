"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

interface GoogleAdSenseProps {
    pId: string;
}

export default function GoogleAdSense({ pId }: GoogleAdSenseProps) {
    const pathname = usePathname();

    // 랜딩 페이지("/")에서는 광고 스크립트 로드 안 함
    if (pathname === "/") {
        return null;
    }

    if (!pId) {
        return null;
    }

    return (
        <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}
