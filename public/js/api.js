let api_url = "http://192.168.178.31:4600";

async function main() {
  let songDataReq = await fetch(api_url + '/api/getAllSongs');
  let songData = await songDataReq.json();

  let domElementData = "";
  songData.forEach(song => {
    domElementData += `<a href="#!" onclick="playSong(${song.id})">${song.file}</a><br>`
  });

  document.getElementById('songs').innerHTML = domElementData;
}
main();

async function getSongData(id) {
  let songDataReq = await fetch(api_url + `/api/getSong/${parseInt(id)}`);
  let songData = await songDataReq.json();
  return songData;
}