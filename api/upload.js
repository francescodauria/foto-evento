import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Necessario per gestire i file con formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non permesso' });
  }

  const form = formidable({});

  try {
    // 1. Parsing del file in arrivo
    const [fields, files] = await form.parse(req);
    const file = files.file[0];

    if (!file) {
      throw new Error("Nessun file ricevuto dal modulo");
    }

    // 2. Configurazione Autenticazione Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.G_EMAIL,
        private_key: process.env.G_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // 3. Caricamento su Drive
    // Nota: 'supportsAllDrives' risolve i problemi di quota sui Service Account
    const response = await drive.files.create({
      requestBody: {
        name: `Evento_${Date.now()}_${file.originalFilename || 'foto.jpg'}`,
        parents: [process.env.FOLDER_ID],
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.filepath),
      },
      // Queste due righe dicono a Google di ignorare la quota dell'account di servizio
      supportsAllDrives: true,
      keepRevisionForever: true, 
      fields: 'id',
    });

    return res.status(200).json({ success: true, id: response.data.id });

  } catch (error) {
    console.error("ERRORE DETTAGLIATO:", error.message);
    return res.status(500).json({ 
      error: error.message,
      dettagli: "Verifica che il Service Account sia EDITOR della cartella e che il FOLDER_ID sia corretto."
    });
  }
}
