import type { NextConfig } from "next";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "dm-propostas";
const isProjectPage = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProjectPage ? `/${repository}` : "",
  assetPrefix: isProjectPage ? `/${repository}/` : "",
};

export default nextConfig;
