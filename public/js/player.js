let audioPlayer = new Audio();
audioPlayer.volume = 0.5;

let playState = false;
let mouseDownOnProgress = false;

const progressAudioDom = document.getElementById('progressAudio');
const volumeAudioDom = document.getElementById('volumeAudio');
const currentTimeDom = document.getElementById('currentTime');
const totalTimeDom = document.getElementById('totalTime');
const songNameMobileDom = document.getElementById('songNameMobile');

const playPauseIconDom = document.getElementById('playPauseIcon');
const volumeMuteIconDom = document.getElementById('volumeMuteIcon');



/* Play pause function */
function playAudio() {
  if(playState) {
    audioPlayer.pause();
    playState = false;
    playPauseIconDom.classList = "fas fa-play btnPlayIcon";
    playPauseIconDom.style.left = "1px;"
  } else {
    audioPlayer.play();
    playState = true;
    playPauseIconDom.classList = "fas fa-pause btnPauseIcon";
    playPauseIconDom.style.left = "0px;"
  }
}

/* Play song function */
async function playSong(id) {
  /* Set url to audio element */
  audioPlayer.src = api_url + "/api/playFile/" + parseInt(id);

  /* Play and set play state */
  audioPlayer.play();
  playState = true;
  playPauseIconDom.classList = "fas fa-pause btnPauseIcon";
  playPauseIconDom.style.left = "0px;"

  let test = await getSongData(id);
  songNameMobileDom.innerHTML = test.file;
}

/* Mute function */
function muteAudio() {
  if(audioPlayer.volume == 0) {
    audioPlayer.volume = 0.5;
    volumeMuteIconDom.classList = "fas fa-volume-up";
  } else {
    audioPlayer.volume = 0;
    volumeMuteIconDom.classList = "fas fa-volume-mute volumeMutedIcon";
  }
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

/* Volume change event on Audio */
audioPlayer.addEventListener("volumechange", () => {
  if(audioPlayer.volume == 0) {
    volumeAudioDom.value = (audioPlayer.volume * 100).toFixed(0);
    volumeMuteIconDom.classList = "fas fa-volume-mute volumeMutedIcon";
  } else {
    volumeAudioDom.value = (audioPlayer.volume * 100).toFixed(0);
    volumeMuteIconDom.classList = "fas fa-volume-up";
  }
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