const express = require('express')
const app = express()
const cors = require('cors')
const config = require('./config/config')
const { ormErrorHandler, boomErrorHandler, errorHandler } = require('./middlewares/errorHandler')
const { models } = require('./libs/sequelize')
const routerApi = require('./routes/index')
const passport = require('passport')
const axios = require('axios')

app.use(express.json())
app.use(cors())

require('./utils/auth/index')

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
        const response = await models.Task.bulkCreate(tasks)
        res.status(201).json('Se rellenaron las tareas de la casa correctamente')
    } catch (err) {
        next(err)
    }
})

app.get('/finances/export', 
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            let { year, month } = req.query
            const fastApiUrl = `${config.urlFastApi}/export/finances?year=${year || ""}&month=${month || ""}`

            const response = await axios.get(fastApiUrl, { responseType: "stream" });

            res.setHeader("Content-Disposition", "attachment; filename=finanzas.csv");
            response.data.pipe(res);
        } catch (err) {
            next(err)
        }
    }
)

app.listen(config.port, () => console.log(`La API esta corriendo en el puerto ${config.port}`))
