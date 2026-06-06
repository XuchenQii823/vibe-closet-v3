/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // 原型用的是 Google 占位图（lh3.googleusercontent.com）；
    // MVP 用普通 <img> 标签直出，不走 next/image 优化，避免远程域名白名单与构建报错。
    unoptimized: true,
  },
};

export default nextConfig;
