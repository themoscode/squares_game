'use strict';

const express = require ( 'express' );
const fs = require ( 'fs' );
const url = require ( 'url' );
const bodyParser = require ( 'body-parser');

let PORT = process.env.PORT || 80;

let app = express();

app.use ( express.static('public', {
extensions: ['html', 'htm'],
}));

app.use ( bodyParser.json() );




//SOCKETS

// HTTP
const http = require ('http');
let httpServer = http.Server( app );

// Websocket
const socketIo = require ( 'socket.io');
let io = socketIo( httpServer );

// Variablen
let sockets = [];


io.on ( 'connect', socket => {
    
    console.log( "socket.id="+socket.id );
    sockets.push (socket);
    console.log ( "sockets[0].id="+sockets[0].id );
    console.log("-------------------------------");

    socket.on( 'clientSendet', data => {
        io.emit('nachricht', data, socket.id );
    })


    socket.on( 'clientSendsLetter', data => {
        io.emit('ServerSendsLetter', data, socket.id );
        //console.log(data);
    })
    socket.on( 'clientSendsWord', data => {
        io.emit('ServerSendsWord', data, socket.id );
        //console.log(data);
    })
    
    socket.on( 'clientSendsInit', data => {
        io.emit('ServerSendsInit', data, socket.id );
        //console.log(data);
    })
    
    socket.on('disconnect',() =>{
        sockets = sockets.filter ( el => el.id != socket.id );
        //console.log ( sockets.length );
    })

})

// Terminal aktivieren
let stdIn = process.openStdin();
stdIn.addListener('data', eingabe => io.emit( 'nachricht', eingabe.toString() ))

httpServer.listen( PORT, err => console.log( err || 'Server läuft' ));
///////////////////////////////////