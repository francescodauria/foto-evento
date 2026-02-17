import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non permesso' });

  const form = formidable({});
  
  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Errore parsing file" });

      try {
        const file = files.file[0] || files.file;

        // Autenticazione con le TUE credenziali reali
        const oauth2Client = new google.auth.OAuth2(
          process.env.CLIENT_ID,
          process.env.CLIENT_SECRET,
          "https://developers.google.com/oauthplayground"
        );

        oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const response = await drive.files.create({
          requestBody: {
            name: `Foto_${Date.now()}_${file.originalFilename || 'foto.jpg'}`,
            parents: [process.env.FOLDER_ID],
          },
          media: {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.filepath),
          },
          fields: 'id',
        });

        res.status(200).json({ success: true, id: response.data.id });
        resolve();
      } catch (error) {
        console.error("ERRORE OAUTH:", error.message);
        res.status(500).json({ error: error.message });
        resolve();
      }
    });
  });
}
