const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const db = require("./connect");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  host:'smtp.gmail.com',
  port:465,
  secure:true,
  auth: {
    user: "carinenidhogg@gmail.com",
    pass: "vhiw rrpl kqca oenp",
  },
});

app.post("/api/contact", (req, res) => {
  const { name, email, phone, message, services } = req.body;

  // Vérifiez les données et insérez-les dans la base de données
  if (!name || !email || !phone || !message) {
    return res.status(400).send("Tous les champs sont obligatoires.");
  }

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isEmailValid(email)) {
    return res.status(400).send("Adresse e-mail invalide.");
  }

  const query = "INSERT INTO users (name, email, phone, message) VALUES (?, ?, ?, ?)";
  db.query(query, [name, email, phone, message, services], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'insertion dans la base de données :", err);
      return res.status(500).send("Erreur lors de l'insertion des données.");
    }

    // Préparer les options pour les e-mails
    const userMailOptions = {
      from: "carinenidhogg@gmail.com",
      to: email,
      subject: "Merci de nous avoir contactés",
      text: `Bonjour ${name},\n\nMerci de nous avoir contactés ! Nous avons bien reçu votre message :\n"${message}"\n\nNous vous répondrons sous peu à fin de notifier un rendez-vous pour discuter de ce services "${services}".\n\nCordialement,\nGlobal Plus Vision`,
    };

    const consultantMailOptions = {
      from: "carinenidhogg@gmail.com",
      to: "consultantbergsonhugn@gmail.com",
      subject: "Nouveau message de contact",
      text: `Un nouveau message a été envoyé depuis le formulaire de contact :\n\nNom : ${name}\nEmail : ${email}\nTéléphone : ${phone}\nMessage : ${message}. Ces informations seront stockés avec precautions dans votre base de données`,
    };

    // Envoyer les e-mails
    transporter.sendMail(userMailOptions, (err) => {
      if (err) {
        console.error("Erreur lors de l'envoi de l'e-mail à l'utilisateur :", err);
        return res.status(500).send("Erreur lors de l'envoi de l'e-mail à l'utilisateur.");
      }

      transporter.sendMail(consultantMailOptions, (err) => {
        if (err) {
          console.error("Erreur lors de l'envoi de l'e-mail au consultant :", err);
          return res.status(500).send("Erreur lors de l'envoi de l'e-mail au consultant.");
        }

        res.status(200).send("Données enregistrées et e-mails envoyés.");
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
