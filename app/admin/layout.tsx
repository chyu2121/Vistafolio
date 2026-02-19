import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "관리자 | Vistafolio",
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white">
            {children}
        </div>
    );
}
