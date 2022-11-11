

import yt from 'youtube-stream-url';


let delay = t=> new Promise(res=>setTimeout(res, t));

async function sourceFetcher(url){
    return await yt.getInfo({url})
    // return [...(await yt.getInfo({url})).formats].filter(x=>x.mimeType.includes("audio/"));
}


export {sourceFetcher};