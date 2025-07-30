module.exports = {
  apps: [
    {
      name: 'cms-backend',
      script: 'dist/server.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 8000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8000
      },
      // Logging
      error_file: './logs/cms-backend-error.log',
      out_file: './logs/cms-backend-out.log',
      log_file: './logs/cms-backend.log',
      time: true,
      
      // Memory and CPU limits
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // Auto-restart configuration
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Environment-specific settings
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Advanced PM2 features
      merge_logs: true,
      combine_logs: true,
      
      // Graceful shutdown
      kill_retry_time: 100
    },
    {
      name: 'portfolio-server',
      script: 'server.js',
      cwd: '../portfolio2',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      // Logging
      error_file: './logs/portfolio-error.log',
      out_file: './logs/portfolio-out.log',
      log_file: './logs/portfolio.log',
      time: true,
      
      // Memory limits (portfolio server is lighter)
      max_memory_restart: '512M',
      
      // Auto-restart configuration
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Environment-specific settings
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Advanced PM2 features
      merge_logs: true,
      combine_logs: true
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/your-repo.git',
      path: '/var/www/cms',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    },
    staging: {
      user: 'deploy',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/your-repo.git',
      path: '/var/www/cms-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging'
      }
    }
  },

  // PM2+ monitoring (optional)
  pmx: {
    enabled: true,
    network: true,
    ports: true,
    transactions: true,
    ignoreRoutes: [
      /\/api\/health/,
      /\/uploads/
    ]
  }
};