import { Target, Zap, Trophy } from 'lucide-react';

export function EvaluationPrograms() {
  const programs = [
    {
      icon: Target,
      title: 'Normal Challenge',
      description: 'Two-step evaluation process with clear profit targets',
      features: [
        'Phase 1: 10% profit target',
        'Phase 2: 5% profit target',
        'Maximum daily loss: 5%',
        'Maximum loss: 10%',
      ],
      popular: false,
    },
    {
      icon: Zap,
      title: 'Rapid Challenge',
      description: 'One-step evaluation for experienced traders',
      features: [
        'Single phase: 10% profit target',
        'Maximum daily loss: 5%',
        'Maximum loss: 10%',
        'Faster path to funding',
      ],
      popular: true,
    },
    {
      icon: Trophy,
      title: 'Direct Funding',
      description: 'Skip evaluation and start trading immediately',
      features: [
        'No evaluation required',
        'Instant access to capital',
        'Higher profit split',
        'Premium support',
      ],
      popular: false,
    },
  ];

  return (
    <section id="programs" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4">Choose Your Path</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Select the evaluation program that matches your trading style and experience level
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <div
              key={index}
              className={`bg-black rounded-2xl p-8 shadow-lg hover:shadow-xl transition relative ${
                program.popular ? 'ring-2 ring-blue-600' : 'border border-gray-800'
              }`}
            >
              {program.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm rounded-full">
                  Most Popular
                </div>
              )}
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <program.icon className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{program.title}</h3>
              <p className="text-gray-400 mb-6">{program.description}</p>
              <ul className="space-y-3 mb-8">
                {program.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg transition ${
                  program.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
