/**
 * Configuration for environment-specific settings
 */
export const config = {
  /**
   * Get the base URL for the current environment
   * In production, this should be set via environment variable
   * In development, it defaults to localhost
   */
  getBaseUrl: () => process.env.FRONTEND_URL || 'http://localhost:3000',
  getApiUrl: () => process.env.API_URL || 'http://localhost:3000/api',
  
  /**
   * Check if the current environment is production
   */
  isProduction: process.env.NODE_ENV === 'production'
};
