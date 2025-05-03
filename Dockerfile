# Étape 1 : construire l'application Angular
FROM node:20 as build
WORKDIR /app
COPY . .
RUN npm install && npm run build --prod

# Étape 2 : servir le frontend avec Nginx
FROM nginx:alpine
# Copier les fichiers buildés de l'application Angular
COPY --from=build /app/dist/dossiers-recouvrement-frontend /usr/share/nginx/html
# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80 (par défaut pour Nginx)
EXPOSE 80

# Commande par défaut pour démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
