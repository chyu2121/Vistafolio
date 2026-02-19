import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Vista Forum | Vistafolio",
    description: "사회초년생을 위한 재테크 가이드. 주식, ETF, 예적금, 절세 계좌까지 한눈에.",
};

export default function VistaForumLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
