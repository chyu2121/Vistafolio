"use client"

import React from "react"

export const PortfolioIllustration = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            {/* Abstract chart representing portfolio growth */}
            <path d="M10 90 L90 90" strokeOpacity="1" />
            <path d="M10 90 L10 10" strokeOpacity="1" />

            {/* Growth Lines */}
            <path d="M10 80 L30 60 L50 70 L70 30 L90 20" className="opacity-100" />
            <path d="M10 85 L30 65 L50 75 L70 35 L90 25" className="opacity-50" />

            {/* Abstract elements indicating data points */}
            <circle cx="30" cy="60" r="2" fill="currentColor" />
            <circle cx="50" cy="70" r="2" fill="currentColor" />
            <circle cx="70" cy="30" r="2" fill="currentColor" />
            <circle cx="90" cy="20" r="2" fill="currentColor" />

            {/* Pie chart hint in background */}
            <circle cx="75" cy="75" r="15" strokeOpacity="0.3" strokeDasharray="30 60" />
        </svg>
    )
}

export const AiNewsIllustration = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            {/* Central Node (AI Core) */}
            <circle cx="50" cy="50" r="15" />
            <circle cx="50" cy="50" r="8" strokeOpacity="0.5" />

            {/* Connections (Neural Network / News Feed) */}
            <path d="M50 35 L50 15" />
            <path d="M65 50 L85 50" />
            <path d="M50 65 L50 85" />
            <path d="M35 50 L15 50" />

            {/* Satellite Nodes (News Sources) */}
            <circle cx="50" cy="10" r="4" />
            <circle cx="90" cy="50" r="4" />
            <circle cx="50" cy="90" r="4" />
            <circle cx="10" cy="50" r="4" />

            {/* Data Flow Indications */}
            <path d="M60 40 L80 20" strokeDasharray="4 4" strokeOpacity="0.5" />
            <path d="M40 60 L20 80" strokeDasharray="4 4" strokeOpacity="0.5" />

            {/* Text Lines Representation */}
            <rect x="35" y="45" width="30" height="2" fill="currentColor" stroke="none" className="opacity-80" />
            <rect x="35" y="53" width="20" height="2" fill="currentColor" stroke="none" className="opacity-60" />
        </svg>
    )
}

export const SavingsIllustration = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            {/* Stacked Coins / Growth Blocks */}
            <rect x="20" y="70" width="15" height="20" rx="2" />
            <rect x="42" y="55" width="15" height="35" rx="2" />
            <rect x="64" y="40" width="15" height="50" rx="2" />

            {/* Percentage Symbol Abstract */}
            <circle cx="30" cy="30" r="5" />
            <circle cx="70" cy="20" r="5" />
            <line x1="25" y1="20" x2="75" y2="30" strokeOpacity="0.5" />

            {/* Upward Arrow */}
            <path d="M85 80 L85 30 L75 40" strokeWidth="2" />
            <path d="M85 30 L95 40" strokeWidth="2" />
        </svg>
    )
}
