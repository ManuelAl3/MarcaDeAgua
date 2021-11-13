let ffmpeg = require("ffmpeg");
const fs = require("fs");

const { workerData, parentPort } = require("worker_threads");
let dest = "/dest/video.mp4";

try {
    // Variable para traernos el archivo
    let process = new ffmpeg(workerData.file);
    // Cuando se procese...
    process.then(video => {
        // Config de la marca de agua
        video.fnAddWatermark(// fnAddWatermark: Función que añade la marca de agua
            // __dirname revisa en donde esta el archivo actual
            __dirname + "/marcadeagua.png",
            __dirname + "/" + workerData.filename, // workerData trae el filename
            {
                position:"C" // Declaramos la posición de la marca de agua en el video
            },
            // Prueba de errores
            function(err, file) {
                if(!err) {
                    console.log("El nombre del video procesado es"+ file);
                    parentPort.postMessage({ status: "Done", file: file });
                }
                else {
                    console.log(err + "Hola mundilloo");
                }
            }
        )
    });
}
catch(e) {
    console.log(e.code);
    console.log(e.msg);
}