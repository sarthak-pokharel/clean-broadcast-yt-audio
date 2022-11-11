
import express from "express";
import {getRoomsList, setRoomsList} from './db.js'
let app = express.Router();



app.use('/share-music', express.static("./client/sharemusic.html"))

let roomExists = prn => getRoomsList().filter(x=>x.id == prn.roomid).length == 1;



app.use('/r/:roomid', (req,res,next)=>{
    //Verify if room exists or not
    if(roomExists(req.params))
        return next();
    res.end("room not found, sus")
});
app.use('/r/:roomid/stream', (req,res,next)=>{
    //Verify if room exists or not
    if(roomExists(req.params)){
        return next();
    }
    res.end("room not found, sus")
});
app.use('/r/:roomid/stream', express.static('./client/room/stream.html'));

app.use('/r/:roomid', (req,res,next)=>{
    //Verify if room exists or not
    console.log(req.path)
    if(!req.cookies.ghostUserId) return res.redirect('stream');
    if(getRoomsList().filter(x=>x.id == req.params.roomid)[0].hash == req.cookies.ghostUserId)
        return next();
    res.end("room not found, sus")
});
app.use('/r/:roomid', express.static("./client/room/"));

app.use('/r', (req,res)=>res.end('bro sus'));

app.get('/room', (req,res)=> res.end("crossing the limits, huh?") );




app.use('/',express.static("./client"))

export default app;

