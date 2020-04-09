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
    sockets.push (socket.id);
    console.log("player connects");
    console.log(sockets);

    io.emit('serverSendsSockets', sockets, socket.id );


    socket.on( 'clientSendet', data => {
        io.emit('nachricht', data, socket.id );
    })
    
    socket.on( 'cliendSendsPlayer1', data => {
        io.emit('serverSendsPlayer1', data, socket.id );
    })

    socket.on( 'cliendSendsPlayer2', data => {
        io.emit('serverSendsPlayer2', data, socket.id );
    })

    socket.on( 'cliendSendsChar', data => {
        io.emit('serverSendsChar', data, socket.id );
    })

    socket.on( 'cliendSendsInit', data => {
        io.emit('serverSendsInit', data, socket.id );
    })
    
    socket.on('disconnect',() =>{
        
        sockets = sockets.filter ( el => el != socket.id );
        console.log("socket disconnects");
        console.log ( sockets );
        io.emit('serverSendsSockets', sockets, socket.id );
    })

})

// Terminal aktivieren
let stdIn = process.openStdin();
stdIn.addListener('data', eingabe => io.emit( 'nachricht', eingabe.toString() ))

httpServer.listen( PORT, err => console.log( err || 'Server läuft' ));
///////////////////////////////////