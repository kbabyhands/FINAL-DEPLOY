# Deployment Guide

This guide covers deployment options for the Restaurant Menu Management System (Proprietary Software).

## ⚠️ Important Notice

This is proprietary software. Deployment is restricted to authorized environments only. All deployment procedures must follow company security and compliance policies.

## 🚀 Authorized Deployment Options

### 1. Docker Deployment (Recommended)

#### Prerequisites
- Docker and Docker Compose
- Domain name (optional)
- SSL certificate (for production)

#### Steps
1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd restaurant-menu-system
   ```

2. **Create production environment files**
   
   Frontend `.env`:
   ```bash
   VITE_REACT_APP_BACKEND_URL=https://your-api-domain.com
   ```
   
   Backend `.env`:
   ```bash
   MONGO_URL=mongodb://mongo:27017
   DB_NAME=restaurant_menu_production
   ```

3. **Create Docker Compose file**
   ```yaml
   version: '3.8'
   services:
     frontend:
       build: ./frontend
       ports:
         - "80:80"
       depends_on:
         - backend
     
     backend:
       build: ./backend
       ports:
         - "8001:8001"
       depends_on:
         - mongo
       environment:
         - MONGO_URL=mongodb://mongo:27017
         - DB_NAME=restaurant_menu_production
     
     mongo:
       image: mongo:latest
       volumes:
         - mongo_data:/data/db
   
   volumes:
     mongo_data:
   ```

4. **Deploy**
   ```bash
   docker-compose up -d
   ```

### 2. Cloud Platform Deployment

#### Vercel (Frontend)
1. Install Vercel CLI: `npm i -g vercel`
2. Build the frontend: `cd frontend && yarn build`
3. Deploy: `vercel deploy`
4. Set environment variables in Vercel dashboard

#### Railway (Full Stack)
1. Connect GitHub repository to Railway
2. Set up environment variables
3. Deploy with automatic builds

#### DigitalOcean App Platform
1. Create new app from GitHub repository
2. Configure build and run commands
3. Set environment variables
4. Deploy

### 3. Traditional VPS Deployment

#### Prerequisites
- Ubuntu/Debian VPS
- Domain name with DNS pointing to VPS
- SSL certificate (Let's Encrypt recommended)

#### Steps
1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Python
   sudo apt install python3 python3-pip python3-venv -y
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   
   # Install Nginx
   sudo apt install nginx -y
   ```

2. **Application Setup**
   ```bash
   # Clone repository
   git clone <your-repo-url> /var/www/restaurant-menu
   cd /var/www/restaurant-menu
   
   # Setup frontend
   cd frontend
   npm install
   npm run build
   
   # Setup backend
   cd ../backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Service Configuration**
   
   Create systemd service for backend:
   ```bash
   sudo nano /etc/systemd/system/restaurant-menu-backend.service
   ```
   
   ```ini
   [Unit]
   Description=Restaurant Menu Backend
   After=network.target
   
   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/restaurant-menu/backend
   Environment=PATH=/var/www/restaurant-menu/backend/venv/bin
   ExecStart=/var/www/restaurant-menu/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```

4. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /var/www/restaurant-menu/frontend/build;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:8001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

5. **SSL Setup with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

## 🔧 Environment Variables

### Frontend Variables
- `VITE_REACT_APP_BACKEND_URL` - Backend API URL

### Backend Variables
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `STRIPE_API_KEY` - Stripe API key (if using payments)

## 📊 Production Considerations

### Performance
- Enable gzip compression
- Set up CDN for static assets
- Implement caching strategies
- Monitor memory and CPU usage

### Security
- Use HTTPS everywhere
- Set up proper CORS policies
- Implement rate limiting
- Regular security updates

### Monitoring
- Application logs
- Database performance
- User analytics
- Error tracking (Sentry, etc.)

### Backup
- Regular database backups
- Code repository backups
- Environment configuration backups

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install and build frontend
      run: |
        cd frontend
        npm install
        npm run build
    
    - name: Deploy to server
      uses: easingthemes/ssh-deploy@main
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SERVER_SSH_KEY }}
        ARGS: "-rltgoDzvO --delete"
        SOURCE: "frontend/build/"
        REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
        REMOTE_USER: ${{ secrets.REMOTE_USER }}
        TARGET: "/var/www/restaurant-menu/frontend/build/"
```

## 🆘 Troubleshooting

### Common Issues

**Frontend not loading:**
- Check Nginx configuration
- Verify build files exist
- Check browser console for errors

**API not responding:**
- Check backend service status
- Verify MongoDB connection
- Check firewall settings

**Database connection issues:**
- Verify MongoDB is running
- Check connection string
- Ensure proper authentication

### Logging
- Frontend: Browser console and network tab
- Backend: Application logs and MongoDB logs
- Server: Nginx logs and system logs

### Health Checks
Set up health check endpoints:
- Frontend: Check if static files load
- Backend: `GET /api/health`
- Database: Connection test

## 📈 Scaling

### Horizontal Scaling
- Load balancer setup
- Multiple backend instances
- Database clustering
- CDN implementation

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching
- Code optimization

## 🔐 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Regular security updates
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented

## 📞 Support

For deployment issues:
- Check the troubleshooting section
- Review application logs
- Create an issue in the repository
- Consult cloud provider documentation