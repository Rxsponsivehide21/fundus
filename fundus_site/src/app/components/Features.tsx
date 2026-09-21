import { Shield, Clock, CreditCard, BarChart3, Headphones, Globe } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Shield,
      title: 'Secure & Regulated',
      description: 'Your funds are protected with industry-leading security measures',
    },
    {
      icon: Clock,
      title: 'No Time Limits',
      description: 'Trade at your own pace without pressure or artificial deadlines',
    },
    {
      icon: CreditCard,
      title: 'Fast Payouts',
      description: 'Receive your profits within 24 hours of request approval',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track your performance with detailed statistics and insights',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Get help whenever you need it from our dedicated support team',
    },
    {
      icon: Globe,
      title: 'Multi-Platform',
      description: 'Trade on MT4, MT5, cTrader, and more platforms',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose fundusec</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We provide everything you need to succeed as a professional trader
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-xl bg-gray-900 hover:bg-gray-800 transition border border-gray-800">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
