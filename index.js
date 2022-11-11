import express from "express";
import http from "http";
import apiRouter from './api.js'
import staticRouter from './static.js'
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

const app = express();
const server = http.createServer(app);
const __PORT__ = process.env.__PORT__ || 8080;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", apiRouter);
app.use("/", staticRouter);


app.use((req,res)=>{
    res.status(401).send('Something Fishy<br/>401')
})

server.listen(__PORT__, err=>{
    if(err) throw err;
    console.log(`Server at port ${__PORT__}`)
});

