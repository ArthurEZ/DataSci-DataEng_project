# Docker Deployment Guide

## Prerequisites

- Docker Desktop installed
- Docker Compose v2+
- Model files (`bangkok_traffy_model.cbm` and `model_metadata.pkl`) in project root

## Quick Start

### 1. Build and Start Services

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 2. Access Services

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 3. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Services

### API Service
- **Port**: 8000
- **Health Check**: `/health` endpoint
- **Depends on**: Model files

### Frontend Service
- **Port**: 3000
- **Depends on**: API service
- **Auto-restart**: Yes

## Development

### Rebuild Single Service

```bash
# Rebuild API only
docker-compose up -d --build api

# Rebuild Frontend only
docker-compose up -d --build frontend
```

### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f frontend
```

### Execute Commands in Container

```bash
# API shell
docker-compose exec api bash

# Frontend shell
docker-compose exec frontend sh
```

## Troubleshooting

### API Won't Start
- Check model files exist in project root
- Verify Python dependencies in `api/requirements.txt`
- Check logs: `docker-compose logs api`

### Frontend Can't Connect to API
- Ensure API is healthy: `docker-compose ps`
- Check network connectivity
- Verify CORS settings in API

### Port Already in Use
```bash
# Change ports in docker-compose.yml
ports:
  - "8001:8000"  # API
  - "3001:3000"  # Frontend
```

## Production Deployment

### Environment Variables

Create `.env` file:
```env
API_PORT=8000
FRONTEND_PORT=3000
API_WORKERS=4
```

### Use in docker-compose.yml
```yaml
ports:
  - "${API_PORT}:8000"
```

### Security
- Don't commit `.env` file
- Use secrets for sensitive data
- Enable HTTPS with reverse proxy (nginx)

## Monitoring

```bash
# Resource usage
docker stats

# Service health
docker-compose ps
curl http://localhost:8000/health
```
