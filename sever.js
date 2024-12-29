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

app.post("/api/send-message", async (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).send("Nom et message sont obligatoires.");
  }

  try {
    const result = await db.promise().execute('SELECT email FROM users WHERE name = ?', [name]);
    console.log('Résultat de la requête :', result);

    const rows = result[0]; 
    if (rows.length === 0) {
      return res.status(404).send('Email non trouvé pour ce nom.');
    }

    const email = rows[0].email;
    console.log('Email trouvé :', email);

    // Fonction d'envoi d'email
    const sendEmail = async (recipientEmail, subject, text) => {
      const mailOptions = {
        from: 'carinenidhogg@gmail.com',  // L'email de l'expéditeur
        to: recipientEmail,              // L'email du destinataire
        subject: subject,                // Sujet de l'email
        text: text                       // Corps de l'email (texte)
      };
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé avec succès:', info.response);
        res.status(200).send('Message envoyé avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        res.status(500).send('Erreur lors de l\'envoi du message');
      }
    };

    // Appel de la fonction d'envoi d'email avec les informations nécessaires
    sendEmail(email, 'Votre sujet ici', message);

  } catch (error) {
    console.error('Erreur lors de la requête :', error);
    res.status(500).send('Erreur serveur.');
  }
});

app.get("/api/clients", (req, res) => {
  const query = "SELECT name, email, phone, message, created_at AS dateOrder, service_status FROM users"; // Remplacé dateOrder par created_at
  db.query(query, (err, results) => {
      if (err) {
          console.error("Erreur lors de la récupération des clients :", err);
          return res.status(500).send("Erreur lors de la récupération des données.");
      }
      res.status(200).json(results);
  });
});

app.put('/api/clients/:name/status', async (req, res) => {
  const clientName = req.params.name;
  const { status } = req.body;

  if (!status) {
      return res.status(400).send({ error: "Le statut est requis." });
  }

  try {
      // Exécution de la requête SQL
      const result = await db.execute(
          'UPDATE users SET service_status = ? WHERE name = ?',
          [status, clientName]
      );

      // Si `result` est un tableau, il pourrait avoir une structure différente.
      // Par exemple, si vous utilisez `mysql2`, le résultat peut être sous cette forme :
      // const [rows, fields] = await db.execute(...)

      // Vérifiez si `result` a des informations sur les lignes affectées.
      if (result.affectedRows === 0) {
          return res.status(404).send({ error: "Client introuvable ou aucun changement détecté." });
      }

      res.send({ message: "Statut mis à jour avec succès." });
  } catch (error) {
      console.error('Erreur lors de la mise à jour du statut :', error);
      res.status(500).send({ error: "Erreur serveur." });
  }
});

app.get("/api/comments", (req, res) => {
  const query = `
      SELECT comments.id, comments.content, users.name
      FROM comments
      JOIN users ON comments.user_id = users.id
      ORDER BY comments.created_at DESC
  `;
  db.query(query, (err, results) => {
      if (err) {
          console.error("Erreur lors de la récupération des commentaires :", err);
          return res.status(500).send("Erreur lors de la récupération des commentaires.");
      }
      res.status(200).json(results);
  });
});

app.post("/api/comments", (req, res) => {
  const { content, username } = req.body; // Récupérer le nom d'utilisateur

  if (!content || !username) {
      return res.status(400).send("Le contenu du commentaire et le nom d'utilisateur sont obligatoires.");
  }

  const query = "INSERT INTO comments (content, user_id) VALUES (?, (SELECT id FROM users WHERE name = ? LIMIT 1))";
  db.query(query, [content, username], (err, result) => {
      if (err) {
          console.error("Erreur lors de l'ajout du commentaire :", err);
          return res.status(500).send("Erreur lors de l'ajout du commentaire.");
      }
      res.status(201).send("Commentaire ajouté avec succès.");
  });
});

app.put("/api/comments/:id", (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).send("Le contenu du commentaire est obligatoire.");
    }

    const query = "UPDATE comments SET content = ? WHERE id = ?";
    db.query(query, [content, id], (err, result) => {
        if (err) {
            console.error("Erreur lors de la modification du commentaire :", err);
            return res.status(500).send("Erreur lors de la modification du commentaire.");
        }
        res.status(200).send("Commentaire modifié avec succès.");
    });
});

app.delete("/api/comments/:id", (req, res) => {
  const { id } = req.params;
  console.log("ID reçu pour suppression :", id); // Ajoutez ce log

  const query = "DELETE FROM comments WHERE id = ?";
  db.query(query, [id], (err, result) => {
      if (err) {
          console.error("Erreur lors de la suppression du commentaire :", err);
          return res.status(500).send("Erreur lors de la suppression du commentaire.");
      }
      if (result.affectedRows === 0) {
          return res.status(404).send("Commentaire non trouvé.");
      }
      res.status(200).send("Commentaire supprimé avec succès.");
  });
});

app.get("/api/dashboard/stats", (req, res) => {
  const statsQuery = `
      SELECT
          (SELECT COUNT(*) FROM users WHERE service_status = 'not_started') AS new_orders,
          (SELECT COUNT(*) FROM users WHERE service_status = 'in_progress') AS ongoing_services,
          (SELECT COUNT(*) FROM users WHERE service_status = 'completed') AS completed_services,
          (SELECT COUNT(*) FROM users) AS total_clients
  `;
  db.query(statsQuery, (err, results) => {
      if (err) {
          console.error("Erreur lors de la récupération des statistiques :", err);
          return res.status(500).send("Erreur lors de la récupération des statistiques.");
      }
      res.status(200).json(results[0]);
  });
});

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
