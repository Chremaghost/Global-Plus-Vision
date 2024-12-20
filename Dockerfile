# Utilisez une image Node.js officielle
FROM node:18

# Créez et positionnez-vous dans le répertoire de l'application
WORKDIR ./

# Copiez les fichiers package.json et package-lock.json
COPY package*.json ./

# Installez les dépendances
RUN npm install mysql2
RUN npm install express body-parser nodemailer node
RUN npm install cors

# Copiez le reste du code dans le conteneur
COPY . .

# Exposez le port sur lequel votre application tourne
EXPOSE 3000

# Définissez la commande par défaut pour démarrer l'application
CMD ["node", "sever.js"]
