module.exports = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'https://skillmirror-api-judc.onrender.com',
  },
  images: {
    domains: ['example.com'], // Add your image domains here
  },
};