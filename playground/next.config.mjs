import createAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export'
};

const withBundleAnalyzer = createAnalyzer({ 
  enabled: process.env.ANALYZE === 'true', 
})

export default withBundleAnalyzer(nextConfig);
