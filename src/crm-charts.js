// Enterprise CRM Pro - Pure inline SVG Custom Visualizations
'use strict';

/**
 * Renders a growing monthly vertical Bar Chart inside a target container
 */
export function svgBarChart(data, containerId, opts = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const w = container.clientWidth || 360;
  const h = container.clientHeight || 220;
  const padding = { top: 20, right: 15, bottom: 25, left: 45 };

  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  // Max value calculation
  const maxVal = Math.max(...data.map(d => d.value)) * 1.1 || 1000000;

  let yTicksHtml = '';
  // 4 ticks grid lines
  for (let i = 0; i <= 4; i++) {
    const ratio = i / 4;
    const yVal = Math.round(maxVal * ratio);
    const yPos = padding.top + chartH * (1 - ratio);
    yTicksHtml += `
      <line x1="${padding.left}" y1="${yPos}" x2="${w - padding.right}" y2="${yPos}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,4" />
      <text x="${padding.left - 8}" y="${yPos + 4}" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="end">${(yVal / 1000000).toFixed(1)}M</text>
    `;
  }

  const numBars = data.length;
  const gap = 12;
  const barW = (chartW - (numBars - 1) * gap) / numBars;

  let barsHtml = '';
  data.forEach((d, idx) => {
    const ratio = d.value / maxVal;
    const bHeight = chartH * ratio;
    const x = padding.left + idx * (barW + gap);
    const y = padding.top + chartH - bHeight;

    // Growth animation triggers
    barsHtml += `
      <g class="chart-bar-group" cursor="pointer">
        <rect class="svg-bar" x="${x}" y="${y}" width="${barW}" height="${bHeight}" fill="url(#gradBar)" rx="4" ry="4">
          <animate attributeName="height" from="0" to="${bHeight}" dur="0.6s" cubic-bezier(0.16,1,0.3,1) fill="freeze" />
          <animate attributeName="y" from="${padding.top + chartH}" to="${y}" dur="0.6s" cubic-bezier(0.16,1,0.3,1) fill="freeze" />
        </rect>
        <text x="${x + barW / 2}" y="${padding.top + chartH + 16}" fill="#64748b" font-size="10" font-weight="700" text-anchor="middle">${d.label}</text>
        <title>${d.label}: ${(d.value).toLocaleString('vi-VN')} ₫</title>
      </g>
    `;
  });

  container.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" style="overflow: visible;">
      <defs>
        <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2563eb" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
      </defs>
      <!-- Grid Ticks -->
      ${yTicksHtml}
      <!-- Bars -->
      ${barsHtml}
    </svg>
  `;
}

/**
 * Renders a Bezier curvilinear Area Line Chart inside a container
 */
export function svgLineChart(data, containerId, opts = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const w = container.clientWidth || 360;
  const h = container.clientHeight || 220;
  const padding = { top: 20, right: 20, bottom: 25, left: 40 };

  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => d.value)) * 1.1 || 100;
  
  // Grid Lines
  let gridHtml = '';
  for (let i = 0; i <= 3; i++) {
    const ratio = i / 3;
    const yVal = Math.round(maxVal * ratio);
    const yPos = padding.top + chartH * (1 - ratio);
    gridHtml += `
      <line x1="${padding.left}" y1="${yPos}" x2="${w - padding.right}" y2="${yPos}" stroke="#f1f5f9" stroke-width="1.5" />
      <text x="${padding.left - 8}" y="${yPos + 4}" fill="#94a3b8" font-size="9" text-anchor="end">${yVal}</text>
    `;
  }

  // Pre-calculate coordinates
  const points = data.map((d, idx) => {
    const ratioX = idx / (data.length - 1);
    const ratioY = d.value / maxVal;
    return {
      x: padding.left + ratioX * chartW,
      y: padding.top + chartH * (1 - ratioY),
      v: d.value,
      l: d.label
    };
  });

  // Calculate cubical bezier spline command lines
  let pathStr = '';
  let areaStr = '';

  if (points.length > 0) {
    pathStr += `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) * 2 / 3;
      const cpY2 = p1.y;
      pathStr += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    areaStr = pathStr + ` L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;
  }

  let nodesHtml = '';
  points.forEach(p => {
    nodesHtml += `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#ffffff" stroke="#2563eb" stroke-width="2" cursor="pointer">
        <animate attributeName="r" from="1" to="4" dur="0.4s" />
        <title>${p.l}: ${p.v} Convert</title>
      </circle>
      <text x="${p.x}" y="${padding.top + chartH + 16}" fill="#64748b" font-size="9.5" text-anchor="middle">${p.l}</text>
    `;
  });

  container.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.01" />
        </linearGradient>
      </defs>
      <!-- Grid -->
      ${gridHtml}
      <!-- Filled Area -->
      <path d="${areaStr}" fill="url(#lineGrad)" />
      <!-- Bezier Stroke -->
      <path d="${pathStr}" fill="none" stroke="#2563eb" stroke-width="2.5" />
      <!-- Dots -->
      ${nodesHtml}
    </svg>
  `;
}

