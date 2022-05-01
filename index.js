const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const JsonDB = require('node-json-db');
const dree = require('dree');
const mm = require('music-metadata');

const config = require('./core/config.js');
const core = require('./core/core.js');
const logger = require('./core/log.js');
const package = require('./package.json');

const app = express();
const db = new JsonDB("database", true, true);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors({
  origin: [
    'http://127.0.0.1',
    'http://127.0.0.1:4600',
    'http://192.168.178.31',
    'http://192.168.178.31:4600'
  ]
}));

/* Clear terminal */
console.clear();
logger.log(logger.INFO, 'General', `Musable v${package.version}`)

let songLocations = [
  "Z:/Music"
];
let songExtensions = ['mp3', 'flac', 'wav', 'ogg'];


try {
  db.getData('/songs')
} catch(e) {
  db.push('/songs', [])
}


/* Add song to databse */
function addSongToDB(songName, folderName, ignore) {
  let currentSongs = db.getData('/songs');
  currentSongs.push({ id: (currentSongs.length), file: songName, folder: folderName, ignore: ignore });
  db.push('/songs', currentSongs);
}





/* Music scanner files */
function musicScanner() {
  logger.log(logger.INFO, 'Scanner', `Music scanner started...`);
  const options = {
    stat: false,
    extensions: songExtensions
  };
  
  const fileCallback = function (element, stat) {
    /* Global function values */
    let relativePath = "/" + element.relativePath.replace(element.name, '').replace('\\', '/').slice(0, -1) + "/";
    let song = element.name;

    /* Get database songs, set current songs counter, set song found false */
    let currentSongs = db.getData('/songs');
    let currentSongsC = 0;
    let songFound = false;

    /* Check if song is already in databse */
    for(dbSong in currentSongs) {
      if(currentSongs[dbSong].file == song) {
        songFound = true;
      }

      /* Last item, then add to database */
      if(currentSongsC == currentSongs.length-1) {
        if(songFound == false) {
          addSongToDB(song, relativePath, false);
          logger.log(logger.INFO, 'Scanner', `Song '${element.relativePath}' added to database!`);
        }
      }
      currentSongsC++;
    }

    /* If database is empty */
    if(currentSongs.length == 0) {
      logger.log(logger.INFO, 'Scanner', `Song '${element.relativePath}' added to database!`);
      addSongToDB(song, relativePath, false);
    }
  };
  const dirCallback = function (element, stat) {
    logger.log(logger.INFO, 'Scanner', `Scanning folder '${element.relativePath}'...`);
  };
  
  dree.scan('Z:/Music', options, fileCallback, dirCallback);
}



/* Process metadata */
function processMetadata() {
  (async () => {
    try {
      const metadata = await mm.parseFile('Z:/Music/Billie Eilish - Happier Than Ever/Billie Eilish - Everybody Dies.mp3');
      console.log(metadata.common);
    } catch (error) {
      console.error(error.message);
    }
  })();
}
//processMetadata();



app.get('/api/playFile/:id', function(req, res) {
  var id = req.params.id;

  let currentSongs = db.getData('/songs');
  let music = "Z:/Music" + currentSongs[parseInt(id)].folder + currentSongs[parseInt(id)].file;

  var stat = fs.statSync(music);
  range = req.headers.range;
  var readStream;

  if (range !== undefined) {
      var parts = range.replace(/bytes=/, "").split("-");

      var partial_start = parts[0];
      var partial_end = parts[1];

      if ((isNaN(partial_start) && partial_start.length > 1) || (isNaN(partial_end) && partial_end.length > 1)) {
          return res.sendStatus(500); //ERR_INCOMPLETE_CHUNKED_ENCODING
      }

      var start = parseInt(partial_start, 10);
      var end = partial_end ? parseInt(partial_end, 10) : stat.size - 1;
      var content_length = (end - start) + 1;

      res.status(206).header({
          'Content-Type': 'audio/mpeg',
          'Content-Length': content_length,
          'Content-Range': "bytes " + start + "-" + end + "/" + stat.size
      });

      readStream = fs.createReadStream(music, {start: start, end: end});
  } else {
      res.header({
          'Content-Type': 'audio/mpeg',
          'Content-Length': stat.size
      });
      readStream = fs.createReadStream(music);
  }
  readStream.pipe(res);
});



app.get('/api/getSong/:id', function(req, res) {
  let id = req.params.id;
  
  if(isNaN(id)) {
    res.json({
      error: "Song does not exist"
    });
    return;
  }

  try {
    let currentSong = db.getData(`/songs/${parseInt(id)}`);
    res.json(currentSong);
    return;
  } catch(e) {
    res.json({
      error: "Song does not exist"
    });
    return;
  }
});



app.get('/api/getAllSongs', function(req, res) {
  res.json(db.getData('/songs'));
});



/* Start HTTP & API server */
try {
  app.listen(config.http_api_port);
  logger.log(logger.INFO, 'API', `HTTP and API started at http://127.0.0.1:${config.http_api_port}`)
} catch(e) { }
