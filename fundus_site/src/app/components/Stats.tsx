import { Users, DollarSign, TrendingUp, Award } from 'lucide-react';

export function Stats() {
  const stats = [
    {
      icon: Users,
      value: '50,000+',
      label: 'Active Traders',
    },
    {
      icon: DollarSign,
      value: '$45M+',
      label: 'Paid to Traders',
    },
    {
      icon: TrendingUp,
      value: '200K+',
      label: 'Funded Accounts',
    },
    {
      icon: Award,
      value: '98%',
      label: 'Satisfaction Rate',
    },
  ];

  return (
    <section className="py-16 bg-black border-y border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
                <stat.icon className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
