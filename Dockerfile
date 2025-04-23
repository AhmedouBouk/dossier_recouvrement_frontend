# Étape 1 : construire l'application Angular
FROM node:20 as build
WORKDIR /app
COPY . .
RUN npm install && npm run build --prod

# Étape 2 : servir le frontend avec Nginx
FROM nginx:alpine
COPY --from=build /app/dist/dossiers-recouvrement-frontend /usr/share/nginx/html

