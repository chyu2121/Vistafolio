import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

import GoogleAdSense from "@/components/GoogleAdSense";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Vistafolio',
    description: 'Visual Portfolio Tracker',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <GoogleAdSense pId={process.env.NEXT_PUBLIC_ADSENSE_ID || ""} />
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
