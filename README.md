```
 _____ _ _   _        ____                 _   
/__   (_) |_| | ___  /___ \_   _  ___  ___| |_ 
  / /\/ | __| |/ _ \//  / / | | |/ _ \/ __| __|
 / /  | | |_| |  __/ \_/ /| |_| |  __/\__ \ |_ 
 \/   |_|\__|_|\___\___,_\ \__,_|\___||___/\__|

```

_TitleQuest_ is:

1. A set of bookmarks to selected title-guessing games (
[🎥 Framed](https://framed.wtf/)
– [🎮 GuessThe.game](https://guessthe.game/)
– [🔊 Guess The Audio](https://guesstheaudio.com/)
– [Episode](https://episode.wtf/)
)
2. plus some Javascript to aggregate / share the results

_TitleQuest_ is just a plain HTML file that you can open in any browser.

Take note that some features are not available in some browsers, unless the HTML is served by a webserver. To solve this issue, a Go app can self-serve the HTML file at http://localhost:8080.

## How to run 

Double click the `index.html` file.

To run the Go app / server (if required):

```
$ go run .
```

## How to build

Only the Go app / server needs a build step.

```
$ go build -ldflags="-s -w"

$ .\titlequest.go.exe
```
