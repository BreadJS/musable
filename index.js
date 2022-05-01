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

let noThumbnailBuffer = Buffer.from("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9Pbt23FxcfKowPslr+JwOCTKiYmJv/32W39//87OjvW8PpycnCwtLRUUFMgLWc8CnAtCCe8kfO3t7X4+2PlEYirTZVdXV35+fuB38QkNDU1ISJBE/v33375uXf45OWBjY6O4uJjv4eD8EUp4J+NeRkaGTIu+/kvE596/fy/z4MrKytTU1PPnz6urqwsLC2/cuOF2u+Pj4yVt0dHRMjmmpaXdvHlTYldfXy9r+5s3b9bW1qTFvr6h+IlUcn5+vqKiQkLM0o3zRyjhk9PpzM7Ollbu7++rLfOQw3Z3dxcXFycnJ0dHR1+9evXy5cve3l6pZ19f3+DgoPxSYrq6unpwcKBOkR7ynNPT01VVVbGxsWf+OTsQCEIJf8LDw1NTUzs7O2X083NhY5BISeVFpbmPHj2SPd06J+DcEUooZAeXUa61tVXmRP/XDJ0tGST39vZmZmZKS0u5gTnsRSgRkLCwsAcPHki2rIwFn6zwsrm7XK6f5B+L4yIjlAhISEhIVFTUrVu3ZLSUhAX4luX3effu3dTUVFVVVWJiolSS9yVhO0KJb+B0Ot1ud3l5+YsXL3z9P7IfcXJy8ubNm+bm5oKCgvj4eBKJnwShxLeReMmUJ6NlXV1dX1/fwsLCwcHBDw6YEtzNzc3Jycmuri5Z8JOTk1m38VMhlPhO0jKZLisrKz1XRMqAubOzc3R0FOBFPxJHKezW1tbKyooksr29vaSkJDo6mikSPyFCiTPgcrnu37/f2dk5MzNzeHgoG7R0UMZMr+RPcsD6+vro6Ojjx49ly6aP+MkRSpyB0NDQyMjImJiYxMTElJQUWcxLS0sfPXok63l9fb3UsKmpSX6ora19+PBhYWFhVlbW9evX4+PjJZHf9A1xwBaEEmdMZsPw8PCoqKjY2NiEhISkpKTkf0hDpYwSU0mqhJUREgYhlACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglACgIJQAoCCUAKAglADg16VL/w+uSvJSHhPBnwAAAABJRU5ErkJggg==", 'base64');

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

/* Check database values and set them */
try { db.getData('/songs'); } catch(e) { db.push('/songs', []); }
try { db.getData('/settings/song_locations'); } catch(e) { db.push('/settings/song_locations', [ "Z:/Music" ]); }
try { db.getData('/settings/song_extensions'); } catch(e) { db.push('/settings/song_extensions', ['mp3', 'flac', 'wav', 'ogg']); }
try { db.getData('/users'); } catch(e) {
  db.push('/users', {});
  db.push('/users/admin', { id: 1, password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', rank: 'admin' });
}
let songLocations = db.getData('/settings/song_locations');
let songExtensions = db.getData('/settings/song_extensions');

/* Show database information */
logger.log(logger.INFO, 'Database', `Loaded '${db.getData('/songs').length}' song(s)`);
logger.log(logger.INFO, 'Database', `Loaded '${songLocations.length}' folder location(s)`);
logger.log(logger.INFO, 'Database', `Loaded '${songExtensions.length}' song extension(s)`);



/* Add song to databse */
function addSongToDB(songName, folderName, ignore) {
  let currentSongs = db.getData('/songs');
  currentSongs.push({ id: (currentSongs.length), file: songName, folder: folderName, ignore: ignore });
  db.push('/songs', currentSongs);
}

/* Scan music folders */
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

/* Process metadata of songs in database */
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

app.get('/api/getSongThumbnail/:id', async function(req, res) {
  var id = req.params.id;

  let currentSongs = db.getData('/songs');
  let song = currentSongs[parseInt(id)].location + currentSongs[parseInt(id)].folder + currentSongs[parseInt(id)].file;

  const metadata = await mm.parseFile(song);
  
  if("picture" in metadata.common) {
    let img = Buffer.from(metadata.common.picture[0].data.toString('base64'), 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img);
  } else {
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': noThumbnailBuffer.length
    });
    res.end(noThumbnailBuffer);
  }
});


/* Express: Play song */
app.get('/api/playFile/:id', function(req, res) {
  var id = req.params.id;

  let currentSongs = db.getData('/songs');
  let music = currentSongs[parseInt(id)].location + currentSongs[parseInt(id)].folder + currentSongs[parseInt(id)].file;

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

/* Express: Get specific song information */
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

/* Express: Get all songs information */
app.get('/api/getAllSongs', function(req, res) {
  res.json(db.getData('/songs'));
});

/* Express: Scan all locations for music */
app.get('/api/scanMusic', function(req, res) {
  musicScanner();
});

/* Express: Process all metadata of the songs */
app.get('/api/processMetadata', function(req, res) {
  processMetadata();
});



/* Start HTTP & API server */
try {
  app.listen(config.http_api_port);
  logger.log(logger.INFO, 'API', `HTTP and API started at http://127.0.0.1:${config.http_api_port}`)
} catch(e) { }
