import React from 'react';

const positions = {
  'Uttara Kannada': { cx: 120, cy: 160 },
  Bagalkot: { cx: 200, cy: 220 },
  Ballari: { cx: 310, cy: 250 },
  Kalaburagi: { cx: 385, cy: 195 },
  'Bangalore Rural': { cx: 300, cy: 360 },
};

export default function KarnatakaMap({ districts, selected, onSelect, calcWHI, riskColor, getScore }) {
  const scoreFn = getScore || calcWHI;
  const outline =
    'M80,80 L160,50 L260,60 L340,80 L420,120 L450,200 L420,300 L370,380 L300,420 L220,440 L150,400 L100,340 L70,260 L60,180 Z';

  return (
    <svg viewBox="0 0 520 480" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#ede9fe" />
        </linearGradient>
      </defs>
      <rect width="520" height="480" fill="#f0f4ff" rx="12" />
      <path d={outline} fill="url(#mapBg)" stroke="#a78bfa" strokeWidth="2.5" opacity="0.6" />
      {[100, 200, 300, 400].map((x) => (
        <line key={`vl${x}`} x1={x} y1={0} x2={x} y2={480} stroke="#c4b5fd" strokeWidth="0.5" opacity="0.4" />
      ))}
      {[100, 200, 300, 400].map((y) => (
        <line key={`hl${y}`} x1={0} y1={y} x2={520} y2={y} stroke="#c4b5fd" strokeWidth="0.5" opacity="0.4" />
      ))}
      <text x="260" y="22" textAnchor="middle" fontSize="12" fontWeight="700" fill="#5D3EBC" fontFamily="Fraunces, serif">
        Karnataka — Women&apos;s Health index (WHI)
      </text>
      {districts.map((d) => {
        const pos = positions[d.name];
        if (!pos) return null;
        const whi = scoreFn(d);
        const isSelected = selected?.id === d.id;
        const color = riskColor(d.risk);
        const r = 30 + (d.population / 280000) * 8;
        return (
          <g
            key={d.id}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect(d)}
            filter={isSelected ? 'url(#glow)' : ''}
          >
            <circle cx={pos.cx} cy={pos.cy} r={r + 12} fill={color} opacity={0.12} />
            <circle
              cx={pos.cx}
              cy={pos.cy}
              r={r}
              fill={color}
              opacity={isSelected ? 0.4 : 0.22}
              stroke={isSelected ? color : 'transparent'}
              strokeWidth={isSelected ? 2.5 : 0}
            />
            <circle cx={pos.cx} cy={pos.cy} r={22} fill={isSelected ? color : 'white'} stroke={color} strokeWidth={2.5} />
            <text
              x={pos.cx}
              y={pos.cy + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="13"
              fontWeight="700"
              fill={isSelected ? 'white' : color}
              fontFamily="DM Sans, sans-serif"
            >
              {whi}
            </text>
            <text
              x={pos.cx}
              y={pos.cy + r + 16}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="600"
              fill="#475569"
              fontFamily="DM Sans, sans-serif"
            >
              {d.name}
            </text>
            <circle cx={pos.cx + 17} cy={pos.cy - 17} r={5} fill={color} />
          </g>
        );
      })}
      <g transform="translate(16,430)">
        {[
          ['High risk', '#ef4444'],
          ['Moderate', '#f59e0b'],
          ['Low risk', '#22c55e'],
        ].map(([l, c], i) => (
          <g key={l} transform={`translate(${i * 110},0)`}>
            <circle cx={8} cy={8} r={7} fill={c} opacity={0.3} />
            <circle cx={8} cy={8} r={4} fill={c} />
            <text x={18} y={12} fontSize="10" fill="#475569" fontFamily="DM Sans, sans-serif">
              {l}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
