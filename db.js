
import { v4 as genUniqueHash } from 'uuid';  
import fs from 'fs';

let dbfolder = "db";
let usersJSON = `${dbfolder}/users.json`;
let roomsJSON = `${dbfolder}/rooms.json`;

let getUsersList = () => JSON.parse(fs.readFileSync(usersJSON))
let setUsersList = dat => fs.writeFileSync(usersJSON, JSON.stringify(dat, null, 2));

let getRoomsList = () => JSON.parse(fs.readFileSync(roomsJSON))
let setRoomsList = dat => fs.writeFileSync(roomsJSON, JSON.stringify(dat, null, 2));

function createUser(username, password){
    setUsersList([...getUsersList(),prepUser(username, password)]);
    return true;
}



function prepUser(u,p){
    return {username: u, password:p, uniqueHash: genUniqueHash()}
}




export {createUser, getRoomsList, setRoomsList};

