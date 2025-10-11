# Production Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PM2 installed globally: `npm install -g pm2`
- Domain configured: `quizonline.website`
- Port 9015 available
- Database setup and accessible

## Step 1: Environment Configuration

Create a `.env` file in the project root with production values:

```bash
# -----------------------------------------------------------------------------
# App
# -----------------------------------------------------------------------------
BASEPATH=
NEXT_PUBLIC_APP_URL=https://quizonline.website
NEXT_PUBLIC_DOCS_URL=https://demos.pixinvent.com/vuexy-nextjs-admin-template/documentation

# -----------------------------------------------------------------------------
# Authentication (NextAuth.js)
# -----------------------------------------------------------------------------
NEXTAUTH_BASEPATH=/api/auth
NEXTAUTH_URL=https://quizonline.website/api/auth
NEXTAUTH_SECRET=<your-secure-random-secret-here>

# Google OAuth 2.0 (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# -----------------------------------------------------------------------------
# Database
# -----------------------------------------------------------------------------
DATABASE_URL=<your-production-database-url>

# -----------------------------------------------------------------------------
# API
# -----------------------------------------------------------------------------
API_URL=https://quizonline.website/api
NEXT_PUBLIC_API_URL=https://quizonline.website/api
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 2: Install Dependencies

```bash
npm install --production=false
```

## Step 3: Database Migration

Run Prisma migrations:

```bash
npm run migrate
```

Or manually:

```bash
npx prisma migrate deploy
npx prisma generate
```

## Step 4: Build the Application

```bash
npm run build
```

This will create an optimized production build in the `.next` directory.

## Step 5: Create Logs Directory

```bash
mkdir -p logs
```

## Step 6: Start with PM2

Start the application using PM2:

```bash
pm2 start ecosystem.config.js
```

## Step 7: Configure PM2 Startup

To ensure the app restarts on server reboot:

```bash
pm2 startup
pm2 save
```

## PM2 Management Commands

### View Application Status
```bash
pm2 status
```

### View Logs
```bash
# All logs
pm2 logs quizz-ui

# Only error logs
pm2 logs quizz-ui --err

# Only output logs
pm2 logs quizz-ui --out

# Real-time logs
pm2 logs quizz-ui --lines 100
```

### Restart Application
```bash
pm2 restart quizz-ui
```

### Stop Application
```bash
pm2 stop quizz-ui
```

### Reload Application (Zero Downtime)
```bash
pm2 reload quizz-ui
```

### Delete Application from PM2
```bash
pm2 delete quizz-ui
```

### Monitor Resources
```bash
pm2 monit
```

## Step 8: Configure Reverse Proxy (Nginx)

Create an Nginx configuration file: `/etc/nginx/sites-available/quizonline.website`

```nginx
server {
    listen 80;
    server_name quizonline.website www.quizonline.website;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name quizonline.website www.quizonline.website;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/quizonline.website/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/quizonline.website/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:9015;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Next.js static files
    location /_next/static {
        proxy_pass http://localhost:9015;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Public files
    location /public {
        proxy_pass http://localhost:9015;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000";
    }

    # Client-side max body size
    client_max_body_size 50M;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/quizonline.website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 9: SSL Certificate (Let's Encrypt)

Install Certbot and obtain SSL certificate:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d quizonline.website -d www.quizonline.website
```

Auto-renewal is configured by default. Test it:

```bash
sudo certbot renew --dry-run
```

## Step 10: Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

## Deployment Checklist

- [ ] `.env` file created with production values
- [ ] `NEXTAUTH_SECRET` generated and set
- [ ] Database URL configured
- [ ] Google OAuth credentials configured (if using)
- [ ] Dependencies installed
- [ ] Database migrations run
- [ ] Application built successfully
- [ ] Logs directory created
- [ ] PM2 started and saved
- [ ] Nginx configured
- [ ] SSL certificate obtained
- [ ] Firewall configured
- [ ] DNS records pointing to server

## Updating the Application

When deploying updates:

```bash
# 1. Pull latest code
git pull origin main

# 2. Install new dependencies (if any)
npm install

# 3. Run migrations (if any)
npm run migrate

# 4. Rebuild the application
npm run build

# 5. Reload PM2 (zero downtime)
pm2 reload quizz-ui
```

## Troubleshooting

### Check Application Logs
```bash
pm2 logs quizz-ui --lines 200
```

### Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Restart Everything
```bash
pm2 restart quizz-ui
sudo systemctl restart nginx
```

### Check Port Usage
```bash
netstat -tulpn | grep 9015
```

### Database Connection Issues
```bash
# Test database connection
npx prisma db pull
```

## Performance Optimization

### Enable PM2 Cluster Mode

Edit `ecosystem.config.js` and change:

```javascript
instances: 'max', // Use all available CPU cores
```

Then reload:

```bash
pm2 reload quizz-ui
```

### Monitor Performance
```bash
pm2 monit
```

## Backup Strategy

### Database Backup
```bash
# Example for PostgreSQL
pg_dump -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Application Backup
```bash
tar -czf quizz-ui-backup-$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='logs' \
  /path/to/quizz-ui
```

## Support

For issues or questions, check:
- Application logs: `pm2 logs quizz-ui`
- Nginx logs: `/var/log/nginx/`
- System logs: `journalctl -u nginx`
