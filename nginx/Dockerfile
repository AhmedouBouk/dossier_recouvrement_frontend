FROM nginx:alpine

# Copie les fichiers buildés depuis le service frontend
COPY --from=dossiers-recouvrement-backend-frontend:latest /usr/share/nginx/html /usr/share/nginx/html

# Copie ta configuration nginx
COPY default.conf /etc/nginx/conf.d/default.conf
