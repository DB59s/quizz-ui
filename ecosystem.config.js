module.exports = {
  apps: [
    {
      name: 'quizz-ui',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 9015',
      cwd: './',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 9015,
        BASEPATH: '',
        NEXT_PUBLIC_APP_URL: 'https://quizonline.website',
        NEXT_PUBLIC_DOCS_URL: 'https://demos.pixinvent.com/vuexy-nextjs-admin-template/documentation',
        NEXTAUTH_BASEPATH: '/api/auth',
        NEXTAUTH_URL: 'https://quizonline.website/api/auth',
        API_URL: 'https://api.vuquangduy.io.vn/api',
        NEXT_PUBLIC_API_URL: 'https://api.vuquangduy.io.vn/api'
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000
    }
  ]
}
