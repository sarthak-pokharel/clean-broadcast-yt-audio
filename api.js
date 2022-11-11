
import express from "express";
import { v4 as genUniqueHash } from 'uuid';  
import {createUser} from './db.js'
import {sourceFetcher,playListScrape} from './sourceHandler.js';
import {getRoomsList, setRoomsList} from './db.js'


let app = express.Router();

app.get("/", (req,res)=>{
    res.end("Need something?");
})


app.post('/create-user', async (req,res)=>{
    let uname = req.body.username;
    let pass = req.body.password;
    
    if(!uname) return res.json({error: true, msg: 'invalid username'});
    if(!pass) return res.json({error: true, msg: 'invalid password'});

    if(createUser(uname, pass)){
        return res.json({error: false, msg: 'done'});
    }
    res.json({error: true, msg: 'Unknown Error'});
});


app.post('/create-room', async (req, res)=>{
    let roomid = req.body.roomid;
    if(!roomid) return res.json({error: true, msg: 'invalid roomid'});
    if(createRoom(req,res,roomid)){
        return res.json({error: false, msg: 'done'});
    }
    res.json({error:true, msg: "Unknown Error"})
});



app.post("/get-song-source", async(req,res)=>{
    try{
        let songUrl = req.body.url;
        console.log(songUrl);
        let ytvidDet = await sourceFetcher(songUrl);
        let src = [...ytvidDet.formats].filter(x=>x.mimeType.includes("audio/"))
        console.log()
        res.json({sources: src, full:ytvidDet});
    }catch(e){
        console.log(e);
        res.end('error');
    }
})

app.post('/scrape-yt-playlist', async function(req,res) {
    try {
        let plUrl = req.body.url;
        let list = await playListScrape(plUrl);
        res.json(list);
        
    }catch(e){
        console.log(e);
        res.end("error");
    }
})

let rooms;

function createRoom(req,res,rid){
    let ghostUserId = genUniqueHash();
    rooms = getRoomsList();
    rooms.push({
        id: rid, 
        hash: ghostUserId,
        state: {
            synchronizationState: {}
        }
    });
    setRoomsList(rooms);
    console.log(rooms);
    res.cookie('ghostUserId', ghostUserId, {maxAge: 60*60*24*365*5, httpOnly: true})
    return true;
}


app.post('/synchronize', async function verifyAdmin(req,res,next){
    let room = req.body.room;
    let ghostId = req.cookies.ghostUserId;
    console.log([room,ghostId]);
    let rooms = getRoomsList();
    if(rooms.filter(x=>x.id == room)[0].hash != ghostId){
        return res.end("error");
    }
    next();
});



app.post('/synchronize', (req,res)=>{
    let rooms = getRoomsList();
    for(let room of rooms){
        if(room.id == req.body.room){
            room.state.synchronizationState = req.body.audioState;
            setRoomsList(rooms);
            res.end('synchronized');
            return;
        }
    }
    res.end('error');
})
app.post("/latest-audio-state", (req,res)=>{
    let roomid = req.body.room;
    res.json(getRoomsList().filter(x=>x.id == roomid)[0].state.synchronizationState)
})




export default app;

