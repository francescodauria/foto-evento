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
        
        // Estraiamo nome e messaggio (formidable a volte li mette in array)
        const author = fields.author ? (Array.isArray(fields.author) ? fields.author[0] : fields.author) : '';
        const message = fields.message ? (Array.isArray(fields.message) ? fields.message[0] : fields.message) : '';

        // Creiamo la didascalia da salvare su Drive
        let didascalia = "";
        if (author) didascalia += `📸 Scattata da: ${author}\n`;
        if (message) didascalia += `💬 ${message}`;

        const oauth2Client = new google.auth.OAuth2(
          (process.env.CLIENT_ID || '').trim(),
          (process.env.CLIENT_SECRET || '').trim()
        );

        oauth2Client.setCredentials({ 
          refresh_token: (process.env.REFRESH_TOKEN || '').trim() 
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const response = await drive.files.create({
          requestBody: {
            name: `Foto_${Date.now()}_${file.originalFilename || 'foto.jpg'}`,
            parents: [(process.env.FOLDER_ID || '').trim()],
            description: didascalia // SALVA NOME E MESSAGGIO QUI
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
