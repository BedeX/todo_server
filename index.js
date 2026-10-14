import express from 'express'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { myConfig } from './configDatabase.js'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())

let connection

try {
    connection = mysql.createPool(myConfig)
    await connection.query('SELECT 1')
    console.log('Sikeres adatbázis kapcsolódás:', myConfig.database)
} catch (error) {
    console.log('HIBA', error);
    process.exit(1);
}

app.get('/todos', async (request, response) => {
    try {
        const sql = 'SELECT * FROM todolist ORDER BY timestamp'
        const [rows, fields] = await connection.execute(sql)
        //console.log(rows, fields);
        response.status(200).send(rows)
    } catch (error) {
        console.log(error);
    }
})

app.post('/todos', async (request, response) => {
    const { task } = request.body
    try {
        const sql = 'INSERT INTO todolist (task) VALUES(?)'
        await connection.execute(sql, [task])
        response.status(200).json({ msg: 'Sikeres hozzáadás!' })
    } catch (error) {
        console.log(error);

    }
})

app.patch('/todos/:id', async (request, response) => {
    const { id } = request.params
    try {
        const sql = 'UPDATE todolist SET complete=NOT complete WHERE id=?'
        await connection.execute(sql, [id])
        response.status(200).json({ msg: 'Sikeres módosítás!' })
    } catch (error) {
        console.log(error);
    }
})

app.delete('/todos/:id', async (request, response) => {
    const { id } = request.params
    try {
        const sql = 'DELETE FROM todolist WHERE id=?'
        await connection.execute(sql, [id])
        response.status(200).json({ msg: 'Sikeres törlés!' })
    } catch (error) {
        console.log(error);
    }
})

//bejelentkezés, javitsd ki
app.post('/todos/login', (request, response) => {
    const { username, password } = request.body
    if (username == process.env.LOGIN_USERNAME && password == process.env.LOGIN_PASSWORD)
        response.json({ success: true, msg: 'Sikeres bejelentkezés!' })
    else
        response.json({ success: false, msg: 'Hibás bejelentkezési adatok.' })
})

const port = process.env.PORT || 8000
app.listen(port, () => console.log(`Server listening on port: ${port}...`))