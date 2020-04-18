const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const redis = require('redis')
const pg = require('pg')

const keys = require('./keys')

const PORT = 5000

const app = express()
app.use(cors())
app.use(bodyParser.json())

const pgClient = new pg.Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
})

pgClient.on('error', () => console.log('Lost PG connection'))

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch((err) => console.log(err))


const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisHost,
  retry_strategy: () => 1000
})
const redisPublisher = redisClient.duplicate()


app.get('/', (req, res) => {
  res.send('Hi')
})

app.get('/values/all', async (req,res) => {
  const values = await pgClient.query('SELECT * FROM values')

  res.send(values.rows)
})

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values)
  })
})

app.post('/values', async (req, res) => {
  const index = req.body.index
  
  if(parseInt(index) > 40) {
    return res.status(422).send('Index too high')
  }

  redisClient.hset('values', index, 'Nothing yet')
  redisPublisher.publish('insert', index)
  pgClient.query(`INSERT INTO values(number) VALUES($1)`, [index])

  res.send({working: true})
})


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})