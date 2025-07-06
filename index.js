const express = require('express')
const cors = require('cors')
const config = require('./config/config')
const { ormErrorHandler, boomErrorHandler, errorHandler } = require('./middlewares/errorHandler')
const { models } = require('./libs/sequelize')
const routerApi = require('./routes/index')
const axios = require('axios')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const { verifyToken } = require('./middlewares/authHandler')

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8081', 'https://proyecto-familia-tareas-frontend.onrender.com', 'https://familia-tareas.netlify.app'], // Tu frontend
  credentials: true, // Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet())

routerApi(app)

app.use(ormErrorHandler)
app.use(boomErrorHandler)
app.use(errorHandler)

app.post('/rellenar', async (req, res, next) => {
    try {
        const tasks = [
            {task: "Organizar Cocina", points: 20, folderId: 1},
            {task: "Lavar un baño", points: 30, folderId: 1},
            {task: "Organizar Lavandería", points: 25, folderId: 1},
            {task: "Tender Cama (antes de las 12:00PM)", points: 5, folderId: 1},
            {task: "Organizar Comedor", points: 10, folderId: 1},
            {task: "Organizar Area", points: 15, folderId: 1},
            {task: "Barrer y Trapear Area", points: 20, folderId: 1},
            {task: "Lavar Ropa", points: 35, folderId: 1},
            {task: "Organizar Arena Gato", points: 15, folderId: 1},
            {task: "Organizar Nevera", points: 20, folderId: 1},
            {task: "Sacar Basura", points: 20, folderId: 1},
            {task: "Planear y Hacer Mercado", points: 35, folderId: 1},
            {task: "Llevar Botellas de Amor y Sacar Reciclaje", points: 15, folderId: 1},
            {task: "Presupuesto y contabilidad", points: 10, folderId: 1},
            {task: "Recreacion en familia", points: 15, folderId: 1},
            {task: "Ejercicio", points: 10, folderId: 1},
            {task: "Hacer almuerzo y comida", points: 35, folderId: 1},
            {task: "Preparar Ingredientes para las comidas", points: 30, folderId: 1},
            {task: "Lavar ropa interior", points: 5, folderId: 1},
            {task: "Hacer rosario en familia", points: 25, folderId: 1},
            {task: "Hacer desayuno", points: 20, folderId: 1},
            {task: "Lavar losa (mientras hacen el almuerzo)", points: 20, folderId: 1},
            {task: "Asistir a citas medicas", points: 20, folderId: 1},
            {task: "Barrer (comedor y pasillo)", points: 20, folderId: 1},
            {task: "Sacar citas medicas", points: 15, folderId: 1},
            {task: "Lavar losa (Noche)", points: 10, folderId: 1},
            {task: "Lavar losa (Dia)", points: 10, folderId: 1},
        ]
        await models.Task.bulkCreate(tasks)
        res.status(201).json('Se rellenaron las tareas de la casa correctamente')
    } catch (err) {
        next(err)
    }
})

app.get("/finances/export", verifyToken, async (req, res, next) => {
        try {
            let { year, month, type } = req.query; // 🔹 Agregar filtro de tipo de transacción
            let endpoint = type === "private" ? "/export/private-transactions" : "/export/public-transactions";

            let userId = req.user.sub

            let fastApiUrl = `${config.urlFastApi}${endpoint}?year=${year || ""}&month=${month || ""}`;
            if (type === "private") {
                fastApiUrl += `&user_id=${userId}`
            }

            console.log(`🔗 Llamando a FastAPI: ${fastApiUrl}`);

            // Hacer la petición a FastAPI
            const response = await axios.get(fastApiUrl, { responseType: "stream" });

            res.setHeader("Content-Disposition", `attachment; filename=finanzas_${type || "public"}.csv`);
            response.data.pipe(res); // 🔹 Pasar el stream de FastAPI al cliente

        } catch (err) {
            console.error("❌ Error descargando CSV:", err.message);
            next(err);
        }
    }
);

app.listen(config.port, () => console.log(`La API esta corriendo en el puerto ${config.port}`))
