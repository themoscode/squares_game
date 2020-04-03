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

    socket.on( 'clientSendsLetter', data => {
        io.emit('ServerSendsLetter', data, socket.id );
        //console.log(data);
    })
    socket.on( 'clientSendsWord', data => {
        io.emit('ServerSendsWord', data, socket.id );
        //console.log(data);
    })
    socket.on( 'clientSendsRestart', data => {
        io.emit('ServerSendsRestart', data, socket.id );
        //console.log(data);
    })
    socket.on( 'clientSendsInit', data => {
        io.emit('ServerSendsInit', data, socket.id );
        //console.log(data);
    })
    socket.on( 'clientSendsStats', data => {
        io.emit('ServerSendsStats', data, socket.id );
        //console.log(data);
    })
    socket.on( 'clientSendsGraphStats', data => {
        io.emit('ServerSendsGraphStats', data, socket.id );
        //console.log(data);
    })

    socket.on('disconnect',() =>{
        sockets = sockets.filter ( el => el.id != socket.id );
        //console.log ( sockets.length );
    })

})

// Terminal aktivieren
//let stdIn = process.openStdin();
//stdIn.addListener('data', eingabe => io.emit( 'nachricht', eingabe.toString() ))


////////////nano/////////////

const nano = require('nano')( 'http://admin:le211072le@localhost:5984' );


let dbName = 'words';
let db;


app.get ( '/words', (req, res) => {
    let parameter = url.parse ( req.url, true ).query;
    
    nano.db.list()
    .then(
        antwort => nano.use( dbName )
    ).then(
        db => db.list({include_docs: true})
    ).then(
        liste => {res.send(JSON.stringify(liste.rows.map(row=>row.doc.word)));
      //liste => {res.send(JSON.stringify(liste.rows.map(row=>row.doc)));    
        console.log(liste);
        }
    ).catch(
        console.log
    )

   
})

app.get ( '/stats', (req, res) => {
    let parameter = url.parse ( req.url, true ).query;
    
    nano.db.list()
    .then(
        antwort => nano.use( dbName )
    ).then(
        db => db.list({include_docs: true})
    ).then(
        liste => {res.send(JSON.stringify(liste.rows.map(row=>row.doc)));    
        console.log(liste);
        }
    ).catch(
        console.log
    )

   
})

app.get ( '/statsUpdate', (req, res) => {
    let parameter = url.parse ( req.url, true ).query;
    
    
    console.log(req.query.word);
    console.log(req.query.found);
    console.log(req.query.socketID);
    
    let word = req.query.word;
    let found = req.query.found;
    let socketID = req.query.socketID;

    if (socketID == sockets[0].id) {

        console.log(socketID+"----UPDATE---"+sockets[0].id);


        nano.db.list()
        .then(
            antwort => {
                db = nano.use(dbName);
                return true;
            }
        ).then(
        () => db.find({
            selector:{
                word: word
            },
            fields: ['_id', '_rev','played','found']
        })
        ).then(

            // Daten in DB schreiben
            res  => db.insert({
                _id: res.docs[0]._id,
                _rev: res.docs[0]._rev,
                word: word,
                //played: sockets.length-(sockets.length-1)+res.docs[0].played,
                //found: (found === "true") ? sockets.length-(sockets.length-1)+res.docs[0].found : res.docs[0].found
                played: res.docs[0].played+1,
                found: (found === "true") ? res.docs[0].found+1 : res.docs[0].found
            })
            ).then(
                res.send("stats updated")
            ).catch(
                err=>res.send(err)
            )

    }

    console.log("-----------------------------------");
   
})


httpServer.listen( PORT, err => console.log( err || 'Server läuft' ));
///////////////////////////////////