const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middlewares/authHandler')
const TaskService = require('./../services/taskService')
const config = require('../config/config')
const service = new TaskService()
const randomString = require('randomstring')
const querystring = require('querystring')
const generateCodeChallenge = require('../utils/generateCode')
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const session = {}

router.post('/', verifyToken, async (req, res, next) => {
        try {
            const userId = req.user.sub
            const task = req.body
            const accessTokenGoogle = req.cookies.accessTokenGoogle
            const response = await service.createTask(task, userId, accessTokenGoogle)
            res.status(201).json({ newTask: response.newTask, resultCalendar: response.result })
        } catch (err) {
            next(err)
        }
    }
)

router.patch('/:id', verifyToken, async (req, res, next) => {
        try {
            const userId = req.user.sub
            const { id } = req.params
            const changes = req.body
            const accessTokenGoogle = req.cookies.accessTokenGoogle
            const response = await service.updateTask(id, changes, userId, accessTokenGoogle)
            res.json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.delete('/:id', verifyToken, async (req, res, next) => {
        try {
            const userId = req.user.sub
            const { id } = req.params
            const accessTokenGoogle = req.cookies.accessTokenGoogle
            const response = await service.deleteTask(id, userId, accessTokenGoogle)
            res.json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.patch('/:id/complete/task/public', verifyToken, async (req, res, next) => {
        try {
            const userId = req.user.sub
            const { id } = req.params
            const numberRepeat = req.body.numberRepeat
            const response = await service.completeTaskPublic(id, userId, numberRepeat)
            res.json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.patch('/:id/complete/task/private', verifyToken, async (req, res, next) => {
        try {
            const userId = req.user.sub
            const { id } = req.params
            const response = await service.completeTaskPrivate(id, userId)
            res.json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.patch('/descompleted/tasks', verifyToken, async (req, res, next) => {
        try {
            const response = await service.descompletedTasks()
            res.json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/tasks/monthly', verifyToken, async (req, res, next) => {
        try {
            const query = req.query
            const user = req.user.sub
            const response = await service.tasksForMonth(user, query)
            res.json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/google/handler', verifyToken, async (req, res, next) => {
    try {
        const scopes = [
            'https://www.googleapis.com/auth/calendar'
        ]
        const state = randomString.generate(16)
        session['state'] = state

        const query = querystring.stringify({
            client_id: config.googleClientId,
            scope: scopes.join(' '),
            response_type: 'code',
            redirect_uri: config.googleRedirectUri2,
            state
        })

        res.json(`${GOOGLE_AUTH_URL}?${query}`)
    } catch (err) {
        next(err)
    }
})

router.get('/google/callback', async (req, res, next) => {
    const urlRedirect = config.nodeEnv === 'production' ? 'https://familia-tareas.netlify.app' : 'http://localhost:5173'
    if (req.query.state !== session.state) {
        res.redirect(urlRedirect)
    }

    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: querystring.stringify({
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: config.googleRedirectUri2,
            client_id: config.googleClientId,
            client_secret: config.googleClientSecret
        })
    }

    try {
        const response = await fetch(GOOGLE_TOKEN_URL, options)
        const result = await response.json()

        res.cookie('accessTokenGoogle', result.access_token, {
            httpOnly: true,
            maxAge: 3600000,
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })

        res.redirect(urlRedirect)
    } catch (err) {
        next(err)
    }
})

router.patch('/update/google/event/:id', async (req, res, next) => {
    try {
        const accessTokenGoogle = req.cookies.accessTokenGoogle
        const { id } = req.params
        const changes = req.body
        const result = await service.updateEventGoogle(accessTokenGoogle, id, changes)
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.delete('/update/google/event/:id', async (req, res, next) => {
    try {
        const accessTokenGoogle = req.cookies.accessTokenGoogle
        const { id } = req.params
        const result = await service.deleteEventGoogle(accessTokenGoogle, id)
        res.json(result)
    } catch (error) {
        next(error)
    }
})  

module.exports = router
