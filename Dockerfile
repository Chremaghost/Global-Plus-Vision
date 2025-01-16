# Utiliser une image de base Node.js
FROM node:16

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers nécessaires dans le conteneur
COPY package.json package-lock.json /usr/src/app/

# Nettoyer le cache npm et installer les dépendances
RUN npm cache clean --force && npm install mysql2 && npm install express body-parser nodemailer node && npm install cors

# Copier le reste des fichiers dans le conteneur
COPY . /usr/src/app/

# Exposer le port (remplacez 3000 par votre port si nécessaire)
EXPOSE 3000

# Commande pour démarrer le serveur
CMD ["node", "sever.js"]
