const { Pool, Client } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database:'mancala',
  password: 'mysecretpassword',
  port: 5432,
})
module.exports = {
    query: (text, params, callback) => {
      return pool.query(text, params, callback)
    },
  }

