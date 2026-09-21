import { Helmet } from 'react-helmet-async';

export function SEO() {
  const title = 'FundusEC | Funded Trader Program — Up to $200K Funding';
  const description =
    'FundusEC is a leading prop trading firm offering funded trader accounts up to $200,000. Pass our evaluation, keep up to 90% profit split. No time limits, weekend holding allowed. Get funded today.';
  const keywords =
    'funded trader, prop firm, proprietary trading, funded account, forex funded, trading challenge, FTMO alternative, profit split, funded trading account, prop trading firm, $50k funded, $100k funded, fundusEC';
  const url = 'https://fundusec.com';
  const image = `${url}/og-image.png`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${url}/#organization`,
        name: 'FundusEC',
        url,
        logo: {
          '@type': 'ImageObject',
          url: `${url}/logo.png`,
        },
        description,
        sameAs: [
          'https://twitter.com/fundusec',
          'https://instagram.com/fundusec',
          'https://linkedin.com/company/fundusec',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${url}/#website`,
        url,
        name: 'FundusEC',
        publisher: { '@id': `${url}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${url}/#webpage`,
        url,
        name: title,
        description,
        isPartOf: { '@id': `${url}/#website` },
        about: { '@id': `${url}/#organization` },
      },
      {
        '@type': 'FinancialService',
        '@id': `${url}/#service`,
        name: 'FundusEC Funded Trader Program',
        url,
        description:
          'Proprietary trading firm providing funded accounts from $25,000 to $200,000 with up to 90% profit split for qualified traders.',
        provider: { '@id': `${url}/#organization` },
        offers: [
          {
            '@type': 'Offer',
            name: '$25,000 Funded Account',
            price: '275',
            priceCurrency: 'USD',
            description: '$25K funded trading account with 80% profit split',
          },
          {
            '@type': 'Offer',
            name: '$50,000 Funded Account',
            price: '425',
            priceCurrency: 'USD',
            description: '$50K funded trading account with 80% profit split',
          },
          {
            '@type': 'Offer',
            name: '$100,000 Funded Account',
            price: '575',
            priceCurrency: 'USD',
            description: '$100K funded trading account with 90% profit split',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How much funding can I get with FundusEC?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'FundusEC offers funded trading accounts ranging from $25,000 to $200,000. All you need to do is pass our two-phase evaluation to receive your funded account.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the profit split at FundusEC?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'FundusEC offers up to 90% profit split for funded traders. The $100K account offers 90% profit split, while smaller accounts start at 80%.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is there a time limit on the FundusEC evaluation?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. FundusEC has no time limits on the evaluation. You can trade at your own pace and hold positions over the weekend.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the maximum daily loss at FundusEC?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The maximum daily loss is 5% of the account balance across all evaluation phases and funded accounts.',
            },
          },
        ],
      },
    ],
  };

  return (
    <Helmet>
      {/* Primary */}
      <html lang="en" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <link rel="canonical" href={url} />
      <meta name="author" content="FundusEC" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="FundusEC" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@fundusec" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Mobile / PWA */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#dc2626" />
      <meta name="application-name" content="FundusEC" />

      {/* Structured data */}
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}
