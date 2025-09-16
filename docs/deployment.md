# Deployment Guide

This guide covers various deployment options for the WhatsApp Marketing Platform.

## Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (for K8s deployment)
- Domain name and SSL certificates
- WhatsApp Business API credentials
- Cloud provider account (AWS/GCP/Azure)

## Environment Setup

### 1. Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb://mongo:27017/whatsapp-marketing
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here

# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id

# AI/NLP Configuration
OPENAI_API_KEY=your-openai-api-key
GOOGLE_DIALOGFLOW_PROJECT_ID=your-dialogflow-project-id
GOOGLE_DIALOGFLOW_PRIVATE_KEY=your-dialogflow-private-key
GOOGLE_DIALOGFLOW_CLIENT_EMAIL=your-dialogflow-client-email

# Payment Gateway Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
PAYTM_MERCHANT_ID=your-paytm-merchant-id
PAYTM_MERCHANT_KEY=your-paytm-merchant-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=whatsapp-marketing-platform

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://yourdomain.com

# Monitoring & Logging
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Docker Deployment

### 1. Build and Run with Docker Compose

```bash
# Clone the repository
git clone <repository-url>
cd whatsapp-marketing-platform

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Build and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

### 2. Custom Docker Build

```bash
# Build the image
docker build -t whatsapp-marketing-platform:latest .

# Run the container
docker run -d \
  --name whatsapp-marketing-app \
  -p 3000:3000 \
  --env-file .env \
  whatsapp-marketing-platform:latest
```

### 3. Docker Compose with External Services

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/whatsapp-marketing
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped

  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password123
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass redis123
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
```

## Kubernetes Deployment

### 1. Prerequisites

- Kubernetes cluster (v1.20+)
- kubectl configured
- Helm (optional)

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace whatsapp-marketing

# Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Check deployment status
kubectl get pods -n whatsapp-marketing
kubectl get services -n whatsapp-marketing
kubectl get ingress -n whatsapp-marketing
```

### 3. Scale the Application

```bash
# Scale deployment
kubectl scale deployment whatsapp-marketing-app --replicas=5 -n whatsapp-marketing

# Check HPA status
kubectl get hpa -n whatsapp-marketing
```

### 4. Update Deployment

```bash
# Update image
kubectl set image deployment/whatsapp-marketing-app \
  whatsapp-marketing-app=whatsapp-marketing-platform:v2.0 \
  -n whatsapp-marketing

# Check rollout status
kubectl rollout status deployment/whatsapp-marketing-app -n whatsapp-marketing
```

## Cloud Deployment

### AWS Deployment

#### 1. Using AWS EKS

```bash
# Create EKS cluster
eksctl create cluster \
  --name whatsapp-marketing \
  --region us-west-2 \
  --nodegroup-name workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 5

# Deploy application
kubectl apply -f k8s/

# Create load balancer
kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: whatsapp-marketing-lb
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: nlb
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: whatsapp-marketing-app
EOF
```

#### 2. Using AWS ECS

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name whatsapp-marketing

# Create task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create service
aws ecs create-service \
  --cluster whatsapp-marketing \
  --service-name whatsapp-marketing-service \
  --task-definition whatsapp-marketing:1 \
  --desired-count 3
```

### Google Cloud Deployment

#### 1. Using GKE

```bash
# Create GKE cluster
gcloud container clusters create whatsapp-marketing \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type e2-medium

# Get cluster credentials
gcloud container clusters get-credentials whatsapp-marketing \
  --zone us-central1-a

# Deploy application
kubectl apply -f k8s/
```

#### 2. Using Cloud Run

```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT_ID/whatsapp-marketing

# Deploy to Cloud Run
gcloud run deploy whatsapp-marketing \
  --image gcr.io/PROJECT_ID/whatsapp-marketing \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Deployment

#### 1. Using AKS

```bash
# Create resource group
az group create --name whatsapp-marketing --location eastus

# Create AKS cluster
az aks create \
  --resource-group whatsapp-marketing \
  --name whatsapp-marketing \
  --node-count 3 \
  --node-vm-size Standard_B2s \
  --enable-addons monitoring

# Get cluster credentials
az aks get-credentials \
  --resource-group whatsapp-marketing \
  --name whatsapp-marketing

# Deploy application
kubectl apply -f k8s/
```

## SSL/TLS Configuration

### 1. Using Let's Encrypt with cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### 2. Update Ingress with SSL

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: whatsapp-marketing-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    secretName: whatsapp-marketing-tls
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: whatsapp-marketing-service
            port:
              number: 80
```

## Database Setup

### 1. MongoDB Setup

#### Using MongoDB Atlas (Recommended)

