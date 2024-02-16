package main

import (
	_ "embed"
	"fmt"
	"net"
	"net/http"
	"os/exec"
)

//go:embed index.html
var indexDotHtml []byte

func handlerFunc(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-Type", "text/html; charset=utf-8")
	fmt.Fprint(w, string(indexDotHtml))
}

func main() {
	fmt.Println(`
 _____ _ _   _        ____                 _   
/__   (_) |_| | ___  /___ \_   _  ___  ___| |_ 
  / /\/ | __| |/ _ \//  / / | | |/ _ \/ __| __|
 / /  | | |_| |  __/ \_/ /| |_| |  __/\__ \ |_ 
 \/   |_|\__|_|\___\___,_\ \__,_|\___||___/\__|

Ctrl+C or close this window to exit...`)

	l, err := net.Listen("tcp", "localhost:8080")
	if err != nil {
		panic(err)
	}

	s := &http.Server{
		Handler: http.HandlerFunc(handlerFunc),
	}

	go s.Serve(l)

	err = exec.Command("rundll32", "url.dll,FileProtocolHandler", "http://localhost:8080").Start()
	if err != nil {
		panic(err)
	}

	select {}
}
