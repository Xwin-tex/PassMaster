module.exports = {
  apps: [
    {
      name: 'passmaster-backend',
      script: './backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_file: './backend/.env',
      max_memory_restart: '500M',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
    },
  ],
};
