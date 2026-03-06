import { google } from 'googleapis';

export default async function handler(req, res) {
    try {
        const oauth2Client = new google.auth.OAuth2(
            (process.env.CLIENT_ID || '').trim(),
            (process.env.CLIENT_SECRET || '').trim()
        );

        oauth2Client.setCredentials({ refresh_token: (process.env.REFRESH_TOKEN || '').trim() });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        let allFiles = [];
        let pageToken = null;

        // Questo ciclo "do-while" continua a chiedere file finché Google non dice che sono finiti
        do {
            const response = await drive.files.list({
                q: `'${(process.env.FOLDER_ID || '').trim()}' in parents and mimeType contains 'image/' and trashed = false`,
                // Abbiamo aggiunto "nextPageToken" per sapere se ci sono altre pagine di foto
                fields: 'nextPageToken, files(id, name, description, thumbnailLink, webContentLink)',
                orderBy: 'createdTime desc',
                pageSize: 1000, // Chiede fino a 1000 foto in un colpo solo
                pageToken: pageToken // Passa alla "pagina" successiva se esiste
            });
            
            // Unisce le foto appena scaricate a quelle già in memoria
            allFiles = allFiles.concat(response.data.files);
            
            // Aggiorna il token: se non ci sono più foto, diventerà null e il ciclo si fermerà
            pageToken = response.data.nextPageToken;
            
        } while (pageToken);
        
        // Invia TUTTE le foto trovate al sito
        res.status(200).json(allFiles);
        
    } catch (error) {
        console.error("ERRORE LISTA:", error.message);
        res.status(500).json({ error: error.message });
    }
}
