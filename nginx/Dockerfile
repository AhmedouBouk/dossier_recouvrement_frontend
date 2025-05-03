FROM nginx:alpine

# Copie ton build Angular
COPY dist/dossiers-recouvrement-frontend/ /usr/share/nginx/html

# Copie ta configuration nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
