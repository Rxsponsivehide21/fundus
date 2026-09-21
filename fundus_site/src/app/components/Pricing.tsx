import { Check, Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface PricingProps {
  onGetStartedClick: () => void;
}

export function Pricing({ onGetStartedClick }: PricingProps) {
  const plans = [
    { name: '$10K', fullName: '$10,000 Account', price: '155', balance: '$10,000', profitSplit: '80%', popular: false },
    { name: '$25K', fullName: '$25,000 Account', price: '275', balance: '$25,000', profitSplit: '80%', popular: false },
    { name: '$50K', fullName: '$50,000 Account', price: '425', balance: '$50,000', profitSplit: '80%', popular: true },
    { name: '$100K', fullName: '$100,000 Account', price: '575', balance: '$100,000', profitSplit: '80%', popular: false },
    { name: '$200K', fullName: '$200,000 Account', price: '1,275', balance: '$200,000', profitSplit: '90%', popular: false },
  ];

  const marqueeItems = [
    ...plans.map((p) => ({ label: `${p.name} ACCOUNT — $${p.price}`, hot: p.popular })),
    { label: 'UP TO 90% PROFIT SPLIT', hot: false },
    { label: 'REFUNDABLE FEE AT FIRST PAYOUT', hot: false },
  ];

  return (
    <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">Funding Tiers</h2>
          <p className="text-2xl text-gray-400 max-w-3xl mx-auto">
            All accounts include the same trading rules and profit splits
          </p>
        </div>

        {/* Scrolling price marquee */}
        <div
          className="relative overflow-hidden mb-20 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, rgba(220,38,38,0.14), rgba(0,0,0,0.35), rgba(220,38,38,0.14))',
            border: '1px solid rgba(220,38,38,0.25)',
          }}
        >
          <div className="marquee-track py-3" style={{ animationDuration: '26s' }}>
            {[marqueeItems, marqueeItems].map((set, setIdx) => (
              <div key={setIdx} className="flex items-center" aria-hidden={setIdx === 1}>
                {set.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-6 whitespace-nowrap shrink-0">
                    {item.hot && <Flame size={14} className="text-red-400" />}
                    <span
                      className={`text-sm font-bold tracking-wide ${item.hot ? 'text-red-400' : 'text-white/80'}`}
                    >
                      {item.label}
                    </span>
                    <span className="text-white/20 mx-4">•</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-20"
            style={{ background: 'linear-gradient(90deg, rgba(9,9,11,0.9), transparent)' }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-20"
            style={{ background: 'linear-gradient(270deg, rgba(9,9,11,0.9), transparent)' }}
          />
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="relative rounded-2xl p-8 shadow-2xl transition-all duration-300"
              style={
                plan.popular
                  ? {
                      background: 'rgba(220,38,38,0.12)',
                      border: '2px solid rgba(220,38,38,0.7)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      boxShadow: '0 0 40px rgba(220,38,38,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                      scale: '1.03',
                    }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                    }
              }
            >
              {/* Glass sheen */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)',
                }}
              />

              {plan.popular && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-white text-xs font-semibold rounded-full whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                    boxShadow: '0 4px 14px rgba(220,38,38,0.5)',
                  }}
                >
                  Most Popular
                </div>
              )}

              <div className="text-center relative">
                <div className="text-4xl font-bold text-white mb-1">{plan.name}</div>
                <div className="text-gray-400 text-xs mb-7">{plan.fullName}</div>

                <div
                  className="mb-7 pb-7"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="text-gray-500 text-xs mb-1">One-time fee</div>
                  <div className="text-3xl font-bold text-white mb-1">${plan.price}</div>
                  <div className="text-red-400 text-xs">Refunded at first payout</div>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <div className="text-gray-500 text-xs">Account Balance</div>
                    <div className="text-xl font-bold text-white">{plan.balance}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Your Profit Share</div>
                    <div className="text-xl font-bold text-red-400">{plan.profitSplit}</div>
                  </div>
                </div>

                <button
                  onClick={onGetStartedClick}
                  className="w-full py-3.5 rounded-xl font-semibold transition-all duration-200 relative overflow-hidden"
                  style={
                    plan.popular
                      ? {
                          background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                          color: '#fff',
                          boxShadow: '0 4px 20px rgba(220,38,38,0.45)',
                          border: 'none',
                        }
                      : {
                          background: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                        }
                  }
                >
                  Start Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div
            className="inline-flex items-center gap-8 px-8 py-4 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            {['No time limits', 'Weekend holding allowed', 'All trading platforms'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-gray-400">
                <Check className="text-red-500 shrink-0" size={18} />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