/**
 * Renders an interactive segmented Donut Chart
 */
export function svgDonut(data, containerId, opts = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const w = container.clientWidth || 320;
  const h = container.clientHeight || 220;

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const r = 60;
  const cx = w / 2 - 35;
  const cy = h / 2 - 10;

  let currentAngle = 0;
  let arcHtml = '';
  let legendHtml = '';

  data.forEach((d, idx) => {
    const percent = d.value / total;
    const sliceAngle = percent * 360;

    const rad1 = (currentAngle - 90) * Math.PI / 180;
    const rad2 = (currentAngle + sliceAngle - 90) * Math.PI / 180;

    const x1 = cx + r * Math.cos(rad1);
    const y1 = cy + r * Math.sin(rad1);
    const x2 = cx + r * Math.cos(rad2);
    const y2 = cy + r * Math.sin(rad2);

    const largeArc = sliceAngle > 180 ? 1 : 0;
    const dPath = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const sliceColor = d.color || '#cbd5e1';

    arcHtml += `
      <path class="svg-slice" d="${dPath}" fill="${sliceColor}" stroke="#ffffff" stroke-width="1.5" style="transform-origin: ${cx}px ${cy}px; transition: transform 0.2s;">
        <title>${d.label}: ${d.value} (${Math.round(percent * 100)}%)</title>
      </path>
    `;

    legendHtml += `
      <div style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:600; color:#334155;">
        <div style="width:10px; height:10px; border-radius:50%; background-color:${sliceColor};"></div>
        <div style="flex:1;">${d.label}</div>
        <div style="font-family:'JetBrains Mono'; font-weight:700;">${d.value} (${Math.round(percent * 100)}%)</div>
      </div>
    `;

    currentAngle += sliceAngle;
  });

  // Small hole to generate a donut instead of pie
  arcHtml += `
    <circle cx="${cx}" cy="${cy}" r="38" fill="#ffffff" />
    <text x="${cx}" y="${cy}" fill="#94a3b8" font-size="9" text-anchor="middle" font-weight="700" letter-spacing="0.5px">TOTAL DEALS</text>
    <text x="${cx}" y="${cy + 12}" fill="#0f172a" font-family="'Outfit', sans-serif" font-size="16" font-weight="800" text-anchor="middle">${total}</text>
  `;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; height:100%;">
      <div style="flex:1; min-height:130px; position:relative;">
        <svg width="100%" height="100%" viewBox="0 0 ${w} ${h - 80}" style="display:block;">
          ${arcHtml}
        </svg>
      </div>
      <div style="display:grid; grid-template-cols:1fr 1fr; gap:6px; padding:0 8px;">
        ${legendHtml}
      </div>
    </div>
  `;
}

/**
 * Draws a Horizontal Funnel Chart
 */
export function svgFunnel(data, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const w = container.clientWidth || 360;
  const h = 200;
  
  const totalLeads = data[0]?.value || 1;
  let funnelRows = '';

  data.forEach((d, idx) => {
    const ratio = d.value / totalLeads;
    const barWidth = ratio * 100; // percent width
    const itemColor = idx === 0 ? '#2563eb' : idx === 1 ? '#3b82f6' : idx === 2 ? '#60a5fa' : idx === 3 ? '#a78bfa' : '#10b981';

    funnelRows += `
      <div style="display:flex; align-items:center; gap:12px; font-size:12px; margin-bottom:12px;">
        <div style="width:90px; font-weight:700; color:#334155; text-align:right;">${d.label}</div>
        <div style="flex:1; background-color:#f1f5f9; height:24px; border-radius:4px; overflow:hidden; position:relative;">
          <div style="width:${barWidth}%; background-color:${itemColor}; height:100%; border-radius:4px; display:flex; align-items:center; padding-left:8px; color:white; font-weight:700; font-family:'JetBrains Mono', monospace; font-size:11px; transition: width 0.6s cubic-bezier(0.16,1,0.3,1);">
            ${d.value}
          </div>
        </div>
        <div style="width:50px; font-weight:700; color:#059669; font-family:'JetBrains Mono';">${Math.round(ratio * 100)}%</div>
      </div>
    `;
  });

  container.innerHTML = `
    <div style="padding:10px 0;">
      ${funnelRows}
    </div>
  `;
}

/**
 * Draws a tiny SVG Sparkline inside a small container
 */
export function svgSparkline(data, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const max = Math.max(...data) || 1;
  const w = 80;
  const h = 20;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(' ');

  container.innerHTML = `
    <svg width="${w}" height="${h}">
      <polyline fill="none" stroke="#2563eb" stroke-width="1.8" points="${points}" />
    </svg>
  `;
}
