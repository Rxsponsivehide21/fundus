import { AlertCircle, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export function TradingObjectives() {
  const objectives = [
    {
      icon: TrendingUp,
      title: 'Profit Target',
      phase1: '10%',
      phase2: '5%',
      funded: 'No Target',
      description: 'Achieve this profit to pass the phase',
    },
    {
      icon: TrendingDown,
      title: 'Maximum Daily Loss',
      phase1: '5%',
      phase2: '5%',
      funded: '5%',
      description: 'Daily loss limit based on account balance',
    },
    {
      icon: AlertCircle,
      title: 'Maximum Loss',
      phase1: '10%',
      phase2: '10%',
      funded: '10%',
      description: 'Total loss limit for the account',
    },
    {
      icon: Calendar,
      title: 'Minimum Trading Days',
      phase1: '4 days',
      phase2: '4 days',
      funded: 'None',
      description: 'Required active trading days',
    },
  ];

  return (
    <section id="rules" className="py-32 px-4 sm:px-6 lg:px-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">Trading Rules</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Simple, transparent objectives across all account sizes
          </p>
        </div>

        <div
          className="rounded-2xl shadow-xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Objective</th>
                  <th className="px-6 py-4 text-center">Phase 1</th>
                  <th className="px-6 py-4 text-center">Phase 2</th>
                  <th className="px-6 py-4 text-center">Funded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {objectives.map((objective, index) => (
                  <tr key={index} className="hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <objective.icon className="text-white" size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{objective.title}</div>
                          <div className="text-sm text-gray-500">{objective.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-white">
                      {objective.phase1}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-white">
                      {objective.phase2}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-white">
                      {objective.funded}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 p-6 bg-red-600 rounded-xl">
          <div className="flex gap-3">
            <AlertCircle className="text-white flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-white mb-2">Important Note</h4>
              <p className="text-white">
                All profit targets are calculated from the initial balance. Maximum loss limits are
                based on the equity high-water mark. You can hold positions over the weekend and
                there are no restrictions on trading during news events.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
