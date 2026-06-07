const { Client } = require('pg')

const connectionString =
	'postgresql://timur_db:dT8Q7qh7PWFvX0shYNn674gCqrMDIaAQ@dpg-d8habe3tqb8s739lonhg.oregon-postgres.render.com/kiyim_chechak_db'

const client = new Client({
	connectionString: connectionString,
	ssl: {
		rejectUnauthorized: false,
	},
})

client
	.connect()
	.then(() => {
		console.log('Connected successfully')
		return client.query('SELECT NOW()')
	})
	.then(res => {
		console.log('Result:', res.rows[0])
		process.exit(0)
	})
	.catch(err => {
		console.error('Connection error:', err.stack)
		process.exit(1)
	})