```bash
# Create MongoDB Atlas cluster
# Configure connection string in environment variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp-marketing
```

#### Using Self-hosted MongoDB

```bash
# Deploy MongoDB with StatefulSet
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongo
spec:
  serviceName: mongo
  replicas: 1
  selector:
    matchLabels:
      app: mongo
  template:
    metadata:
      labels:
        app: mongo
    spec:
      containers:
      - name: mongo
        image: mongo:7.0
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: admin
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: password
        volumeMounts:
        - name: mongo-storage
          mountPath: /data/db
  volumeClaimTemplates:
  - metadata:
      name: mongo-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
EOF
```

### 2. Redis Setup

```bash
# Deploy Redis
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7.2-alpine
        ports:
        - containerPort: 6379
        command: ["redis-server", "--appendonly", "yes", "--requirepass", "redis123"]
        volumeMounts:
        - name: redis-storage
          mountPath: /data
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc
EOF
```

## Monitoring and Logging

### 1. Prometheus and Grafana

```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack

# Install Grafana
helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana grafana/grafana
```

### 2. ELK Stack for Logging

```bash
# Install Elasticsearch
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch

# Install Kibana
helm install kibana elastic/kibana

# Install Logstash
helm install logstash elastic/logstash
```

### 3. Application Monitoring

```yaml
# Add monitoring annotations to deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whatsapp-marketing-app
spec:
  template:
    metadata:
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: whatsapp-marketing-app
        image: whatsapp-marketing-platform:latest
        ports:
        - containerPort: 3000
        env:
        - name: ENABLE_METRICS
          value: "true"
```

## Backup and Recovery

### 1. Database Backup

```bash
# MongoDB backup
kubectl exec -it mongo-0 -- mongodump --uri="mongodb://admin:password@localhost:27017/whatsapp-marketing" --out=/backup

# Redis backup
kubectl exec -it redis-xxx -- redis-cli --rdb /backup/dump.rdb
```

### 2. Automated Backup

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: mongo:7.0
            command:
            - /bin/bash
            - -c
            - |
              mongodump --uri="$MONGODB_URI" --out=/backup
              tar -czf /backup/backup-$(date +%Y%m%d).tar.gz /backup/whatsapp-marketing
            env:
            - name: MONGODB_URI
              valueFrom:
                secretKeyRef:
                  name: mongo-secret
                  key: uri
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

## Security Configuration

### 1. Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: whatsapp-marketing-netpol
spec:
  podSelector:
    matchLabels:
      app: whatsapp-marketing-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: mongo
    ports:
    - protocol: TCP
      port: 27017
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

### 2. Pod Security Policy

```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: whatsapp-marketing-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

## Troubleshooting

### 1. Common Issues

#### Application Won't Start
```bash
# Check logs
kubectl logs -f deployment/whatsapp-marketing-app -n whatsapp-marketing

# Check pod status
kubectl describe pod <pod-name> -n whatsapp-marketing
```

#### Database Connection Issues
```bash
# Test MongoDB connection
kubectl exec -it mongo-0 -- mongo --eval "db.adminCommand('ismaster')"

# Test Redis connection
kubectl exec -it redis-xxx -- redis-cli ping
```

#### High Memory Usage
```bash
# Check resource usage
kubectl top pods -n whatsapp-marketing

# Scale up if needed
kubectl scale deployment whatsapp-marketing-app --replicas=5 -n whatsapp-marketing
```

### 2. Performance Optimization

#### Database Optimization
```javascript
// MongoDB indexes
db.contacts.createIndex({ "organizationId": 1, "phoneNumber": 1 })
db.messages.createIndex({ "organizationId": 1, "timestamp": -1 })
db.campaigns.createIndex({ "organizationId": 1, "status": 1 })
```

#### Redis Optimization
```bash
# Redis configuration
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Maintenance

### 1. Regular Updates

```bash
# Update application
kubectl set image deployment/whatsapp-marketing-app \
  whatsapp-marketing-app=whatsapp-marketing-platform:v2.1 \
  -n whatsapp-marketing

# Update dependencies
npm audit fix
npm update
```

### 2. Health Checks

```bash
# Application health
curl https://api.yourdomain.com/health

# Database health
kubectl exec -it mongo-0 -- mongo --eval "db.adminCommand('ping')"

# Redis health
kubectl exec -it redis-xxx -- redis-cli ping
```

### 3. Log Rotation

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: logrotate-config
data:
  logrotate.conf: |
    /app/logs/*.log {
        daily
        rotate 7
        compress
        delaycompress
        missingok
        notifempty
        create 644 root root
    }
```
