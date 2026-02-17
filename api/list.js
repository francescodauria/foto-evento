import { google } from 'googleapis';

export default async function handler(req, res) {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.G_EMAIL,
            private_key: process.env.G_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    try {
        const response = await drive.files.list({
            q: `'${process.env.FOLDER_ID}' in parents and mimeType contains 'image/'`,
            fields: 'files(id, name, thumbnailLink, webContentLink)',
            orderBy: 'createdTime desc'
        });
        res.status(200).json(response.data.files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
