/*
const pool = new Pool({ ... });
This line creates a new instance of the Pool class and passes configuration options as an object.
The configuration options include:
user: The username for the database.
host: The hostname of the database server.
database: The name of the database to connect to.
password: The password for the database user.
port: The port number of the database server.
These values are obtained from environment variables using process.env. 
This is a common practice for securely storing sensitive information.
*/
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

/*
This line attempts to connect to the database using the configured pool.
If the connection is successful, it logs a message to the console.
If there's an error, it logs an error message to the console, 
including the error stack for debugging purposes.
*/
pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Database connection error', err.stack));

module.exports = pool;
