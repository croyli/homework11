import express from 'express'
import path from 'path'
import cors from 'cors'
import sockjs from 'sockjs'
// import { renderToStaticNodeStream } from 'react-dom/server'
// import React from 'react'
import axios from 'axios'
import cookieParser from 'cookie-parser'
import config from './config'
import Html from '../client/html'

const { readFile, writeFile, unlink } = require('fs').promises

require('colors')

// let Root
// try {
//   // eslint-disable-next-line import/no-unresolved
//   Root = require('../dist/assets/js/ssr/root.bundle').default
// } catch {
//   console.log('SSR not found. Please run "yarn run build:ssr"'.red)
// }

let connections = []

const port = process.env.PORT || 230
const server = express()

const setHeaders = (req, res, next) => {
  res.set('x-skillcrucial-user', '75e66f9a-ace8-4669-9c6f-9062a988c7bc')
  res.set('Access-Control-Expose-Headers', 'X-SKILLCRUCIAL-USER')
  next()
}

const middleware = [
  cors(),
  express.static(path.resolve(__dirname, '../dist/assets')),
  express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
  express.json({ limit: '50mb', extended: true }),
  cookieParser(),
  setHeaders
]

middleware.forEach((it) => server.use(it))

// 1 zadanie na get zapros
const globalUrl = 'https://jsonplaceholder.typicode.com/users'
const usersPath = `${__dirname}/data/users.json`
const getData = (url) => {
  const usersList = axios(url)
    .then(({ data }) => {
      return data
    })
    .catch((err) => {
      console.log(err)
      return []
    })
  return usersList
}

const writeNewFile = (finalArray) => {
  return writeFile(usersPath, JSON.stringify(finalArray), 'utf-8')
}

server.get('/api/v1/users', async (req, res) => {
  const responce = await readFile(usersPath, 'utf-8')
    .then((usersData) => {
      return JSON.parse(usersData)
    })
    .catch(async (err) => {
      console.log(err)
      const receiveData = await getData(globalUrl)
      await writeNewFile
      return receiveData
    })
  res.json(responce)
})

server.post('/api/v1/users', async (req, res) => {
  const usersList = await readFile(usersPath, 'utf-8')
    .then(async (str) => {
      const parsedString = JSON.parse(str)
      const lastId = parsedString[parsedString.length - 1].id + 1
      await writeNewFile([...parsedString, { ...req.body, id: lastId }])
      return { status: 'success', id: lastId }
    })
    .catch(async (err) => {
      console.log(err)
      await writeNewFile([{ ...req.body, id: 1 }])
      return { status: 'success', id: 1 }
    })
  res.json(usersList)
})

server.patch('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params
  const updatedUser = { ...req.body, id: userId }
  const response = await readFile(usersPath, 'utf-8')
    .then(async (str) => {
      const parsedString = JSON.parse(str)
      const mapUsers = parsedString.map((obj) => {
        return obj.id === +userId ? { ...obj, ...updatedUser } : obj
      })
      await writeNewFile(mapUsers)
      return { status: 'success', id: +userId }
    })
    .catch((err) => {
      console.log(err)
      return { status: 'No file exist', id: +userId }
    })
  res.json(response)
})

server.delete('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params
  const response = await readFile(usersPath, 'utf-8')
    .then(async (str) => {
     const parsedString = JSON.parse(str)
     const filteredUsers = parsedString.filter((user) => {
      return +userId !== +user.id
    })
    await writeNewFile(filteredUsers)
    return { status: 'success', id: +userId }
  })
  .catch(() => {
    return { status: 'No user', id: +userId }
  })
  res.json(response)
})

server.delete('/api/v1/users', (req, res) => {
  unlink(usersPath)
    .then(() => {
      res.json({ status: 'File deleted' })
    })
    .catch((err) => {
      console.log('Error', err)
      res.json({ status: 'No file' })
    })
})

// 4 zadanie na delete usera

// function write(fileName, obj) {
//   return writeFile(fileName, JSON.stringify(obj), { encoding: 'utf-8' })
// }
// async function read(fileName) {
//   const data = await readFile(fileName, { encoding: 'utf-8' })
//   return data
// }

// server.delete('/api/v1/users/:userId', async (req, res) => {
//   const { userId } = req.params
//   const data = JSON.parse(await read(usersPath))
//   write(usersPath, [...data.filter((it) => it.id !== +userId)])
//   res.json({ status: 'success', id: +userId })
// })
// 4 zadanie na delete usera

server.use('/api/', (req, res) => {
  res.status(404)
  res.end()
})

server.get('/*', (req, res) => {
  const initialState = {
    location: req.url
  }
  return res.send(
    Html({
      body: '',
      initialState
    })
  )
})

// const [htmlStart, htmlEnd] = Html({
//   body: 'separator',
//   title: 'Skillcrucial'
// }).split('separator')

// server.get('/', (req, res) => {
//   const appStream = renderToStaticNodeStream(<Root location={req.url} context={{}} />)
//   res.write(htmlStart)
//   appStream.pipe(res, { end: false })
//   appStream.on('end', () => {
//     res.write(htmlEnd)
//     res.end()
//   })
// })

// server.get('/*', (req, res) => {
//   const appStream = renderToStaticNodeStream(<Root location={req.url} context={{}} />)
//   res.write(htmlStart)
//   appStream.pipe(res, { end: false })
//   appStream.on('end', () => {
//     res.write(htmlEnd)
//     res.end()
//   })
// })

const app = server.listen(port)

if (config.isSocketsEnabled) {
  const echo = sockjs.createServer()
  echo.on('connection', (conn) => {
    connections.push(conn)
    conn.on('data', async () => {})

    conn.on('close', () => {
      connections = connections.filter((c) => c.readyState !== 3)
    })
  })
  echo.installHandlers(app, { prefix: '/ws' })
}
console.log(`Serving at http://localhost:${port}`)
