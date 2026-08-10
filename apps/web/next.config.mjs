/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone só quando pedido explicitamente (Docker/Linux). No Windows o
  // copytrace quebra com EPERM nos symlinks do pnpm — build local usa o modo
  // normal, e o Dockerfile web define NEXT_OUTPUT=standalone.
  ...(process.env.NEXT_OUTPUT === "standalone" ? { output: "standalone" } : {}),
};

export default nextConfig;
