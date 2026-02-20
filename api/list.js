import { google } from 'googleapis';

export default async function handler(req, res) {
    try {
        const oauth2Client = new google.auth.OAuth2(
            (process.env.CLIENT_ID || '').trim(),
            (process.env.CLIENT_SECRET || '').trim()
        );

        oauth2Client.setCredentials({ refresh_token: (process.env.REFRESH_TOKEN || '').trim() });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const response = await drive.files.list({
            q: `'${(process.env.FOLDER_ID || '').trim()}' in parents and mimeType contains 'image/ and trashed = false'`,
            // Abbiamo aggiunto "description" ai campi da scaricare
            fields: 'files(id, name, description, thumbnailLink, webContentLink)',
            orderBy: 'createdTime desc'
        });
        
        res.status(200).json(response.data.files);
    } catch (error) {
        console.error("ERRORE LISTA:", error.message);
        res.status(500).json({ error: error.message });
    }
}
