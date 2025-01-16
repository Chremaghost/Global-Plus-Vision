const mysql = require("mysql2");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "my_user",
  password: process.env.DB_PASSWORD || "my_password",
  database: process.env.DB_NAME || "my_database",
  port: process.env.DB_PORT || 3306,
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