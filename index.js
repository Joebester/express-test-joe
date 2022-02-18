const express = require('express')
const basicAuth = require('express-basic-auth')
const cors = require("cors")
require('dotenv').config({path : __dirname + '/.env'})
// require('dotenv').config()
const { v4: uuidv4 } = require('uuid');

const app = express()
const port = process.env.PORT || 4000
const pass = process.env.SMS_PASSWORD

var sql = require("mssql");
const sqlConfig = {
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    options: {
        enableArithAbort: true,
        encrypt: false
    },
    user: process.env.DB_USER,
    server: process.env.DB_SERVER,
    port: 1433
}
try {
    sql.connect(sqlConfig, async function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("CONNECT");
        }
    });
} catch (error) {
    console.log("HELLO ERROR")
}


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization, Origin, Content-Type, Accept"

    );
    next()
})

app.use(basicAuth({
    users: { "LTC": pass },
    unauthorizedResponse: getUnauthorizedResponse
}))

function getUnauthorizedResponse(req) {
    return req.auth
        ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
        : 'No credentials provided'
}


app.post("/savelog", async (req, res) => {
    var body = req.body
    try {
        var uuid = uuidv4()
        await sql.query(`Insert into openLog (id, msisdn, network_type, status, resultDes, date_insert, user) 
        values ('${uuid}', '${body.msisdn}', '${body.network_type}', '${body.status}', '${body.resultDes}', CURRENT_TIMESTAMP, '${body.user}')`)
        res.status(200).json({ code: '200', resultDes: 'save success' });
    } catch (err) {
        res.status(210).json({ code: '210', resultDes: 'save error => ' + err });
    }
})

app.get("/", (req, res) => {
    res.status(200).json({
        code: 'done'
    })
})

app.listen(port, () => {
    console.log(`server runing at http://localhost:${port}`)
})
