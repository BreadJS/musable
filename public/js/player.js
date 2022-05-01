var audioPlayer = new Audio();
let playState = false;
let mouseDownOnProgress = false;

const progressAudioDom = document.getElementById('progressAudio');
const volumeAudioDom = document.getElementById('volumeAudio');
const currentTimeDom = document.getElementById('currentTime');
const totalTimeDom = document.getElementById('totalTime');

/* Play pause function */
function playAudio() {
  if(playState) {
    audioPlayer.pause();
    playState = false;
  } else {
    audioPlayer.play();
    playState = true;
  }
}

/* Play song function */
function playSong(id) {
  /* Set url to audio element */
  audioPlayer.src = api_url + "/api/playFile/" + parseInt(id);

  /* Play and set play state */
  audioPlayer.play();
  playState = true;
}


/* Time progress updates event on Audio */
audioPlayer.addEventListener("timeupdate", () => {
  /* Update current value of progress bar */
  if (!mouseDownOnProgress) {
    document.getElementById('progressAudio').value = Math.round(audioPlayer.currentTime * 10).toFixed(0);
  }
  
  /* Update current time */
  let currentDate = new Date(0);
  let totalDate = new Date(0);
  currentDate.setSeconds(audioPlayer.currentTime);
  totalDate.setSeconds((isNaN(audioPlayer.duration) ? 0 : audioPlayer.duration));
  let currentTime = currentDate.toISOString().substr(11, 8);
  let totalTime = totalDate.toISOString().substr(11, 8);
  currentTimeDom.innerHTML = (totalTime.split(':')[0] == "00" ? (totalTime.split(':')[1].split("")[0] == "0" ? currentTime.split(':')[1].split("")[1] : currentTime.split(':')[1]) + ":" + currentTime.split(':')[2] : (totalTime.split("")[0] == "0" ? currentTime.substring(1) : currentTime));
});

/* File loaded event on Audio */
audioPlayer.addEventListener("loadeddata", () => {
  /* Update maximum value of progress bar */
  document.getElementById('progressAudio').max = Math.round(audioPlayer.duration * 10).toFixed(0);

  /* Update total time */
  let date = new Date(0);
  date.setSeconds(audioPlayer.duration);
  let time = date.toISOString().substr(11, 8);
  totalTimeDom.innerHTML = (time.split(':')[0] == "00" ? (time.split(':')[1].split("")[0] == "0" ? time.split(':')[1].split("")[1] : time.split(':')[1]) + ":" + time.split(':')[2] : (time.split("")[0] == "0" ? time.substring(1) : time) );
  if(time.split(":").length == 3) {
    currentTimeDom.innerHTML = (time.split("")[0] == "0" ? "0:00:00" : "00:00:00");
  }
});

/* Song ended event on Audio */
audioPlayer.addEventListener("ended", () => {
  console.log('song ended')
});

/* Mouse down event on progress bar */
progressAudioDom.addEventListener("mousedown", () => {
  mouseDownOnProgress = true;
});

/* Mouse up event on progress bar */
progressAudioDom.addEventListener("mouseup", () => {
  mouseDownOnProgress = false;
});

/* Change event on progress bar */
progressAudioDom.addEventListener("change", () => {
  audioPlayer.currentTime = progressAudioDom.value / 10;
});

/* Change event on volume bar */
volumeAudioDom.addEventListener("change", () => {
  audioPlayer.volume = volumeAudioDom.value / 100;
});