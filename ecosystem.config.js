module.exports = {
  apps: [
    {
      name: 'afrowiki',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max', // Use maximum number of CPU cores
      exec_mode: 'cluster', // Run in cluster mode for load balancing
      autorestart: true, // Auto restart if app crashes
      watch: false, // Don't watch for file changes in production
      max_memory_restart: '1G', // Restart if memory usage exceeds 1GB
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Log configuration
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      // Performance metrics
      node_args: '--max-old-space-size=2048', // Increase Node.js memory limit
    },
  ],
};
