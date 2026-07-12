import React from 'react';

/* ─── Circular progress gauge ─────────────────────────────────── */
const CircularGauge = ({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) => {
  const r = 38;
  const size = 104;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1E2038" strokeWidth="7" />
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold leading-none" style={{ color }}>
            {value}
          </span>
          <span className="text-[10px] text-gray-500">/100</span>
        </div>
      </div>
      <span className="text-[11px] font-semibold text-gray-300 tracking-wide">{label}</span>
    </div>
  );
};

/* ─── Main component ───────────────────────────────────────────── */
const DashboardMockup: React.FC = () => {
  const barData = [
    { month: 'Jan', seo: 48, aeo: 30 },
    { month: 'Fév', seo: 55, aeo: 38 },
    { month: 'Mar', seo: 60, aeo: 42 },
    { month: 'Avr', seo: 67, aeo: 50 },
    { month: 'Mai', seo: 70, aeo: 55 },
    { month: 'Jun', seo: 72, aeo: 58 },
  ];

  const aiSources = [
    { name: 'ChatGPT', color: '#10A37F', count: 6 },
    { name: 'Gemini', color: '#6366F1', count: 4 },
    { name: 'Claude', color: '#F59E0B', count: 2 },
    { name: 'Perplexity', color: '#06B6D4', count: 2 },
  ];

  return (
    <div
      className="w-full rounded-xl shadow-2xl overflow-hidden select-none"
      style={{ background: '#0F0F1A', border: '1px solid #1E2038' }}
    >
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ background: '#13132A', borderBottom: '1px solid #1E2038' }}
      >
        {/* Left: logo + breadcrumb */}
        <div className="flex items-center gap-3">
          <span className="font-extrabold tracking-[0.18em] text-sm" style={{ color: '#6366F1' }}>
            ZINERIS
          </span>
          <span className="text-gray-600 text-xs">/</span>
          <span className="text-xs text-gray-400">Tableau de bord</span>
        </div>
        {/* Right: status + fake URL bar */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md text-xs text-gray-400"
            style={{ background: '#0F0F1A', border: '1px solid #1E2038' }}>
            <span style={{ color: '#34D399' }}>●</span>
            <span>zineris.com</span>
          </div>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: '#6366F133', color: '#818CF8' }}
          >
            Z
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="p-5 grid grid-cols-3 gap-4">

        {/* Col 1 — Scores gauges */}
        <div className="col-span-1">
          <div
            className="rounded-lg p-4 flex flex-col items-center gap-4 h-full"
            style={{ background: '#13132A', border: '1px solid #1E2038' }}
          >
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest self-start">
              Scores
            </span>
            <CircularGauge value={72} label="Score SEO" color="#6366F1" />
            <div className="w-full border-t" style={{ borderColor: '#1E2038' }} />
            <CircularGauge value={58} label="Score AEO" color="#F59E0B" />
          </div>
        </div>

        {/* Col 2-3 — Citations + Chart */}
        <div className="col-span-2 flex flex-col gap-4">

          {/* Citations card */}
          <div
            className="rounded-lg p-4"
            style={{ background: '#13132A', border: '1px solid #1E2038' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                Citations IA
              </span>
              <span className="text-base font-bold" style={{ color: '#34D399' }}>
                Cité 14 fois
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiSources.map((ai) => (
                <div
                  key={ai.name}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: `${ai.color}1A`,
                    border: `1px solid ${ai.color}50`,
                    color: ai.color,
                  }}
                >
                  {ai.name}
                  <span className="font-bold opacity-80">{ai.count}×</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart — Évolution sur 6 mois */}
          <div
            className="rounded-lg p-4"
            style={{ background: '#13132A', border: '1px solid #1E2038' }}
          >
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block mb-4">
              Évolution sur 6 mois
            </span>

            {/* Bars */}
            <div className="flex items-end justify-between gap-2" style={{ height: 80 }}>
              {barData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 items-end" style={{ height: 64 }}>
                    <div
                      className="flex-1 rounded-t-sm transition-all"
                      style={{
                        height: `${d.seo}%`,
                        background: '#6366F1',
                        minHeight: 4,
                        opacity: 0.9,
                      }}
                    />
                    <div
                      className="flex-1 rounded-t-sm transition-all"
                      style={{
                        height: `${d.aeo}%`,
                        background: '#F59E0B',
                        minHeight: 4,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-600">{d.month}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#6366F1' }} />
                <span className="text-[10px] text-gray-400">SEO</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#F59E0B' }} />
                <span className="text-[10px] text-gray-400">AEO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom status bar ───────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-2 text-[10px] text-gray-600"
        style={{ borderTop: '1px solid #1E2038' }}
      >
        <span>Dernière analyse · il y a 2 min</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34D399' }} />
          <span style={{ color: '#34D399' }}>À jour</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardMockup;
