import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O client do Prisma é gerado num caminho customizado (src/generated/prisma),
  // fora de onde o Next.js rastreia dependências por padrão. Sem isso, o binário
  // do query engine (.so.node) não é incluído no bundle das funções serverless
  // na Vercel, causando PrismaClientInitializationError em runtime.
  outputFileTracingIncludes: {
    "/**/*": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
