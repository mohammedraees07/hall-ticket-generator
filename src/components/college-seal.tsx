"use client";

import React, { useId } from "react";

interface CollegeSealProps {
  collegeName?: string;
  subText?: string;
  centerText?: string;
  year?: string;
  size?: number;
  color?: "black" | "blue" | "monochrome";
  className?: string;
}

export function CollegeSeal({
  collegeName = "MAHARAJA INSTITUTE OF TECHNOLOGY",
  subText = "OFFICE OF THE PRINCIPAL",
  centerText = "AUTONOMOUS",
  year = "ESTD 1963",
  size = 110,
  color = "blue",
  className = "",
}: CollegeSealProps) {
  const id = useId().replace(/:/g, "");
  const topPathId = `seal-top-${id}`;
  const bottomPathId = `seal-bottom-${id}`;
  const filterId = `stamp-texture-${id}`;

  // Authentic university ink stamp navy blue (classic stamp pad indigo/navy)
  const strokeColor = color === "black" ? "#111827" : "#17347a";
  const textColor = strokeColor;

  // Clean uppercase text
  const cleanName = collegeName.trim().toUpperCase() || "INSTITUTION OF TECHNOLOGY";
  const cleanSub = subText.trim().toUpperCase() || "EXAMINATION CELL";

  return (
    <div
      className={`inline-block select-none ${className}`}
      style={{ width: size, height: size }}
      title={`${cleanName} Official Seal`}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="w-full h-full transform -rotate-1"
        style={{
          filter: `drop-shadow(0 1px 1px rgba(23, 52, 122, 0.15))`,
          opacity: 0.96,
        }}
      >
        <defs>
          {/* Top Arc Path (Clockwise from left to right) */}
          <path
            id={topPathId}
            d="M 28,100 A 72,72 0 1,1 172,100"
            fill="none"
          />
          {/* Bottom Arc Path (Counter-clockwise from left to right so text is upright) */}
          <path
            id={bottomPathId}
            d="M 22,100 A 78,78 0 0,0 178,100"
            fill="none"
          />
        </defs>

        {/* Outer Beaded / Dashed Ring */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Outer Solid Ring */}
        <circle
          cx="100"
          cy="100"
          r="91"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
        />

        {/* Inner Solid Ring */}
        <circle
          cx="100"
          cy="100"
          r="54"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
        />

        {/* Center Decorative Dashed Ring */}
        <circle
          cx="100"
          cy="100"
          r="50"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Top Text along arc: College Name */}
        <text
          fill={textColor}
          fontSize={cleanName.length > 30 ? "8.5" : cleanName.length > 24 ? "9.5" : "11"}
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1.2"
        >
          <textPath
            href={`#${topPathId}`}
            xlinkHref={`#${topPathId}`}
            startOffset="50%"
            textAnchor="middle"
          >
            {cleanName}
          </textPath>
        </text>

        {/* Bottom Text along arc: Subtext */}
        <text
          fill={textColor}
          fontSize="9"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1.5"
        >
          <textPath
            href={`#${bottomPathId}`}
            xlinkHref={`#${bottomPathId}`}
            startOffset="50%"
            textAnchor="middle"
          >
            ★ {cleanSub} ★
          </textPath>
        </text>

        {/* Center Emblem Details */}
        {/* Star Icon at Center */}
        <path
          d="M 100,68 L 103,77 L 112,77 L 105,82 L 107,91 L 100,86 L 93,91 L 95,82 L 88,77 L 97,77 Z"
          fill={strokeColor}
        />

        {/* Center Text */}
        <text
          x="100"
          y="108"
          fill={textColor}
          fontSize="9.5"
          fontWeight="900"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1.5"
        >
          {centerText}
        </text>

        {/* Year Established */}
        <text
          x="100"
          y="122"
          fill={textColor}
          fontSize="7.5"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="monospace"
          letterSpacing="1"
        >
          {year}
        </text>

        {/* Bottom Small Seal Text */}
        <text
          x="100"
          y="134"
          fill={textColor}
          fontSize="6"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.8"
        >
          OFFICIAL SEAL
        </text>
      </svg>
    </div>
  );
}
