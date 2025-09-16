#!/bin/bash

# WhatsApp Marketing Platform Installation Script
# This script sets up the complete WhatsApp Marketing Platform

set -e

echo "🚀 WhatsApp Marketing Platform Installation Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check system requirements
print_header "Checking system requirements..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v) ✓"

# Check npm version
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 8 ]; then
    print_error "npm version 8+ is required. Current version: $(npm -v)"
    exit 1
fi

print_status "npm version: $(npm -v) ✓"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. Docker is required for containerized deployment."
    read -p "Do you want to continue without Docker? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_status "Docker version: $(docker --version) ✓"
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose is not installed. Docker Compose is required for multi-container deployment."
    read -p "Do you want to continue without Docker Compose? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_status "Docker Compose version: $(docker-compose --version) ✓"
fi

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    print_warning "MongoDB is not installed locally. You can use MongoDB Atlas or install MongoDB locally."
    read -p "Do you want to continue without local MongoDB? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_status "MongoDB version: $(mongod --version | head -n1) ✓"
fi

# Check Redis
if ! command -v redis-server &> /dev/null; then
    print_warning "Redis is not installed locally. You can use Redis Cloud or install Redis locally."
    read -p "Do you want to continue without local Redis? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_status "Redis version: $(redis-server --version | head -n1) ✓"
fi

print_header "Installing dependencies..."

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

print_header "Setting up environment configuration..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp env.example .env
    print_warning "Please edit .env file with your configuration before running the application."
else
    print_status ".env file already exists."
fi

print_header "Setting up directories..."

# Create necessary directories
mkdir -p logs
mkdir -p uploads
mkdir -p frontend/public/uploads

# Set proper permissions
chmod 755 logs
chmod 755 uploads
chmod 755 frontend/public/uploads

print_header "Building the application..."

# Build backend
print_status "Building backend..."
npm run build

# Build frontend
print_status "Building frontend..."
cd frontend
npm run build
cd ..

print_header "Setting up database..."

# Check if MongoDB is running locally
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        print_status "MongoDB is running locally."
    else
        print_warning "MongoDB is not running. Please start MongoDB before running the application."
    fi
fi

# Check if Redis is running locally
if command -v redis-server &> /dev/null; then
    if pgrep -x "redis-server" > /dev/null; then
        print_status "Redis is running locally."
    else
        print_warning "Redis is not running. Please start Redis before running the application."
    fi
fi

print_header "Running tests..."

# Run tests
print_status "Running unit tests..."
npm run test:unit

print_status "Running integration tests..."
npm run test:integration

print_status "Generating coverage report..."
npm run test:coverage

print_header "Installation completed successfully! 🎉"

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Configure your environment variables in .env file:"
echo "   - WhatsApp Business API credentials"
echo "   - Database connection strings"
echo "   - JWT secrets"
echo "   - Payment gateway credentials"
echo ""
echo "2. Start the application:"
echo "   - Development: npm run dev"
echo "   - Production: npm start"
echo "   - Docker: docker-compose up -d"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3000/api"
echo "   - Health Check: http://localhost:3000/health"
echo ""
echo "4. For production deployment:"
echo "   - Follow the deployment guide in docs/deployment.md"
echo "   - Use Kubernetes manifests in k8s/ directory"
echo ""
echo "📚 Documentation:"
echo "================="
echo "- README.md - Overview and quick start"
echo "- docs/api.md - API documentation"
echo "- docs/deployment.md - Deployment guide"
echo ""
echo "🆘 Support:"
echo "==========="
echo "- GitHub Issues: https://github.com/your-org/whatsapp-marketing-platform/issues"
echo "- Documentation: https://docs.yourdomain.com"
echo ""
echo "Happy coding! 🚀"
