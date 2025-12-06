# Electric Mobility - Hướng dẫn Deploy

## 🚀 Deploy Options

### Option 1: Deploy trên Vercel (Recommended - Dễ nhất)

#### Prerequisites
- Có GitHub account
- Project đã push lên GitHub

#### Bước 1: Connect GitHub
1. Vào https://vercel.com
2. Click "New Project"
3. Import từ GitHub
4. Chọn repository `your-repo/electric-bike-shop`
5. Click "Import"

#### Bước 2: Configure
- Framework: Next.js
- Root Directory: ./
- Build Command: `npm run build`
- Output Directory: `.next`

#### Bước 3: Deploy
1. Click "Deploy"
2. Chờ build hoàn tất (3-5 phút)
3. Bạn sẽ nhận URL: `https://your-project.vercel.app`

#### Bước 4: Setup Environment Variables (nếu cần)
1. Project Settings → Environment Variables
2. Thêm các biến cần thiết

### Option 2: Deploy trên Netlify

#### Bước 1: Prepare
```bash
npm run build
```

#### Bước 2: Connect
1. Vào https://netlify.com
2. Click "Add new site"
3. Chọn "Import an existing project"
4. Connect GitHub
5. Chọn repository

#### Bước 3: Configure Build
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 18

#### Bước 4: Deploy
- Click "Deploy site"
- URL: `https://your-site-name.netlify.app`

### Option 3: Deploy trên Docker (Self-hosted)

#### Prerequisites
- Có Docker installed
- Server (VPS, AWS EC2, DigitalOcean, etc.)

#### Bước 1: Build Docker Image
```bash
docker build -t electric-bike:latest .
```

#### Bước 2: Push to Registry (optional)
```bash
# Nếu dùng Docker Hub
docker tag electric-bike:latest yourusername/electric-bike:latest
docker push yourusername/electric-bike:latest
```

#### Bước 3: Deploy Server
```bash
# SSH vào server
ssh user@your-server-ip

# Pull image
docker pull yourusername/electric-bike:latest

# Run container
docker run -d \
  --name electric-bike \
  -p 80:3000 \
  -e NODE_ENV=production \
  yourusername/electric-bike:latest
```

#### Bước 4: Setup Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 4: Deploy trên AWS

#### Bước 1: Create EC2 Instance
1. Vào AWS Console
2. EC2 → Instances
3. Launch new instance (Ubuntu 22.04)
4. Instance type: t3.micro (free tier)

#### Bước 2: Connect to Instance
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

#### Bước 3: Setup Server
```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Clone project
git clone https://github.com/yourusername/electric-bike-shop.git
cd electric-bike-shop

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "electric-bike" -- start
pm2 startup
pm2 save
```

#### Bước 4: Setup SSL (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
```

### Option 5: Deploy trên DigitalOcean App Platform

#### Bước 1: Connect GitHub
1. Vào https://cloud.digitalocean.com
2. Click "Create" → "Apps"
3. Connect GitHub account

#### Bước 2: Select Repository
- Chọn repository `electric-bike-shop`
- Branch: main

#### Bước 3: Auto-detect Settings
- Framework: Next.js (auto-detected)
- Click "Next"

#### Bước 4: Environment
- Thêm variables nếu cần
- Click "Next"

#### Bước 5: Review & Deploy
- Review settings
- Click "Create Resources"
- Chờ deploy (3-5 phút)

## 📊 Post-Deployment Checklist

- [ ] Website load đúng
- [ ] API endpoints hoạt động
- [ ] Modal/forms hoạt động
- [ ] Database connections (nếu có)
- [ ] SSL/HTTPS active
- [ ] Email notifications (nếu có)
- [ ] Monitoring setup
- [ ] Backup configured

## 🔐 Production Security

### Environment Variables
```bash
# .env.production
NODE_ENV=production
DATABASE_URL=mongodb://...
JWT_SECRET=your-secret-key
```

### CORS Configuration
```typescript
// next.config.js
const nextConfig = {
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
        ],
      },
    ]
  },
}
```

## 📈 Monitoring & Logging

### Vercel Analytics
- Built-in monitoring
- Check at https://vercel.com/analytics

### Application Logs
```bash
# Vercel logs
vercel logs electric-bike

# AWS CloudWatch
# Application logs automatically sent
```

## 💾 Database Setup (Optional)

### MongoDB Atlas (Free tier available)
1. Vào https://www.mongodb.com/cloud/atlas
2. Create Free Account
3. Create Cluster
4. Get connection string
5. Add to .env.production

### PostgreSQL (AWS RDS)
1. AWS Console → RDS
2. Create Database
3. Choose PostgreSQL
4. Get connection string

## 🚨 Troubleshooting

### Build fails
```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Port already in use
```bash
# Vercel: auto-assigns
# Docker: use different port
docker run -p 3001:3000 ...

# Local: kill process
lsof -i :3000
kill -9 <PID>
```

### Memory issues
```bash
# Increase Node memory
NODE_OPTIONS=--max_old_space_size=2048 npm run build
```

## 📞 Support

- Vercel Support: https://vercel.com/support
- Docker Docs: https://docs.docker.com
- AWS Support: https://console.aws.amazon.com/support

---

**Last Updated:** 4 tháng 12, 2025
