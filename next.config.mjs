/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    experimental: {
      allowedDevOrigins: ['http://192.168.1.100:3000'], // replace with your actual dev IP/port
    },
  };
  
  export default nextConfig;
  