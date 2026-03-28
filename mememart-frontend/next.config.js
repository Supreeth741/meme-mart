/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only enable static export for production builds (next build).
  // Dev server must NOT use output:export — it blocks dynamic routes whose
  // params aren't in generateStaticParams(). Express's SPA catch-all
  // (GET * → index.html) handles unknown paths at runtime.
  ...(process.env.NODE_ENV === "production"
    ? { output: "export", trailingSlash: true }
    : {}),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mememartsource.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  },
};

module.exports = nextConfig;
