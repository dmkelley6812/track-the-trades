export default function ExpectancyLogo({ className = "w-10 h-10" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Disjointed futuristic E - Tesla style */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      
      {/* Top horizontal bar */}
      <rect x="20" y="15" width="60" height="12" fill="url(#logoGradient)" rx="2" />
      
      {/* Vertical bar - slightly offset */}
      <rect x="20" y="15" width="12" height="70" fill="url(#logoGradient)" rx="2" />
      
      {/* Middle horizontal bar - shorter and offset */}
      <rect x="20" y="44" width="45" height="12" fill="url(#logoGradient)" rx="2" />
      
      {/* Bottom horizontal bar */}
      <rect x="20" y="73" width="60" height="12" fill="url(#logoGradient)" rx="2" />
      
      {/* Accent dots for futuristic feel */}
      <circle cx="85" cy="21" r="3" fill="#10b981" opacity="0.6" />
      <circle cx="70" cy="50" r="3" fill="#10b981" opacity="0.6" />
      <circle cx="85" cy="79" r="3" fill="#10b981" opacity="0.6" />
    </svg>
  );
}