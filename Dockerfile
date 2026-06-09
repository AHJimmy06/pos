# === ETAPA 1: Compilación del Frontend ===
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# === ETAPA 2: Servidor Web de Producción ===
FROM nginx:alpine
# Copiamos los archivos compilados de la etapa anterior a la carpeta que lee Nginx
# NOTA: Cambia 'dist' por 'build' si tu framework genera esa carpeta
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponemos el puerto estándar para HTTP
EXPOSE 80

# Arrancamos Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]