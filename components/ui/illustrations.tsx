"use client"

import React from "react"

export const PortfolioIllustration = ({ className }: { className?: string }) => {
    // Helper function to create arc path for donut segments
    const createArcPath = (startAngle: number, endAngle: number, outerRadius: number, innerRadius: number) => {
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        const x1 = outerRadius * Math.cos(startRad);
        const y1 = outerRadius * Math.sin(startRad);
        const x2 = outerRadius * Math.cos(endRad);
        const y2 = outerRadius * Math.sin(endRad);

        const x3 = innerRadius * Math.cos(endRad);
        const y3 = innerRadius * Math.sin(endRad);
        const x4 = innerRadius * Math.cos(startRad);
        const y4 = innerRadius * Math.sin(startRad);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    };

    const outerRadius = 28;
    const innerRadius = 15;
    const colors = [
        { fill: "rgba(147, 197, 114, 0.9)", name: "Green" },      // 0-72
        { fill: "rgba(186, 128, 106, 0.8)", name: "Brown" },      // 72-144
        { fill: "rgba(100, 150, 200, 0.8)", name: "Blue" },       // 144-216
        { fill: "rgba(180, 100, 160, 0.8)", name: "Purple" },     // 216-288
        { fill: "rgba(255, 130, 130, 0.8)", name: "Red" },        // 288-360
    ];

    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            stroke="none"
        >
            {/* Donut Chart - Perfect circular visualization */}
            <g transform="translate(50, 50)">
                {/* Segment 1 - Green */}
                <path
                    d={createArcPath(0, 72, outerRadius, innerRadius)}
                    fill={colors[0].fill}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="0.5"
                />

                {/* Segment 2 - Brown */}
                <path
                    d={createArcPath(72, 144, outerRadius, innerRadius)}
                    fill={colors[1].fill}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="0.5"
                />

                {/* Segment 3 - Blue */}
                <path
                    d={createArcPath(144, 216, outerRadius, innerRadius)}
                    fill={colors[2].fill}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="0.5"
                />

                {/* Segment 4 - Purple */}
                <path
                    d={createArcPath(216, 288, outerRadius, innerRadius)}
                    fill={colors[3].fill}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="0.5"
                />

                {/* Segment 5 - Red/Pink */}
                <path
                    d={createArcPath(288, 360, outerRadius, innerRadius)}
                    fill={colors[4].fill}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="0.5"
                />

                {/* Center circle (donut hole) */}
                <circle
                    cx="0"
                    cy="0"
                    r={innerRadius - 2}
                    fill="rgba(255, 255, 255, 0.08)"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="0.5"
                />
            </g>
        </svg>
    )
}

export const AiNewsIllustration = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            stroke="none"
        >
            {/* Newspaper/Article Card */}
            {/* Main paper background */}
            <rect x="15" y="20" width="70" height="60" rx="3" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(147, 197, 114, 0.4)" strokeWidth="1.5" />

            {/* Header section - Green */}
            <rect x="15" y="20" width="70" height="12" rx="3" fill="rgba(147, 197, 114, 0.7)" stroke="none" />

            {/* AI Badge - Blue */}
            <rect x="22" y="24" width="12" height="4" rx="1.5" fill="rgba(100, 150, 200, 0.8)" stroke="none" />
            <text x="28" y="27" fontSize="2.5" fill="rgba(255,255,255,0.9)" fontWeight="700">AI</text>

            {/* Title lines - Brown */}
            <rect x="22" y="38" width="50" height="2" rx="1" fill="rgba(186, 128, 106, 0.8)" stroke="none" />
            <rect x="22" y="43" width="45" height="1.5" rx="0.75" fill="rgba(186, 128, 106, 0.6)" stroke="none" />

            {/* Content lines - Purple */}
            <rect x="22" y="50" width="55" height="1.2" rx="0.6" fill="rgba(180, 100, 160, 0.6)" stroke="none" />
            <rect x="22" y="53" width="52" height="1.2" rx="0.6" fill="rgba(180, 100, 160, 0.5)" stroke="none" />
            <rect x="22" y="56" width="48" height="1.2" rx="0.6" fill="rgba(180, 100, 160, 0.5)" stroke="none" />

            {/* Summary indicator - Red */}
            <circle cx="71" cy="52" r="4" fill="rgba(255, 130, 130, 0.7)" stroke="none" />
            <text x="71" y="53.5" fontSize="3" fill="rgba(255,255,255,0.9)" fontWeight="700" textAnchor="middle">!</text>

            {/* Decorative corner */}
            <path d="M75 68 L75 75 L82 75" stroke="rgba(147, 197, 114, 0.4)" strokeWidth="1" fill="none" strokeLinecap="round" />
        </svg>
    )
}

