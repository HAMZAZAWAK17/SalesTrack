import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * 1. LineChart Component
 * Draws a smooth sales trend line with a gradient area underneath and interactive hover highlights.
 */
export function LineChart({ data = [], height = 240 }) {
  const { theme } = useAuth();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 text-sm font-semibold">
        Aucune donnée de vente disponible.
      </div>
    );
  }

  const padding = { top: 30, right: 30, bottom: 40, left: 55 };
  const svgWidth = 500;
  const svgHeight = height;

  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Extract values
  const salesValues = data.map(d => d.sales);
  const maxVal = Math.max(...salesValues, 1000) * 1.15; // 15% headroom
  const minVal = 0;

  // Calculate coordinates
  const points = data.map((d, idx) => {
    const x = padding.left + (idx / (data.length - 1)) * chartWidth;
    const ratio = maxVal - minVal > 0 ? (d.sales - minVal) / (maxVal - minVal) : 0;
    const y = padding.top + chartHeight - ratio * chartHeight;
    return { x, y, label: d.label, sales: d.sales };
  });

  // Construct path string
  let pathD = '';
  let areaD = '';

  if (points.length > 0) {
    // Smooth Bezier Curve Control
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      // Control points
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    // Area path closes at bottom of chart
    areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
  }

  // Y Axis ticks (4 levels)
  const yTicks = [0, 0.33, 0.66, 1].map(ratio => {
    const value = Math.round(minVal + ratio * (maxVal - minVal));
    const y = padding.top + chartHeight - ratio * chartHeight;
    return { value, y };
  });

  return (
    <div className="w-full relative select-none">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
        <defs>
          {/* Glowing Area Fill Gradient (Indigo to Transparent) */}
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
          {/* Main Line Stroke Gradient (Indigo to Purple) */}
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* 1. Horizontal Y-axis Grid Lines */}
        {yTicks.map((tick, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={tick.y}
            x2={svgWidth - padding.right}
            y2={tick.y}
            stroke="rgba(148, 163, 184, 0.08)"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
        ))}

        {/* 2. Gradient Area Under the Curve */}
        {areaD && <path d={areaD} fill="url(#areaGrad)" />}

        {/* 3. Main Sales Trend Line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500"
          />
        )}

        {/* 4. Interactive Hover Vertical Track Line */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <line
            x1={points[hoveredIdx].x}
            y1={padding.top}
            x2={points[hoveredIdx].x}
            y2={padding.top + chartHeight}
            stroke="rgba(99, 102, 241, 0.3)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        )}

        {/* 5. Highlight Nodes on Curve */}
        {points.map((pt, idx) => (
          <g
            key={idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className="cursor-pointer"
          >
            {/* Extended hover capture zone */}
            <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
            
            {/* Core Node Circle */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === idx ? "7" : "4.5"}
              fill={hoveredIdx === idx ? "#ec4899" : "#6366f1"}
              stroke={theme === 'dark' ? '#040a17' : '#ffffff'}
              strokeWidth="2"
              className="transition-all duration-200 shadow-md"
            />
          </g>
        ))}

        {/* 6. Y-axis Labels */}
        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={padding.left - 10}
            y={tick.y + 4}
            textAnchor="end"
            className="text-[10px] font-extrabold fill-slate-400"
          >
            {tick.value.toLocaleString('fr-FR')} €
          </text>
        ))}

        {/* 7. X-axis Labels */}
        {points.map((pt, idx) => (
          <text
            key={idx}
            x={pt.x}
            y={padding.top + chartHeight + 22}
            textAnchor="middle"
            className={`text-[9px] font-bold transition-colors duration-200 ${
              hoveredIdx === idx ? 'fill-indigo-400 font-extrabold' : 'fill-slate-500'
            }`}
          >
            {pt.label}
          </text>
        ))}
      </svg>

      {/* 8. Interactive Tooltip Panel */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <div
          className="absolute z-20 pointer-events-none p-2.5 rounded-xl border text-[11px] font-bold shadow-xl animate-fade-in glass-panel border-slate-700/80 bg-slate-900/95 text-slate-100"
          style={{
            left: `${(points[hoveredIdx].x / svgWidth) * 100}%`,
            top: `${(points[hoveredIdx].y / svgHeight) * 100 - 30}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-1">
            {points[hoveredIdx].label}
          </div>
          <div className="text-sm font-extrabold text-indigo-300">
            {points[hoveredIdx].sales.toLocaleString('fr-FR')} €
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 2. DonutChart Component
 * Draws client category distribution breakdown using responsive SVG radial segments with meaningful colors.
 */
export function DonutChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 text-sm font-semibold">
        Aucune donnée de catégorie disponible.
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Modern, distinct semantic colors for categories
  const categoryColors = {
    HOTEL: '#f43f5e',       // Rose / Red (Hotels)
    RESTAURANT: '#f97316',  // Vivid Orange (Restaurants)
    CAFE: '#eab308',        // Golden Yellow (Cafes)
    GROCERY: '#10b981',     // Emerald Green (Groceries)
    SUPERMARKET: '#06b6d4',  // Cyan/Teal (Supermarkets)
    TRADITIONAL: '#3b82f6',  // Electric Blue (Traditional)
    OTHER: '#64748b',       // Slate Grey (Others)
    AUTRE: '#64748b',
  };

  const categoryLabels = {
    HOTEL: 'Hôtels',
    RESTAURANT: 'Restaurants',
    CAFE: 'Cafés',
    GROCERY: 'Épiceries',
    SUPERMARKET: 'Supermarchés',
    TRADITIONAL: 'Traditionnel',
    OTHER: 'Autre',
    AUTRE: 'Autre',
  };

  // Circle dimensions
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // 314.159
  const center = 60;
  const size = center * 2;

  // Calculate slice data with cumulative offsets
  let cumulativeOffset = 0;
  const slices = data.map((d, idx) => {
    const rawCat = d.category || d.status || 'OTHER';
    const cleanCat = rawCat.toUpperCase();
    
    const percentage = total > 0 ? d.count / total : 0;
    const dashArray = `${percentage * circumference} ${circumference}`;
    const dashOffset = -cumulativeOffset;
    cumulativeOffset += percentage * circumference;

    return {
      categoryKey: cleanCat,
      label: categoryLabels[cleanCat] || rawCat,
      count: d.count,
      percentage: Math.round(percentage * 100),
      dashArray,
      dashOffset,
      color: categoryColors[cleanCat] || '#8b5cf6' // Fallback to purple
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-2 w-full">
      {/* Donut SVG Ring */}
      <div className="relative w-36 h-36 shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
          {/* Base Empty Circle Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(148, 163, 184, 0.05)"
            strokeWidth={strokeWidth}
          />
          
          {/* Colored Segments */}
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={hoveredIdx === idx ? strokeWidth + 2 : strokeWidth}
              strokeDasharray={slice.dashArray}
              strokeDashoffset={slice.dashOffset}
              strokeLinecap={slice.count > 0 ? "round" : "butt"}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="transition-all duration-300 cursor-pointer origin-center"
              style={{
                transform: hoveredIdx === idx ? 'scale(1.03)' : 'scale(1.0)',
              }}
            />
          ))}
        </svg>
        
        {/* Core Center Info Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center">
          <span className="text-xl font-black text-slate-100 leading-none">
            {hoveredIdx !== null ? slices[hoveredIdx].count : total}
          </span>
          <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider mt-1.5 max-w-[80px] truncate">
            {hoveredIdx !== null ? slices[hoveredIdx].label : 'Clients'}
          </span>
        </div>
      </div>

      {/* Side Legend Panel */}
      <div className="flex-1 w-full space-y-1.5">
        {slices.map((slice, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-1.5 rounded-lg border transition-premium ${
              hoveredIdx === idx
                ? 'bg-slate-900/40 border-slate-700/60'
                : 'border-transparent bg-transparent'
            }`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
              <span className="text-xs font-bold text-slate-350 truncate" title={slice.label}>
                {slice.label}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-extrabold text-slate-200">{slice.count}</span>
              <span className="text-[10px] text-slate-500 font-bold ml-1.5">({slice.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 3. HorizontalBarChart Component
 * Displays a clean horizontal bar comparison chart, ideal for comparing team member sales.
 */
export function HorizontalBarChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 text-sm font-semibold">
        Aucune donnée de performance d'équipe.
      </div>
    );
  }

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 1);

  return (
    <div className="w-full space-y-4">
      {data.map((item, idx) => {
        const percentage = Math.min(Math.round((item.value / maxVal) * 100), 100);
        return (
          <div
            key={idx}
            className="space-y-1.5 cursor-pointer group"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="flex items-center justify-between text-xs font-bold leading-none">
              <span className="text-slate-350 hover:text-indigo-400 transition-colors">
                {item.label}
              </span>
              <span className="font-extrabold text-indigo-300">
                {item.value.toLocaleString('fr-FR')} {item.unit || ''}
              </span>
            </div>
            
            {/* Track Frame */}
            <div className="h-3.5 w-full bg-slate-900/60 rounded-full border border-slate-800/40 overflow-hidden relative">
              {/* Highlight Bar */}
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${
                  idx % 2 === 0
                    ? 'from-indigo-600 via-indigo-500 to-indigo-400'
                    : 'from-purple-600 via-purple-500 to-purple-400'
                }`}
                style={{ width: `${percentage}%` }}
              >
                {/* Micro reflection shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
