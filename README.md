# 📸 Album Live Compleanno (Angela & Francesco)

Questa è un'applicazione web serverless progettata per eventi dal vivo. Permette agli ospiti di caricare foto direttamente dal proprio smartphone a una cartella Google Drive condivisa, visualizzando tutto in tempo reale su una bacheca o in formato feed stile Instagram.

---

## 🚀 Guida al Deploy su Vercel

Per far funzionare correttamente l'app, devi ospitarla su Vercel e configurare le variabili d'ambiente (Environment Variables) necessarie per autorizzare l'upload su Google Drive.

### Passo 1: Collega GitHub a Vercel
1. Crea un account su [Vercel](https://vercel.com/).
2. Clicca su **Add New Project**.
3. Seleziona questo repository da GitHub e clicca su **Import**.
4. Espandi la sezione **Environment Variables** (ti serviranno i dati spiegati nel Passo 2).

---

## 🔑 Passo 2: Come ottenere le Chiavi di Google Drive

Il codice ha bisogno di 4 "chiavi" segrete per comunicare con il tuo account Google. Ecco come ottenerle gratuitamente:

### A. Ottenere `FOLDER_ID`
1. Apri Google Drive dal PC e crea una nuova cartella per le foto (es. "Foto Compleanno").
2. Apri la cartella. Guarda la barra degli indirizzi in alto nel browser.
3. L'indirizzo sarà simile a questo: `https://drive.google.com/drive/folders/1A2b3C4d5E6f7G8h9I0j...`
4. Copia solo la lunga stringa di lettere e numeri finale. Quello è il tuo **`FOLDER_ID`**.

### B. Ottenere `CLIENT_ID` e `CLIENT_SECRET`
1. Vai su [Google Cloud Console](https://console.cloud.google.com/) e accedi con il tuo account Google.
2. Clicca in alto a sinistra (seleziona progetto) e crea un **Nuovo Progetto** (chiamalo es. "Album Compleanno").
3. Dal menu laterale, vai su **"Libreria API"** (API & Services > Library), cerca **"Google Drive API"** e clicca su **Abilita**.
4. Vai su **"Schermata di consenso OAuth"** (OAuth consent screen):
   - Scegli **Esterno** (External) e clicca Crea.
   - Inserisci un nome app e la tua email nei campi obbligatori. Salva e continua fino alla fine (non serve aggiungere nient'altro).
   - Clicca su **"Pubblica App"** (Publish App) per farla passare in produzione.
5. Vai su **"Credenziali"** (Credentials) nel menu laterale:
   - Clicca in alto su **+ CREA CREDENZIALI** > **ID client OAuth**.
   - Tipo di applicazione: **Applicazione Web**.
   - Nome: "Web App Compleanno" (o quello che vuoi).
   - Sotto la voce **"URI di reindirizzamento autorizzati"**, clicca AGGIUNGI URI e incolla ESATTAMENTE questo link: `https://developers.google.com/oauthplayground`
   - Clicca su **Crea**.
6. Ti apparirà una finestra con il tuo **`CLIENT_ID`** e il tuo **`CLIENT_SECRET`**. Copiali da qualche parte.

### C. Ottenere il `REFRESH_TOKEN` (La magia finale)
Questo token serve a far sì che l'app possa caricare foto per sempre senza chiederti ogni volta la password.
1. Vai su [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Clicca sull'icona dell'**Ingranaggio** (in alto a destra).
3. Spunta la casella **"Use your own OAuth credentials"**.
4. Incolla nei due campi il tuo `CLIENT_ID` e `CLIENT_SECRET` che hai appena creato. Clicca "Close".
5. Nel pannello di sinistra (Step 1), scorri la lista lunghissima, trova e apri **"Drive API v3"**.
6. Seleziona la spunta su: `https://www.googleapis.com/auth/drive`
7. Clicca sul pulsante blu **"Authorize APIs"**.
8. Ti chiederà di fare il login con il tuo account Google. 
   *(Nota: Google potrebbe darti un avviso dicendo "Google non ha verificato quest'app". Clicca su **Avanzate** e poi su "Vai a [Nome tua app] (non sicura)" per procedere).*
9. Clicca su "Continua" per dare i permessi.
10. Verrai riportato al Playground. Nel pannello a sinistra (Step 2), clicca sul pulsante blu **"Exchange authorization code for tokens"**.
11. Appariranno dei nuovi codici. Copia la stringa lunghissima accanto a **`Refresh token`** (inizia spesso con `1//...`). Questo è il tuo **`REFRESH_TOKEN`**.

---

### Passo 3: Inserisci le chiavi e avvia l'App!
Ora torna su Vercel (nella schermata che avevamo lasciato aperta al Passo 1) e inserisci le variabili d'ambiente scrivendo i nomi tutti in maiuscolo e incollando i valori trovati:

| Chiave (Name) | Valore (Value) |
| :--- | :--- |
| `FOLDER_ID` | `L'ID della tua cartella` |
| `CLIENT_ID` | `Il Client ID di Google Cloud` |
| `CLIENT_SECRET` | `Il Client Secret di Google Cloud` |
| `REFRESH_TOKEN` | `Il Refresh Token di OAuth Playground` |

Clicca su **Deploy**! 

> ⚠️ **Nota bene:** Se modifichi o aggiungi una Variabile d'Ambiente in un secondo momento, ricordati di fare un **Redeploy** su Vercel (dal tab *Deployments* > *Redeploy*) per applicare le modifiche.

---

## 📱 Modalità di Visualizzazione (Dual-Mode)

Questa web-app nasconde due facce, pensate per usi diversi durante l'evento:

1. **Bacheca Live (Modalità Standard)**
   * **URL:** `https://tuo-sito.vercel.app`
   * **Uso ideale:** Su un PC collegato a un proiettore (usa il tasto "Schermo Intero"). Mostra una griglia in tempo reale e uno slideshow automatico delle foto appena vengono caricate.

2. **Feed Social (Modalità Instagram)**
   * **URL Segreto:** `https://tuo-sito.vercel.app/?new` (aggiungi `/?new` alla fine del link)
   * **Uso ideale:** Condiviso tramite Codice QR per gli smartphone degli ospiti. Trasforma l'app in un vero e proprio "social network privato" dove scorrere le foto dall'alto verso il basso e leggere gli auguri sotto ad ogni scatto.
