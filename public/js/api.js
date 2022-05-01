let api_url = "http://192.168.178.31:4600";

(async() => {
  let songDataReq = await fetch(api_url + '/api/getAllSongs');
  let songData = await songDataReq.json();

  let domElementData = "";
  songData.forEach(song => {
    domElementData += `<a href="#!" onclick="playSong(${song.id})">${song.file}</a><br>`
  });

  document.getElementById('songs').innerHTML = domElementData;
})();