#!/bin/bash
# Tracky VPS Automated Deployment Script
# Autor: Antigravity

set -e

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
YELLOW='\033[1;33m'

echo -e "${YELLOW}🚀 Iniciando despliegue automatizado de Tracky en el VPS...${NC}"

# 1. Verificar Docker
if ! [ -x "$(command -v docker)" ]; then
  echo -e "${YELLOW}🐳 Docker no está instalado. Instalando Docker...${NC}"
  sudo apt-get update
  sudo apt-get install -y docker.io
  sudo systemctl start docker
  sudo systemctl enable docker
fi

# 2. Verificar Docker Compose
if ! [ -x "$(command -v docker-compose)" ]; then
  echo -e "${YELLOW}🐳 Docker Compose no está instalado. Instalando...${NC}"
  sudo apt-get install -y docker-compose
fi

# 3. Configurar Variables de Entorno del Backend
ENV_FILE="backend/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}📝 Archivo backend/.env no encontrado. Creando configuración por defecto...${NC}"
  
  # Generar una clave JWT aleatoria y segura
  JWT_SECRET=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32 ; echo '')
  
  cat <<EOF > "$ENV_FILE"
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://mongodb:27017/tracky
JWT_SECRET=$JWT_SECRET
API_URL=http://localhost:5000
EOF
  echo -e "${GREEN}✅ Archivo backend/.env creado con JWT_SECRET aleatorio.${NC}"
else
  echo -e "${GREEN}✅ Se detectó un archivo backend/.env existente.${NC}"
fi

# 4. Detener contenedores previos si existen
echo -e "${YELLOW}🛑 Deteniendo contenedores antiguos de Tracky...${NC}"
docker-compose down || true

# 5. Compilar y levantar la aplicación
echo -e "${YELLOW}⚙️ Construyendo y levantando contenedores con Docker Compose...${NC}"
docker-compose up --build -d

echo -e "\n${GREEN}🎉 ¡Despliegue completado con éxito!${NC}"
echo -e "─────────────────────────────────────────"
echo -e "🐳 Servicios Activos:"
echo -e "  - Frontend Web (Puerto 80):   ${GREEN}http://localhost${NC} (ó la IP de tu VPS)"
echo -e "  - Backend API  (Puerto 5000): ${GREEN}http://localhost:5000/api${NC}"
echo -e "  - Base de Datos (MongoDB):    Puerto 27017 (interno)"
echo -e "─────────────────────────────────────────\n"
