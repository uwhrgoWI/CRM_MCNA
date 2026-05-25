/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

// Common interfaces
interface ChartDataPoint {
  label: string;
  value: number;
}

export function SVGBarChart({ data }: { data: ChartDataPoint[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 500;
  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(...data.map(d => d.value), 10);
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const barWidth = (chartWidth / data.length) * 0.6;
  const barGap = (chartWidth / data.length) * 0.4;

  return (
    <div className="relative bg-white p-5 rounded-2xl border border-slate-100 shadow-sm w-full h-full">
      <h4 className="text-sm font-semibold text-slate-800 mb-4 font-sans tracking-tight">Tăng Trưởng Người Dùng (6 Tháng)</h4>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        {/* Y-Axis Gridlines & Labels */}
        {gridLines.map((ratio, i) => {
          const val = Math.round(maxValue * ratio);
          const y = paddingTop + chartHeight * (1 - ratio);
          return (
            <g key={i} className="opacity-70">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-500 font-medium"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* X-Axis bottom line */}
        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="#cbd5e1"
          strokeWidth={1.5}
        />

        {/* Dynamic Bars */}
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * chartHeight;
          const x = paddingLeft + i * (barWidth + barGap) + barGap / 2;
          const y = height - paddingBottom - barHeight;

          return (
            <g key={i} className="group cursor-pointer">
              {/* Actual colored SVG bar with linear gradients */}
              <defs>
                <linearGradient id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill={hoveredIdx === i ? 'url(#bluePurpleHover)' : `url(#barGrad-${i})`}
                className="transition-all duration-300 transform origin-bottom hover:scale-y-[1.03]"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* Grid gradient logic override hover */}
              <linearGradient id="bluePurpleHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#6d28d9" />
              </linearGradient>

              {/* Exact user counts above bars */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                className={`text-[10px] sm:text-xs font-mono font-semibold transition-all duration-200 ${
                  hoveredIdx === i ? 'fill-indigo-600 font-bold scale-110' : 'fill-slate-600'
                }`}
              >
                {d.value}
              </text>

              {/* Month label beneath */}
              <text
                x={x + barWidth / 2}
                y={height - paddingBottom + 18}
                textAnchor="middle"
                className="text-[10px] font-sans font-medium fill-slate-500"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function SVGLineChart({ data }: { data: ChartDataPoint[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 500;
  const height = 300;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(...data.map(d => d.value), 1000);
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
    const y = height - paddingBottom - (d.value / maxValue) * chartHeight;
    return { x, y, value: d.value, label: d.label };
  });

  // Construct Cubic Bezier path
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 3;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (2 * (next.x - curr.x)) / 3;
      const cpY2 = next.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
  }

  // Path for shaded area under linear graph
  const areaD = pathD
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : '';

  return (
    <div className="relative bg-white p-5 rounded-2xl border border-slate-100 shadow-sm w-full h-full">
      <h4 className="text-sm font-semibold text-slate-800 mb-4 font-sans tracking-tight">Doanh Thu Học Phí (Triệu VND)</h4>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((ratio, i) => {
          const val = Math.round(maxValue * ratio);
          const y = paddingTop + chartHeight * (1 - ratio);
          return (
            <g key={i} className="opacity-70">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#e4e7f5"
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-500 font-medium"
              >
                {val.toLocaleString('vi-VN')}
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        {areaD && <path d={areaD} fill="url(#areaGradient)" />}

        {/* Actual Spline Line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            strokeLinecap="round"
            className="stroke-dash-animation"
          />
        )}

        {/* Intersecting Data Dots */}
        {points.map((p, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <g key={i} className="cursor-pointer">
              {/* Large touch invisible zone for hover accessibility */}
              <circle
                cx={p.x}
                cy={p.y}
                r={16}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 7 : 4}
                fill={isHovered ? '#7c3aed' : '#2563eb'}
                stroke="#ffffff"
                strokeWidth={2}
                className="transition-all duration-200"
              />
              {/* Highlight interactive text label on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={p.x - 45}
                    y={p.y - 30}
                    width={90}
                    height={20}
                    rx={4}
                    fill="#1e293b"
                    opacity={0.9}
                  />
                  <text
                    x={p.x}
                    y={p.y - 16}
                    textAnchor="middle"
                    fill="#ffffff"
                    className="text-[10px] font-semibold font-mono"
                  >
                    {p.value.toLocaleString('vi-VN')} Tr
                  </text>
                </g>
              )}
              {/* X label */}
              <text
                x={p.x}
                y={height - paddingBottom + 18}
                textAnchor="middle"
                className="text-[10px] font-sans font-medium fill-slate-500"
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export function SVGDonutChart({ data }: { data: DonutSegment[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, d) => acc + d.value, 0);

  // SVG parameters
  const size = 260;
  const center = size / 2;
  const radius = 75;
  const strokeWidth = 24;

  let accumulatedAngle = -90; // Start drawing at the top (12 o'clock)

  const segments = data.map((d, i) => {
    const percentage = total > 0 ? d.value / total : 0;
    const angle = percentage * 360;

    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    // Convert polar coordinates to Cartesian
    const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + r * Math.cos(angleInRadians),
        y: centerY + r * Math.sin(angleInRadians),
      };
    };

    const start = polarToCartesian(center, center, radius, startAngle);
    const end = polarToCartesian(center, center, radius, endAngle);

    // Large-arc-flag is 1 if the angle is greater than 180
    const largeArcFlag = angle > 180 ? 1 : 0;

    // SVG arc command
    const pathD = percentage === 1
      ? `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius}`
      : `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;

    return {
      ...d,
      pathD,
      percentage,
      startAngle,
      endAngle,
      i,
    };
  });

  return (
    <div className="relative bg-white p-5 rounded-2xl border border-slate-100 shadow-sm w-full h-full flex flex-col justify-between items-center text-center">
      <h4 className="text-sm font-semibold text-slate-800 self-start mb-2 font-sans tracking-tight">Cơ Cấu Người Dùng (% Vai Trò)</h4>
      <div className="relative w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-[180px] h-[180px] overflow-visible">
          {segments.map((seg) => {
            const isHovered = hoveredIdx === seg.i;
            return (
              <path
                key={seg.label}
                d={seg.pathD}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer ease-out"
                onMouseEnter={() => setHoveredIdx(seg.i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}

          {/* Center Text displaying main metric */}
          <circle cx={center} cy={center} r={radius - strokeWidth / 2 - 4} fill="#ffffff" />
          <text x={center} y={center - 3} textAnchor="middle" className="text-xs font-medium fill-slate-500 font-sans">
            TỔNG CỘNG
          </text>
          <text x={center} y={center + 16} textAnchor="middle" className="text-xl font-bold fill-slate-800 font-mono">
            {total}
          </text>
        </svg>
      </div>

      {/* Legend below */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-4 border-t border-slate-50 pt-3">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`flex items-center gap-2 text-left justify-start p-1 rounded-lg transition-all duration-200 cursor-pointer ${
              hoveredIdx === seg.i ? 'bg-slate-50 scale-102' : ''
            }`}
            onMouseEnter={() => setHoveredIdx(seg.i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-[11px] font-medium text-slate-700 truncate capitalize">{seg.label}</p>
              <p className="text-[10px] font-mono text-slate-400">
                {seg.value} ({Math.round(seg.percentage * 100)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SVGSparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const width = 120;
  const height = 30;
  const max = Math.max(...points, 10);
  const min = Math.min(...points, 0);
  const range = max - min || 1;

  const widthGap = width / (points.length - 1);
  const mappedPoints = points.map((p, i) => {
    const x = i * widthGap;
    const y = height - ((p - min) / range) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${mappedPoints.join(' L ')}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Stroke line with gradient color */}
      <path
        d={pathD}
        fill="none"
        stroke="#4f46e5"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End point dot */}
      <circle
        cx={width}
        cy={height - ((points[points.length - 1] - min) / range) * height}
        r={3}
        fill="#4f46e5"
        stroke="#ffffff"
        strokeWidth={1}
      />
    </svg>
  );
}
