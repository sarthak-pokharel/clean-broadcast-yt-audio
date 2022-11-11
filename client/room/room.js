
let sourcesMapping = {};
let pl;
let loadingDisableables;
let createUserForm;

function Main() {
    createUserForm = document.forms["import-song"];
    loadingDisableables = [ $(createUserForm).find("input") ];
    loadingDisableables.disable = () => loadingDisableables.forEach(x=>x.prop('disabled', true));
    loadingDisableables.enable = () => loadingDisableables.forEach(x=>x.prop('disabled', false));
    pl = $("#main-player");

    setEvents();
}
async function playSongFromUrl(surl){
    loadingDisableables.disable();
    let soundsrc = await getSource(surl);
    soundsrc.sources.sort((a,b)=>a.bitrate-b.bitrate)
    console.log(soundsrc.sources)
    sourcesMapping[surl] = soundsrc.sources;
    await playSong(surl);
    syncronizationUpdater()
    setInterval(syncronizationUpdater, 5000);
    loadingDisableables.enable();
}

let queue = [], currentSong = -1;

function setEvents() {
    createUserForm.addEventListener('submit', async ev => {
        ev.preventDefault();
        let songUrl = createUserForm['song-url'].value;
        await playSongFromUrl(songUrl);
    });
    pl[0].onseeked = ()=>{
        syncronizationUpdater();
    }
    pl[0].onended = ()=>{
        playNext();
    }
    $("#add-to-queue").on('click',async function(){
        let surl = createUserForm['song-url'].value;
        let songDetails = await getSource(surl);
        queue.push({surl,songDetails});
        let qlc = queue.length-1;
        $("#queue-display tbody").append(`

<tr>
    <td style="cursor: pointer;"> ▶️ </td>
    <td>${songDetails.full.videoDetails.title.substr(0,40).padEnd(43,".")}</td>
    <td style="cursor: pointer;"> ❌ </td>
</tr>
        `);
        $("tr").last().children().eq(0).on('click', function(){
            let thisid = [...this.parentNode.parentNode.children].indexOf(this.parentNode);
            currentSong = thisid;
            pl[0].src="";
            loadingDisableables.disable();
            playSongFromQueue(currentSong);
        });
        $("tr").last().children().eq(2).on('click', function(){
            let thisid = [...this.parentNode.parentNode.children].indexOf(this.parentNode);
            console.log(thisid);
            queue.splice(thisid, 1);
            $(this).parent().remove();
            if(thisid == currentSong){
                playNext();
            }
        });
        createUserForm['song-url'].value = "";
        if(queue.length == 1){
            currentSong = 0;
            playSongFromQueue(currentSong);
        }
    })
}

function playNext(){
    if(queue.length == 0) {
        $("audio")[0].pause();
        $("audio").prop("src","");
        return;
    }
    if(currentSong == -1 || (currentSong >= (queue.length-1))){
        currentSong = 0;
    }else {
        currentSong+=1;
    }
    playSongFromQueue(currentSong);
}

function playSongFromQueue(i){
    playSongFromUrl(queue[i].surl)
}

let audioState = {
    paused: true,
    globalTimeStamp: Date.now(),
    audioTimeStamp: 0,
    audioUrl: null
}


let currentRoomId = new URL(location.href).pathname.split("/")[2];
let syncInterval;

async function syncronizationUpdater(){
    audioState.paused = pl[0].paused;
    audioState.globalTimeStamp = Date.now();
    audioState.audioTimeStamp = pl[0].currentTime;

    let req = await $.post('/api/synchronize', {audioState: audioState, room: currentRoomId});
    console.log(req);
    // let informServer = await $.post('/api/')
}

async function syncronizationLoader(){
    let latestSettings = await $.post('/api/latest-audio-state', {room:currentRoomId});
    if(!latestSettings.audioUrl) return;
    
    await playSongFromUrl(latestSettings.audioUrl);
    let deltaTime = (Date.now()- latestSettings.globalTimeStamp)/1000;
    pl[0].currentTime = (+latestSettings.audioTimeStamp)+deltaTime;
    // console.log(deltaTime)
    // if(!audioState.paused) pl[0].play();
    console.log(latestSettings)
}


async function playSong(songurl){
    pl.prop("src", sourcesMapping[songurl][0].url);
    await pl[0].load();
    await pl[0].play();
    audioState.paused = false;
    audioState.globalTimeStamp = Date.now();
    audioState.audioTimeStamp = pl[0].currentTime;
    audioState.audioUrl = songurl;
}

function getSource(src){
    return $.post('/api/get-song-source', {url:src});
}

window.addEventListener('load', Main);
