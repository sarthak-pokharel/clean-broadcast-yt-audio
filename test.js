
// import usetube from 'usetube';
import ytfps from 'ytfps';

async function playListScrape(purl){
    let a = (await ytlist(purl, 'url'));
    console.log('kk',a);
    return a;
}


(async function(){
    
})();