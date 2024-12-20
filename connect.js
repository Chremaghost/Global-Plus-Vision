const mysql = require("mysql2");

const dbConfig = {
  host: "localhost", // Utilisez localhost au lieu de l'adresse IP
  user: "my_user",
  password: "my_password",
  database: "my_database",
  port: 3307, // Port mappé par Docker
};

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données :", err.message);
    process.exit(1);
  }
  console.log("Connecté à la base de données MySQL avec succès !");
});

module.exports = db;