export const SavingsIllustration = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            stroke="none"
        >
            {/* Bankbook/Passbook background */}
            <g>
                {/* Front cover */}
                <rect x="20" y="25" width="50" height="50" rx="3" fill="rgba(147, 197, 114, 0.6)" stroke="rgba(147, 197, 114, 0.8)" strokeWidth="1.5" />

                {/* Bank title - Green */}
                <text x="45" y="40" fontSize="4" fill="rgba(255,255,255,0.95)" fontWeight="700" textAnchor="middle">Bank</text>

                {/* Divider line */}
                <rect x="25" y="44" width="40" height="0.8" rx="0.4" fill="rgba(255, 255, 255, 0.3)" />

                {/* Account info section - Brown */}
                <rect x="28" y="50" width="15" height="2" rx="1" fill="rgba(186, 128, 106, 0.7)" />
                <text x="28" y="54" fontSize="1.5" fill="rgba(186, 128, 106, 0.8)">Account</text>

                {/* Amount display - Blue */}
                <rect x="28" y="58" width="30" height="3" rx="1.5" fill="rgba(100, 150, 200, 0.6)" stroke="rgba(100, 150, 200, 0.8)" strokeWidth="0.8" />
                <text x="45" y="60.5" fontSize="2" fill="rgba(255,255,255,0.95)" fontWeight="700" textAnchor="middle">$$$</text>

                {/* Interest rate indicator - Purple */}
                <circle cx="28" cy="70" r="2.5" fill="rgba(180, 100, 160, 0.7)" stroke="none" />
                <text x="28" y="71" fontSize="1.8" fill="rgba(255,255,255,0.9)" fontWeight="700" textAnchor="middle">%</text>

                {/* Growth arrow - Red/Pink */}
                <path d="M35 70 L45 65 L50 72" fill="none" stroke="rgba(255, 130, 130, 0.8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Back page peek - offset shadow */}
                <rect x="23" y="28" width="50" height="50" rx="3" fill="rgba(100, 150, 200, 0.3)" stroke="none" />
            </g>

            {/* Decorative coin icon */}
            <circle cx="72" cy="65" r="6" fill="rgba(255, 130, 130, 0.7)" stroke="rgba(255, 130, 130, 0.9)" strokeWidth="0.8" />
            <text x="72" y="67" fontSize="5" fill="rgba(255,255,255,0.95)" fontWeight="700" textAnchor="middle">¥</text>
        </svg>
    )
}

export const ForumIllustration = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            stroke="none"
        >
            {/* Chat/Forum Bubbles */}
            {/* Main bubble - Green */}
            <rect x="25" y="30" width="50" height="28" rx="6" fill="rgba(147, 197, 114, 0.7)" stroke="rgba(147, 197, 114, 0.9)" strokeWidth="1.5" />

            {/* Text lines in main bubble */}
            <rect x="32" y="38" width="36" height="2" rx="1" fill="rgba(255, 255, 255, 0.8)" />
            <rect x="32" y="43" width="30" height="2" rx="1" fill="rgba(255, 255, 255, 0.6)" />
            <rect x="32" y="48" width="32" height="2" rx="1" fill="rgba(255, 255, 255, 0.6)" />

            {/* Tail of main bubble */}
            <path d="M40 58 L35 63 L42 60" fill="rgba(147, 197, 114, 0.7)" />

            {/* Secondary bubble - Blue */}
            <rect x="45" y="50" width="38" height="22" rx="5" fill="rgba(100, 150, 200, 0.7)" stroke="rgba(100, 150, 200, 0.9)" strokeWidth="1.5" />

            {/* Text lines in secondary bubble */}
            <rect x="52" y="56" width="24" height="1.8" rx="0.9" fill="rgba(255, 255, 255, 0.8)" />
            <rect x="52" y="61" width="20" height="1.8" rx="0.9" fill="rgba(255, 255, 255, 0.6)" />
            <rect x="52" y="66" width="22" height="1.8" rx="0.9" fill="rgba(255, 255, 255, 0.6)" />

            {/* Tail of secondary bubble */}
            <path d="M70 72 L73 77 L68 74" fill="rgba(100, 150, 200, 0.7)" />

            {/* User icon - Purple */}
            <circle cx="30" cy="70" r="6" fill="rgba(180, 100, 160, 0.7)" stroke="rgba(180, 100, 160, 0.9)" strokeWidth="1" />
            <circle cx="30" cy="68" r="2" fill="rgba(255, 255, 255, 0.9)" />
            <path d="M25 74 Q30 72 35 74" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Notification badge - Red */}
            <circle cx="70" cy="30" r="4" fill="rgba(255, 130, 130, 0.9)" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.8" />
            <text x="70" y="31.5" fontSize="3" fill="rgba(255,255,255,0.95)" fontWeight="700" textAnchor="middle">3</text>
        </svg>
    )
}
