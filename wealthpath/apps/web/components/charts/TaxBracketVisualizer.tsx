"use client";

import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { bracketColors, chartColors, formatDollar, type Theme } from "./chartColors";

interface TaxBracketVisualizerProps {
  ordinaryIncome: number;
  rothConversion: number;
  filingStatus: "MFJ" | "SINGLE" | "MFS" | "HOH";
  onConversionChange: (amount: number) => void;
  theme: Theme;
}

const BRACKETS_MFJ = [
  { floor: 0, ceiling: 23850, rate: 0.10 },
  { floor: 23850, ceiling: 96950, rate: 0.12 },
  { floor: 96950, ceiling: 206700, rate: 0.22 },
  { floor: 206700, ceiling: 394600, rate: 0.24 },
  { floor: 394600, ceiling: 501050, rate: 0.32 },
  { floor: 501050, ceiling: 751600, rate: 0.35 },
  { floor: 751600, ceiling: 1000000, rate: 0.37 },
];

const BRACKETS_SINGLE = [
  { floor: 0, ceiling: 11925, rate: 0.10 },
  { floor: 11925, ceiling: 48475, rate: 0.12 },
  { floor: 48475, ceiling: 103350, rate: 0.22 },
  { floor: 103350, ceiling: 197300, rate: 0.24 },
  { floor: 197300, ceiling: 250525, rate: 0.32 },
  { floor: 250525, ceiling: 626350, rate: 0.35 },
  { floor: 626350, ceiling: 800000, rate: 0.37 },
];

export default function TaxBracketVisualizer({
  ordinaryIncome,
  rothConversion,
  filingStatus,
  onConversionChange,
  theme,
}: TaxBracketVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const colors = chartColors[theme];
  const brackets = filingStatus === "MFJ" ? BRACKETS_MFJ : BRACKETS_SINGLE;

  const totalIncome = ordinaryIncome + rothConversion;
  const maxBracket = brackets[brackets.length - 1].ceiling;

  // Find current bracket and room info
  const insight = useMemo(() => {
    let currentBracket = brackets[0];
    let nextBracket = brackets[1];
    for (let i = 0; i < brackets.length; i++) {
      if (totalIncome >= brackets[i].floor && totalIncome < brackets[i].ceiling) {
        currentBracket = brackets[i];
        nextBracket = brackets[i + 1] ?? brackets[i];
        break;
      }
    }
    const roomInBracket = currentBracket.ceiling - totalIncome;
    return {
      currentRate: currentBracket.rate,
      nextRate: nextBracket.rate,
      roomInBracket: Math.max(0, roomInBracket),
    };
  }, [totalIncome, brackets]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 600;
    const height = 120;
    const margin = { top: 10, right: 20, bottom: 30, left: 20 };
    const barHeight = 40;

    const x = d3.scaleLinear().domain([0, maxBracket]).range([margin.left, width - margin.right]);

    const g = svg.append("g");

    // Draw bracket segments
    brackets.forEach((b) => {
      g.append("rect")
        .attr("x", x(b.floor))
        .attr("y", margin.top)
        .attr("width", x(b.ceiling) - x(b.floor))
        .attr("height", barHeight)
        .attr("fill", bracketColors[b.rate] ?? "#ccc")
        .attr("opacity", 0.3)
        .attr("rx", 2);

      // Rate label
      const segWidth = x(b.ceiling) - x(b.floor);
      if (segWidth > 30) {
        g.append("text")
          .attr("x", x(b.floor) + segWidth / 2)
          .attr("y", margin.top + barHeight / 2 + 4)
          .attr("text-anchor", "middle")
          .attr("fill", colors.text)
          .attr("font-size", 10)
          .text(`${(b.rate * 100).toFixed(0)}%`);
      }
    });

    // Filled portion: ordinary income
    const incomeWidth = Math.min(ordinaryIncome, maxBracket);
    brackets.forEach((b) => {
      const fillStart = Math.max(b.floor, 0);
      const fillEnd = Math.min(incomeWidth, b.ceiling);
      if (fillEnd > fillStart) {
        g.append("rect")
          .attr("x", x(fillStart))
          .attr("y", margin.top)
          .attr("width", x(fillEnd) - x(fillStart))
          .attr("height", barHeight)
          .attr("fill", bracketColors[b.rate] ?? "#ccc")
          .attr("opacity", 0.8)
          .attr("rx", 2);
      }
    });

    // Roth conversion overlay
    if (rothConversion > 0) {
      const convStart = ordinaryIncome;
      const convEnd = Math.min(totalIncome, maxBracket);
      brackets.forEach((b) => {
        const fillStart = Math.max(b.floor, convStart);
        const fillEnd = Math.min(convEnd, b.ceiling);
        if (fillEnd > fillStart) {
          g.append("rect")
            .attr("x", x(fillStart))
            .attr("y", margin.top)
            .attr("width", x(fillEnd) - x(fillStart))
            .attr("height", barHeight)
            .attr("fill", bracketColors[b.rate] ?? "#ccc")
            .attr("opacity", 0.6)
            .attr("stroke", colors.text)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3 2")
            .attr("rx", 2);
        }
      });
    }

    // Current position marker
    const markerX = x(Math.min(totalIncome, maxBracket));
    g.append("line")
      .attr("x1", markerX)
      .attr("x2", markerX)
      .attr("y1", margin.top - 5)
      .attr("y2", margin.top + barHeight + 5)
      .attr("stroke", colors.text)
      .attr("stroke-width", 2);

    g.append("text")
      .attr("x", markerX)
      .attr("y", margin.top + barHeight + 20)
      .attr("text-anchor", "middle")
      .attr("fill", colors.text)
      .attr("font-size", 11)
      .text(formatDollar(totalIncome));

    // Bracket floor labels on x-axis
    brackets.forEach((b) => {
      const segWidth = x(b.ceiling) - x(b.floor);
      if (segWidth > 40) {
        g.append("text")
          .attr("x", x(b.floor))
          .attr("y", margin.top + barHeight + 20)
          .attr("text-anchor", "start")
          .attr("fill", colors.textMuted)
          .attr("font-size", 9)
          .text(formatDollar(b.floor));
      }
    });
  }, [ordinaryIncome, rothConversion, totalIncome, filingStatus, theme, brackets, colors, maxBracket]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <svg ref={svgRef} width="100%" height={120} />
      <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
        {rothConversion > 0
          ? `Converting ${formatDollar(rothConversion)} fills the ${(insight.currentRate * 100).toFixed(0)}% bracket. ${formatDollar(insight.roomInBracket)} room before ${(insight.nextRate * 100).toFixed(0)}%.`
          : `Current income is in the ${(insight.currentRate * 100).toFixed(0)}% bracket. ${formatDollar(insight.roomInBracket)} room remaining.`}
      </p>
    </motion.div>
  );
}
