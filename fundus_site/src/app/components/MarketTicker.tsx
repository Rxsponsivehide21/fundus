import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  up: boolean;
}

const TICKER_DATA: TickerItem[] = [
  { symbol: 'EUR/USD', price: '1.0842', change: '+0.12%', up: true },
  { symbol: 'GBP/USD', price: '1.2731', change: '+0.08%', up: true },
  { symbol: 'USD/JPY', price: '149.62', change: '-0.21%', up: false },
  { symbol: 'XAU/USD', price: '2,384.50', change: '+0.64%', up: true },
  { symbol: 'BTC/USD', price: '67,214', change: '+2.35%', up: true },
  { symbol: 'ETH/USD', price: '3,412', change: '+1.18%', up: true },
  { symbol: 'US30', price: '38,912', change: '-0.14%', up: false },
  { symbol: 'NAS100', price: '17,845', change: '+0.47%', up: true },
  { symbol: 'WTI/USD', price: '78.34', change: '-0.32%', up: false },
  { symbol: 'AUD/USD', price: '0.6512', change: '+0.05%', up: true },
];

function TickerRow({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className="flex items-center" aria-hidden={ariaHidden}>
      {TICKER_DATA.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-6 py-2 whitespace-nowrap shrink-0"
          style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-gray-300 text-xs font-semibold tracking-wide">{item.symbol}</span>
          <span className="text-white text-xs font-bold">{item.price}</span>
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              item.up ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {item.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {item.change}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MarketTicker() {
  // Randomize duration slightly per mount so it always feels alive, never static.
  const duration = useMemo(() => 38, []);

  return (
    <div
      className="relative z-40 overflow-hidden"
      style={{
        background: 'rgba(0,0,0,0.55)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="marquee-track" style={{ animationDuration: `${duration}s` }}>
        <TickerRow />
        <TickerRow ariaHidden />
      </div>

      {/* Edge fades so the ticker scrolls in/out smoothly rather than clipping hard */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16"
        style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.7), transparent)' }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16"
        style={{ background: 'linear-gradient(270deg, rgba(0,0,0,0.7), transparent)' }}
      />
    </div>
  );
}
