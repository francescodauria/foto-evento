// File: api/download.js
export default async function handler(req, res) {
    // Ora leggiamo anche il parametro "filename" dall'URL
    const { url, filename } = req.query;
    if (!url) return res.status(400).send('URL mancante');

    // Se non c'è un nome, usiamo un fallback basato sul timestamp per renderlo sempre unico
    const safeFilename = filename || `Foto_Compleanno_${Date.now()}.jpg`;

    try {
        const imageRes = await fetch(url);
        if (!imageRes.ok) throw new Error('Impossibile recuperare la foto');

        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Inseriamo il nome dinamico nell'etichetta del download
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        res.setHeader('Content-Type', 'image/jpeg');
        
        res.status(200).send(buffer);
    } catch (error) {
        console.error("Errore download:", error);
        res.status(500).send('Errore nel download');
    }
}
