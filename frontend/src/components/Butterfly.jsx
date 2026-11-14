export default function Butterfly() {
  const wing = (
    <g className="flap">
      <path d="M100 80 C 120 20, 185 8, 192 50 C 196 82, 140 96, 100 82 Z" fill="url(#wingGrad)" stroke="#F2CFCA" strokeOpacity="0.7" strokeWidth="1" />
      <path d="M100 85 C 138 92, 172 106, 162 137 C 152 162, 112 142, 100 90 Z" fill="url(#wingGrad2)" stroke="#F2CFCA" strokeOpacity="0.7" strokeWidth="1" />
      <path d="M100 82 C 125 55, 160 38, 182 46" fill="none" stroke="#F2CFCA" strokeOpacity="0.35" strokeWidth="0.8" />
      <path d="M100 83 C 130 72, 165 70, 186 62" fill="none" stroke="#F2CFCA" strokeOpacity="0.3" strokeWidth="0.8" />
      <path d="M100 88 C 125 100, 145 115, 152 133" fill="none" stroke="#F2CFCA" strokeOpacity="0.3" strokeWidth="0.8" />
      <circle cx="160" cy="52" r="5" fill="#F2CFCA" fillOpacity="0.35" />
    </g>
  );
  return (
    <svg className="butterfly" viewBox="0 0 200 170" role="img" aria-label="Butterfly">
      <defs>
        <linearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2CFCA" stopOpacity="0.85" />
          <stop offset="1" stopColor="#EC9C9D" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="wingGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EC9C9D" stopOpacity="0.7" />
          <stop offset="1" stopColor="#AA7F66" stopOpacity="0.25" />
        </linearGradient>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow)">
        {wing}
        <g transform="translate(200 0) scale(-1 1)">{wing}</g>
        <ellipse cx="100" cy="86" rx="3.6" ry="24" fill="#F2CFCA" />
        <path d="M100 64 C 96 48, 88 40, 80 36" fill="none" stroke="#F2CFCA" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M100 64 C 104 48, 112 40, 120 36" fill="none" stroke="#F2CFCA" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
