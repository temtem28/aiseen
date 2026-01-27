interface WorldMapWidgetProps {
  title: string;
  data?: Array<{
    country: string;
    value: number;
    lat: number;
    lng: number;
  }>;
}

export default function WorldMapWidget({ title, data = [] }: WorldMapWidgetProps) {
  // Default data points for demonstration
  const defaultData = [
    { country: 'USA', value: 85, lat: 40, lng: 25 },
    { country: 'France', value: 72, lat: 35, lng: 52 },
    { country: 'UK', value: 68, lat: 32, lng: 48 },
    { country: 'Germany', value: 65, lat: 33, lng: 52 },
    { country: 'Japan', value: 58, lat: 38, lng: 82 },
    { country: 'Australia', value: 45, lat: 72, lng: 80 },
    { country: 'Brazil', value: 42, lat: 62, lng: 35 },
  ];

  const points = data.length > 0 ? data : defaultData;

  return (
    <div className="bg-[#0d1321] rounded-2xl p-5 border border-[#1a2332] h-full">
      <h3 className="text-white font-semibold mb-4">{title}</h3>
      
      <div className="relative w-full h-48 overflow-hidden">
        {/* Simplified world map SVG */}
        <svg viewBox="0 0 100 50" className="w-full h-full opacity-30">
          {/* Simplified continents */}
          {/* North America */}
          <path 
            d="M10,8 Q15,5 25,8 L28,15 Q25,20 20,22 L15,20 Q8,15 10,8" 
            fill="#1e3a5f" 
            stroke="#22d3ee" 
            strokeWidth="0.2"
          />
          {/* South America */}
          <path 
            d="M22,25 Q28,28 30,35 L28,45 Q22,48 20,42 L18,32 Q18,26 22,25" 
            fill="#1e3a5f" 
            stroke="#22d3ee" 
            strokeWidth="0.2"
          />
          {/* Europe */}
          <path 
            d="M45,8 Q55,6 58,10 L56,15 Q50,18 45,15 Q42,12 45,8" 
            fill="#1e3a5f" 
            stroke="#22d3ee" 
            strokeWidth="0.2"
          />
          {/* Africa */}
          <path 
            d="M48,18 Q55,16 58,22 L56,35 Q50,40 48,35 L46,25 Q45,20 48,18" 
            fill="#1e3a5f" 
            stroke="#22d3ee" 
            strokeWidth="0.2"
          />
          {/* Asia */}
          <path 
            d="M60,5 Q75,3 88,8 L90,18 Q85,25 75,22 L65,18 Q58,12 60,5" 
            fill="#1e3a5f" 
            stroke="#22d3ee" 
            strokeWidth="0.2"
          />
          {/* Australia */}
          <path 
            d="M78,32 Q85,30 88,35 L86,42 Q80,45 78,40 Q76,36 78,32" 
            fill="#1e3a5f" 
            stroke="#22d3ee" 
            strokeWidth="0.2"
          />
        </svg>

        {/* Data points */}
        {points.map((point, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ 
              left: `${point.lng}%`, 
              top: `${point.lat}%`,
            }}
          >
            {/* Pulse animation */}
            <div 
              className="absolute w-4 h-4 rounded-full bg-cyan-400 animate-ping opacity-30"
              style={{ animationDelay: `${index * 0.2}s` }}
            />
            {/* Point */}
            <div 
              className="relative w-3 h-3 rounded-full bg-cyan-400 shadow-lg"
              style={{ boxShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee40' }}
            />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1a2332] rounded text-xs text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {point.country}: {point.value}%
            </div>
          </div>
        ))}

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div 
              key={`h-${i}`}
              className="absolute w-full border-t border-cyan-900/20"
              style={{ top: `${(i + 1) * 20}%` }}
            />
          ))}
          {[...Array(7)].map((_, i) => (
            <div 
              key={`v-${i}`}
              className="absolute h-full border-l border-cyan-900/20"
              style={{ left: `${(i + 1) * 14}%` }}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-lg font-bold text-cyan-400">{points.length}</p>
          <p className="text-xs text-gray-500">Pays</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-400">
            {Math.round(points.reduce((acc, p) => acc + p.value, 0) / points.length)}%
          </p>
          <p className="text-xs text-gray-500">Moy. Visibilité</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-purple-400">+12%</p>
          <p className="text-xs text-gray-500">Croissance</p>
        </div>
      </div>
    </div>
  );
}
