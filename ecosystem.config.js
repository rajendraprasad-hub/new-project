/**
 * Infosys Portal - PM2 Ecosystem Configuration
 * Use this to manage the Node.js process in production
 * 
 * Setup:
 *   1. npm install -g pm2
 *   2. pm2 start ecosystem.config.js
 *   3. pm2 startup
 *   4. pm2 save
 */

module.exports = {
  apps: [
    {
      name: 'infosys-portal',
      script: './backend/server.js',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 'max',
      exec_mode: 'cluster',
      
      // Logging
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Restart policies
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      
      // Timeout
      listen_timeout: 10000,
      kill_timeout: 5000,
      
      // Graceful shutdown
      graceful_timeout: 10000
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourname/webportal.git',
      path: '/home/deploy/webportal',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
