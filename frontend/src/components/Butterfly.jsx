export default function Butterfly({ className = "" }) {
  const upper = "M120 96 C92 18 22 6 14 54 C10 92 62 112 120 102 Z";
  const lower = "M120 104 C72 106 30 132 50 172 C70 198 112 162 120 114 Z";

  const wing = (
    <g className="bf-wing">
      <path d={upper} fill="url(#bfGrad)" stroke="#F2CFCA" strokeWidth="1.4" strokeOpacity="0.7" />
      <path d={lower} fill="url(#bfGrad2)" stroke="#F2CFCA" strokeWidth="1.4" strokeOpacity="0.7" />
      <path d="M118 98 C86 62 50 40 26 48" fill="none" stroke="#F2CFCA" strokeWidth="1" strokeOpacity="0.45" />
      <path d="M118 100 C84 86 50 82 24 76" fill="none" stroke="#F2CFCA" strokeWidth="1" strokeOpacity="0.45" />
      <path d="M118 108 C88 122 64 140 54 162" fill="none" stroke="#F2CFCA" strokeWidth="1" strokeOpacity="0.45" />
      <circle cx="52" cy="58" r="9" fill="#443025" fillOpacity="0.55" stroke="#F2CFCA" strokeOpacity="0.6" />
      <circle cx="52" cy="58" r="3.5" fill="#F2CFCA" fillOpacity="0.9" />
      <circle cx="66" cy="150" r="6" fill="#443025" fillOpacity="0.5" stroke="#F2CFCA" strokeOpacity="0.6" />
      <circle cx="66" cy="150" r="2.4" fill="#F2CFCA" fillOpacity="0.9" />
    </g>
  );

  return (
    <svg className={"bf-svg " + className} viewBox="0 0 240 200" role="img" aria-label="Butterfly">
      <defs>
        <linearGradient id="bfGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2CFCA" />
          <stop offset="55%" stopColor="#EC9C9D" />
          <stop offset="100%" stopColor="#AA7F66" />
        </linearGradient>
        <linearGradient id="bfGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EC9C9D" />
          <stop offset="100%" stopColor="#7F5836" />
        </linearGradient>
      </defs>
      <g>{wing}</g>
      <g transform="translate(240,0) scale(-1,1)">{wing}</g>
      <ellipse cx="120" cy="104" rx="5" ry="30" fill="#443025" stroke="#F2CFCA" strokeOpacity="0.8" strokeWidth="1.2" />
      <circle cx="120" cy="70" r="6" fill="#443025" stroke="#F2CFCA" strokeOpacity="0.8" strokeWidth="1.2" />
      <path d="M118 66 C110 48 100 40 92 36" fill="none" stroke="#F2CFCA" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M122 66 C130 48 140 40 148 36" fill="none" stroke="#F2CFCA" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="92" cy="36" r="2.4" fill="#F2CFCA" />
      <circle cx="148" cy="36" r="2.4" fill="#F2CFCA" />
    </svg>
  );
}
