const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const imagesRoutes = require('./routes/images.routes')
const importRoutes = require('./routes/import.routes')

const app = express()

app.use(cors({origin: '*'}));

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use('/images', imagesRoutes)
app.use('/api/import', importRoutes)
app.use('/static', express.static(__dirname + '/../static'))

module.exports = app
