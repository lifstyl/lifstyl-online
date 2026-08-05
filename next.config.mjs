/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // The admin setup page applies pending migrations at runtime, so the SQL
    // files have to ship with that serverless function — they aren't imported
    // in code, so Next can't infer the dependency on its own.
    outputFileTracingIncludes: {
      "/admin/setup": ["./drizzle/**/*"],
    },
  },
  images: {
    remotePatterns: [
      // Vercel Blob public URLs
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Existing images pulled from the current Wix site during seeding
      { protocol: "https", hostname: "static.wixstatic.com" },
    ],
  },
};

export default nextConfig;
