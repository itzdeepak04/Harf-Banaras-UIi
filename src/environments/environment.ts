// Tell TypeScript that the global 'process' variable exists
declare var process: any;

export const environment = {
  // react-scripts requires custom environment variables to start with REACT_APP_
  API_URL: process.env.REACT_APP_API_URL || 'https://harf-banaras-api-pink.vercel.app/'
};
