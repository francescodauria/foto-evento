// File: api/download.js
export default async function handler(req, res) {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL mancante');

    try {
        // Il server di Vercel scarica la foto da Google (qui i blocchi di sicurezza non ci sono)
        const imageRes = await fetch(url);
        if (!imageRes.ok) throw new Error('Impossibile recuperare la foto');

        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Questa è la vera magia: forziamo il download sul telefono!
        res.setHeader('Content-Disposition', 'attachment; filename="Ricordo_Compleanno.jpg"');
        res.setHeader('Content-Type', 'image/jpeg');
        
        // Inviamo il file all'utente
        res.status(200).send(buffer);
    } catch (error) {
        console.error("Errore download:", error);
        res.status(500).send('Errore nel download');
    }
}
