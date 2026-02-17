import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non permesso' });

  const form = formidable({});
  
  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: "Errore parsing file" });
        return resolve();
      }

      try {
        const file = files.file[0] || files.file; // Gestisce diverse versioni di formidable
        
        // Verifica che le variabili esistano
        if (!process.env.G_KEY || !process.env.G_EMAIL) {
          throw new Error("Variabili d'ambiente G_KEY o G_EMAIL mancanti");
        }

        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.G_EMAIL,
            private_key: process.env.G_KEY.replace(/\\n/g, '\n'),
          },
          scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        const response = await drive.files.create({
          requestBody: {
            name: `Evento_${Date.now()}_${file.originalFilename || 'foto.jpg'}`,
            parents: [process.env.FOLDER_ID],
          },
          media: {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.filepath),
          },
        });

        res.status(200).json({ success: true, id: response.data.id });
        resolve();
      } catch (error) {
        console.error("ERRORE DETTAGLIATO:", error.message);
        res.status(500).json({ error: error.message, stack: error.stack });
        resolve();
      }
    });
  });
}
