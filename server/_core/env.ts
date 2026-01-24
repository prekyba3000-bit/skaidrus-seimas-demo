/**
 * Get Railway public domain URL
 * Railway provides RAILWAY_PUBLIC_DOMAIN environment variable in production
 */
function getRailwayPublicUrl(): string {
  const publicDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (publicDomain) {
    // Railway provides the domain without protocol
    return `https://${publicDomain}`;
  }
  // Fallback for local development
  return process.env.OAUTH_SERVER_URL ?? "";
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: getRailwayPublicUrl(),
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
