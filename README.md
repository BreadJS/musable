# Musable
Musable is a music server to stream your own music files across all different kind of devices. It's using the [Audio](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement/Audio) (HTMLAudioElement) element so it has support for lots of devices. I got inspired to make this project because I wanted to listen to my music from my phone outside of the house.

## Usage
```
npm i
npm run start
```

## File support
Currently it has support for the following file types:
```
mp3, flac, wav, ogg
```

## Default user information
When the users object inside `database.json` is not created. It will automaticly create one for you including an `admin` user. You can remove this or use it. You can login with the following information.
```
Username: admin
Password: admin
```
