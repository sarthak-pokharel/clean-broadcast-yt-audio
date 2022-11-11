

import yt from 'youtube-stream-url';
import ytfps from 'ytfps';


let delay = t=> new Promise(res=>setTimeout(res, t));

async function sourceFetcher(url){
    return await yt.getInfo({url})
    // return [...(await yt.getInfo({url})).formats].filter(x=>x.mimeType.includes("audio/"));
}


async function playListScrape(purl){
    let url = purl;
    let inf = await ytfps(url.match(/[&?]list=([^&]+)/i)[1]);
    return inf;
}


export {sourceFetcher, playListScrape};