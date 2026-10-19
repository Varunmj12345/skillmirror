module.exports = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'https://skillmirror-api-judc.onrender.com',
  },
  images: {
    domains: ['example.com'], // Add your image domains here
  },
  async redirects() {
    return [
      {
        source: '/evaluator/dashboard',
        destination: '/problems',
        permanent: false,
      },
      {
        source: '/owner/dashboard',
        destination: '/problems',
        permanent: false,
      },
      {
        source: '/problems/submit',
        destination: '/problems',
        permanent: false,
      },
    ];
  },
};