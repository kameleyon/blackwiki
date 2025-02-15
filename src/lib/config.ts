/**
 * Configuration for environment-specific settings
 */
export const config = {
  /**
   * Get the base URL for the current environment
   * In production, this should be set via environment variable
   * In development, it defaults to localhost
   */
  getBaseUrl: () => {
    if (process.env.BASE_URL) {
      return process.env.BASE_URL;
    }
    if (process.env.NODE_ENV === 'production') {
      // In production, base URL must be set via environment variable
      throw new Error('BASE_URL environment variable is not set');
    }
    // Default to localhost in development
    return 'http://localhost:3000';
  }
};
