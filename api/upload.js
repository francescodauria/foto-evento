import { google } from 'googleapis';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } }; // Necessario per gestire i file

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Solo POST ammesso');

    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ error: "Errore nel parsing" });

        const file = files.file[0]; // Prende il file caricato
        
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.G_EMAIL,
                private_key: process.env.G_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        try {
            await drive.files.create({
                requestBody: {
                    name: `Guest_${Date.now()}_${file.originalFilename}`,
                    parents: [process.env.FOLDER_ID]
                },
                media: {
                    mimeType: file.mimetype,
                    body: fs.createReadStream(file.filepath),
                },
            });
            res.status(200).json({ message: "Caricato!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}
