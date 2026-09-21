import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onGetStartedClick: () => void;
}

export function Hero({ onGetStartedClick }: HeroProps) {
  return (
    <section className="pt-16 pb-40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Glass badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-8"
        >
          <div
            className="px-6 py-2 rounded-full text-white text-sm font-semibold tracking-wide"
            style={{
              background: 'rgba(220,38,38,0.25)',
              border: '1px solid rgba(220,38,38,0.5)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 0 24px rgba(220,38,38,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            Trade with up to $200,000
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight"
        >
          Become a{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626, #ff6b6b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Funded Trader
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-2xl text-gray-400 mb-14 max-w-3xl mx-auto"
        >
          Choose your account size. Pass our evaluation. Keep up to 90% of your profits.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex justify-center"
        >
          <button
            onClick={onGetStartedClick}
            className="group relative px-12 py-5 text-white text-lg rounded-xl font-semibold flex items-center gap-3 overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(220,38,38,0.9), rgba(185,28,28,0.9))',
              border: '1px solid rgba(255,100,100,0.35)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(220,38,38,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(220,38,38,0.9))',
              }}
            />
            <span className="relative">Get Funded Now</span>
            <ArrowRight className="relative" size={22} />
          </button>
        </motion.div>

        {/* Glass stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          {[
            { label: 'Max Funding', value: '$200K' },
            { label: 'Profit Split', value: 'Up to 90%' },
            { label: 'Payout Speed', value: '24h' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5 text-center"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
              }}
            >
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
