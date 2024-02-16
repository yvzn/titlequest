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
2. plus a utility script to aggregate / share the results

_TitleQuest_ is just a plain HTML file that you can open in any browser.

Take note that some features are not available in some browsers, unless the HTML is served by a webserver. Alternatively a Go script is provided, to self-serve the HTML file at http://localhost:8080 and then open the default browser window.

## How to run 

Double click the `index.html` file.

Alternatively, run the Go server, if self-serving the HTML is required:

```
$ go run .
```

## How to build

Only the Go server needs a build step.

```
$ go build -ldflags="-s -w"

$ .\titlequest.go.exe
```