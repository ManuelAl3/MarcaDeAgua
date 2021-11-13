import express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import multer from 'multer'; // Permite manejar los archivos de una mejor manera
import{ Worker, isMainThread, workerData } from 'worker_threads';

require('dotenv').config();

// Almacenamiento y subida de archivos
const storage = multer.diskStorage({
    destination:'./uploads/',
    filename: function(req, file, cb) {
        // Toma el nombre del archivo y le concatena la fecha y el nombre original
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        console.log(file.fieldname + "Hola cb")
    }
});

// En MULTER le pasamos el destino de subida
const upload = multer({ destination:'uploads', storage: storage });

const app = express();
app.use(bodyParser.json());
// Con el urlencoded manejamos el formato de los videos(multiportdata)
app.use(bodyParser.urlencoded({ extended: false }));// Necesario para poder subir archivos

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.get("/", (req, res) => {
    res.render("index");
});

//Mandamos el video
app.post("/upload-video", upload.single("ssvideo"), (req, res) => {
    if(isMainThread)// Si estoy en el proceso principal
    {
        let thread = new Worker("./threads/worker.js", {
            // Pasamos información
            workerData: {
                file: req.file.path, // Tomamos la ruta
                filename: req.file.filename // Tomamos el nombre del archivo
            }
        });

        // Notifica al hilo principal cuando termina el hilo secundario
        thread.on("message", (data) => {
            res.download(data.file, req.file.filename);
        });

        thread.on("error", (err) => {
            console.log("Error en el thread", err);
        });

        thread.on("exit", (code) => {
            if(code != 0) {
                console.log(`El hilo se detuvo con el código de salida: ${code}`)
            }
        });
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`El servidor se inicio en el puerto: ${PORT}`)
});
