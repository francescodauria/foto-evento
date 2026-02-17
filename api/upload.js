import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const form = formidable({});
  
  try {
    const [fields, files] = await form.parse(req);
    const file = files.file[0];

    // --- LOG DI CONTROLLO ---
    console.log("ID CARTELLA RICEVUTO:", process.env.FOLDER_ID);
    console.log("EMAIL SERVICE ACCOUNT:", process.env.G_EMAIL);

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.G_EMAIL,
        private_key: process.env.G_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.create({
      requestBody: {
        name: `Foto_${Date.now()}_${file.originalFilename}`,
        parents: [process.env.FOLDER_ID.trim()], // Usiamo trim() per eliminare spazi invisibili
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.filepath),
      },
      // Queste opzioni sono vitali per i Service Account
      supportsAllDrives: true,
      ignoreDefaultVisibility: true,
      fields: 'id',
    });

    return res.status(200).json({ success: true, id: response.data.id });
  } catch (error) {
    console.error("ERRORE CRITICO:", error.message);
    // Mandiamo l'errore esatto al browser per vederlo subito
    return res.status(500).json({ 
        error: error.message, 
        instruction: "Verifica che l'ID cartella nei log di Vercel non sia undefined o vuoto" 
    });
  }
}
