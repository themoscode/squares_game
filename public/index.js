        'use strict'
        /*
        function one(callback) {
  return new Promise(function(resolve, reject) {
    
      console.log("first function executed");
      resolve();
    
  })
}

function two(callback) {

	return new Promise(function(resolve, reject) {
    
      setTimeout(function() {
      console.log("second function executed");
      resolve();
    }, 5000);
    
  })
  
}


function three() {

	setTimeout(function() {
      console.log("third function executed");
      
    }, 5000);
  
}

one().then(two).then(three)
        */ 
       
        document.addEventListener('DOMContentLoaded', () => {

            //variables
            console.clear(); 
            
            let eintraege = new Map();
            let socket = io.connect();
            let clientSocketID = null;
            let cells = document.querySelectorAll("#sosTable td");
            let gameTable = document.querySelector("#gameTable");
            let playContainer = document.querySelector("#playContainer");
            let msgGameOccupied = document.querySelector("#msgGameOccupied");
            let msgWaitForPlayer = document.querySelector("#msgWaitForPlayer");
            let msgResult = document.querySelector("#msgResult");
            let player1Dom = document.querySelector("#player1Dom");
            let player2Dom = document.querySelector("#player2Dom");
            let player1Score = document.querySelector("#player1Score");
            let player2Score = document.querySelector("#player2Score");
            let playerID = document.querySelector("#playerID > span"); 
            let btnRestart = document.querySelector("#btnRestart"); 
            let playerBlue = document.querySelector("#playerBlue"); 
            let playerRed = document.querySelector("#playerRed"); 

            let players = [];
            let player = {};
            //SOCKETS

            socket.on('connect', function() {
                //const sessionID = socket.socket.sessionid; //
                
                clientSocketID = socket.id;
                
              });

            const sendeNachricht = () => {
                socket.emit ( 'clientSendet', {
                    text: inputText.value,
                    name: inputName.value
                })
                inputText.value="";
                
            }

            const cliendSendsPlayer1 = () =>{
                socket.emit ( 'cliendSendsPlayer1', {
                    text: "cliendSendsPlayer1",
                })
            }

            const cliendSendsPlayer2 = () =>{
                socket.emit ( 'cliendSendsPlayer2', {
                    text: "cliendSendsPlayer2",
                })
            }

            const init = () => {
                socket.emit ( 'cliendSendsInit', {
                    text: "init",
                })
              
            }

           
            socket.on ( 'serverSendsInit', (data, serverSocketID) => {    
                location.reload(); 
            });
           
            socket.on ( 'serverSendsPlayer1', (data, serverSocketID) => {    
                

                if (player.id == players[1].id) {
                    disablePlay();
                } 
                else if (player.id == players[0].id) {
                    enablePlay();
                }

                setTimeout(function(){
                    playerRed.innerHTML="Red plays";
                    playerBlue.innerHTML="Blue";
                    blink(player1Dom,"red");
                    
                },1000);
                
              });

              socket.on ( 'serverSendsPlayer2', (data, serverSocketID) => {    
                

                if (player.id == players[1].id) {
                    enablePlay();
                } 
                else if (player.id == players[0].id) {
                    disablePlay();
                }
                
                setTimeout(function(){
                    playerRed.innerHTML="Red";
                    playerBlue.innerHTML="Blue plays";
                    blink(player2Dom,"blue");
                    
                },1000);

              });

            socket.on ( 'serverSendsSockets', (sockets, serverSocketID) => {
                console.log(sockets.length,sockets); 
                if (sockets.length < 2) {
                    //console.log("Nur 2 spieler können spielen");
                    displayBlock(msgWaitForPlayer);
                    displayNone(playContainer);
                }
                else if (sockets.length > 2 && clientSocketID == serverSocketID) {  
                    displayBlock(msgGameOccupied);
                    displayNone(playContainer);
                }
                else if (sockets.length == 2 ) {
                    displayNone(msgWaitForPlayer);
                    displayNone(msgGameOccupied);
                    displayBlock(playContainer);

                    players = [
                        {
                            name:"Player1",
                            id:sockets[0],
                            score:0,
                            onBGColor:"red"
                        },
                        {
                            name:"Player2",
                            id:sockets[1],
                            score:0,
                            onBGColor:"blue"
                        }
                    ];
                    console.log("clientSocketID",clientSocketID);
                    console.log("players",players);

                    if (clientSocketID == sockets[0] ) {
                        player=players[0];
                        console.log("du bist",player);
                        playerID.className="player1";
                        playerID.innerHTML="You are Red";
                        blink(playerID,"red","white","#6D98E6","#6D98E6");
                        cliendSendsPlayer1();

                    } else if (clientSocketID == sockets[1] ) {
                        player=players[1];
                        console.log("du bist",player);
                        playerID.className="player2";
                        playerID.innerHTML="You are Blue";
                        blink(playerID,"blue","white","#6D98E6","#6D98E6");
                        //disablePlay();
                    }
                }
            })
            
           
            // Socket-Events
            socket.on ( 'nachricht', (data, socketID) => {
                console.log( socketID );
                
                let nachricht = DOMElementAnlegen({
                    eltern:ausgabe
                });
                DOMElementAnlegen({
                    inhalt: data.name,
                    typ: 'span',
                    klassen:['name'],
                    eltern: nachricht
                });
                DOMElementAnlegen({
                    inhalt: data.text,
                    typ: 'span',
                    klassen:['text'],
                    eltern: nachricht
                })
                
               // setInterval(updateScroll,1000);
                updateScroll();

                eintraege.set ( nachricht, {
                    name: data.name,
                    text: data.text,
                    socketID
                })
            })
            
            //sockets end
            

            let disablePlay = () => {
                for (const elm of cells) {
                    elm.removeAttribute("contenteditable");
                    elm.style.cursor="default";
                  }
                    
            }

            let enablePlay = () => {
                for (const elm of cells) {
                    console.log("elm.innerHTML",elm.innerHTML);
                    if (elm.innerHTML != "S" && elm.innerHTML != "O"){
                        elm.setAttribute("contenteditable",true);
                        elm.style.cursor="pointer";
                    } else {
                        elm.removeAttribute("contenteditable");
                        elm.style.cursor="default";
                    }

                    
                  }
                    
            }

            let matrixInfo = (elm) => {

                console.log("elm",elm);
                let spl=elm.id.split("_");
                let y=Number(spl[1]);
                let x=Number(spl[2]);

                let matrix = {
                    
                    upElm:false,
                    upElm2:false,
                    downElm:false,
                    downElm2:false,
                    leftElm:false,
                    leftElm2:false,
                    rightElm:false,
                    rightElm2:false,
                    upLeftElm:false,
                    upLeftElm2:false,
                    upRightElm:false,
                    upRightElm2:false,
                    downLeftElm:false,
                    downLeftElm2:false,
                    downRightElm:false,
                    downRightElm2:false,
                    
                }

                let upElm = {}
                upElm.x = x;
                upElm.y = y-1;
                upElm.id = "#c_"+upElm.y+"_"+upElm.x;
                upElm.domObj = document.querySelector(upElm.id);

                if (upElm.domObj) {
                    upElm.html=upElm.domObj.innerHTML;
                    matrix.upElm = upElm.domObj;
                }
                //
                let upElm2 = {}
                upElm2.x = x;
                upElm2.y = y-2;
                upElm2.id = "#c_"+upElm2.y+"_"+upElm2.x;
                upElm2.domObj = document.querySelector(upElm2.id);

                if (upElm2.domObj) {
                    upElm2.html=upElm2.domObj.innerHTML;
                    matrix.upElm2 = upElm2.domObj;
                }
                //
                let downElm = {}
                downElm.x = x;
                downElm.y = y+1;
                downElm.id = "#c_"+downElm.y+"_"+downElm.x;
                downElm.domObj = document.querySelector(downElm.id);

                console.log("downElm.id",downElm.id);

                if (downElm.domObj) {
                    downElm.html=downElm.domObj.innerHTML;
                    matrix.downElm = downElm.domObj;
                }
                //
                let downElm2 = {}
                downElm2.x = x;
                downElm2.y = y+2;
                downElm2.id = "#c_"+downElm2.y+"_"+downElm2.x;
                downElm2.domObj = document.querySelector(downElm2.id);

                if (downElm2.domObj) {
                    downElm2.html=downElm2.domObj.innerHTML;
                    matrix.downElm2 = downElm2.domObj;
                }
                //
                let leftElm = {}
                leftElm.x = x-1;
                leftElm.y = y;
                leftElm.id = "#c_"+leftElm.y+"_"+leftElm.x;
                leftElm.domObj = document.querySelector(leftElm.id);

                if (leftElm.domObj) {
                    leftElm.html=leftElm.domObj.innerHTML;
                    matrix.leftElm = leftElm.domObj;
                }
                //
                let leftElm2 = {}
                leftElm2.x = x-2;
                leftElm2.y = y;
                leftElm2.id = "#c_"+leftElm2.y+"_"+leftElm2.x;
                leftElm2.domObj = document.querySelector(leftElm2.id);

                if (leftElm2.domObj) {
                    leftElm2.html=leftElm2.domObj.innerHTML;
                    matrix.leftElm2 = leftElm2.domObj;
                }
                //
                let rightElm = {}
                rightElm.x = x+1;
                rightElm.y = y;
                rightElm.id = "#c_"+rightElm.y+"_"+rightElm.x;
                rightElm.domObj = document.querySelector(rightElm.id);

                if (rightElm.domObj) {
                    rightElm.html=rightElm.domObj.innerHTML;
                    matrix.rightElm = rightElm.domObj;
                }
               //
               let rightElm2 = {}
               rightElm2.x = x+2;
               rightElm2.y = y;
               rightElm2.id = "#c_"+rightElm2.y+"_"+rightElm2.x;
               rightElm2.domObj = document.querySelector(rightElm2.id);

               if (rightElm2.domObj) {
                   rightElm2.html=rightElm2.domObj.innerHTML;
                   matrix.rightElm2 = rightElm2.domObj;
               }
               //
               let upLeftElm = {}
               upLeftElm.x = x-1;
               upLeftElm.y = y-1;
               upLeftElm.id = "#c_"+upLeftElm.y+"_"+upLeftElm.x;
               upLeftElm.domObj = document.querySelector(upLeftElm.id);

               if (upLeftElm.domObj) {
                   upLeftElm.html=upLeftElm.domObj.innerHTML;
                   matrix.upLeftElm = upLeftElm.domObj;
               }
               //
               let upLeftElm2 = {}
               upLeftElm2.x = x-2;
               upLeftElm2.y = y-2;
               upLeftElm2.id = "#c_"+upLeftElm2.y+"_"+upLeftElm2.x;
               upLeftElm2.domObj = document.querySelector(upLeftElm2.id);

               if (upLeftElm2.domObj) {
                   upLeftElm2.html=upLeftElm2.domObj.innerHTML;
                   matrix.upLeftElm2 = upLeftElm2.domObj;
               }
               //
               //
               let upRightElm = {}
               upRightElm.x = x+1;
               upRightElm.y = y-1;
               upRightElm.id = "#c_"+upRightElm.y+"_"+upRightElm.x;
               upRightElm.domObj = document.querySelector(upRightElm.id);

               if (upRightElm.domObj) {
                   upRightElm.html=upRightElm.domObj.innerHTML;
                   matrix.upRightElm = upRightElm.domObj;
               }
               //
               //
               let upRightElm2 = {}
               upRightElm2.x = x+2;
               upRightElm2.y = y-2;
               upRightElm2.id = "#c_"+upRightElm2.y+"_"+upRightElm2.x;
               upRightElm2.domObj = document.querySelector(upRightElm2.id);

               if (upRightElm2.domObj) {
                   upRightElm2.html=upRightElm2.domObj.innerHTML;
                   matrix.upRightElm2 = upRightElm2.domObj;
               }
               //
               //
               let downLeftElm = {}
               downLeftElm.x = x-1;
               downLeftElm.y = y+1;
               downLeftElm.id = "#c_"+downLeftElm.y+"_"+downLeftElm.x;
               downLeftElm.domObj = document.querySelector(downLeftElm.id);

               if (downLeftElm.domObj) {
                   downLeftElm.html=downLeftElm.domObj.innerHTML;
                   matrix.downLeftElm = downLeftElm.domObj;
               }
               //downRightElm
               let downLeftElm2 = {}
               downLeftElm2.x = x-2;
               downLeftElm2.y = y+2;
               downLeftElm2.id = "#c_"+downLeftElm2.y+"_"+downLeftElm2.x;
               downLeftElm2.domObj = document.querySelector(downLeftElm2.id);

               if (downLeftElm2.domObj) {
                   downLeftElm2.html=downLeftElm2.domObj.innerHTML;
                   matrix.downLeftElm2 = downLeftElm2.domObj;
               }
               //downRightElm
               let downRightElm = {}
               downRightElm.x = x+1;
               downRightElm.y = y+1;
               downRightElm.id = "#c_"+downRightElm.y+"_"+downRightElm.x;
               downRightElm.domObj = document.querySelector(downRightElm.id);

               if (downRightElm.domObj) {
                   downRightElm.html=downRightElm.domObj.innerHTML;
                   matrix.downRightElm = downRightElm.domObj;
               }
               //downRightElm2
               let downRightElm2 = {}
               downRightElm2.x = x+2;
               downRightElm2.y = y+2;
               downRightElm2.id = "#c_"+downRightElm2.y+"_"+downRightElm2.x;
               downRightElm2.domObj = document.querySelector(downRightElm2.id);

               if (downRightElm2.domObj) {
                   downRightElm2.html=downRightElm2.domObj.innerHTML;
                   matrix.downRightElm2 = downRightElm2.domObj;
               }

                return matrix;

            }
            //event listeners
            
            for (const elm of cells){
                elm.addEventListener('input', function(event) {  
                    socket.emit ( 'cliendSendsChar', {
                        elmID: "#"+elm.id,
                        char:elm.innerHTML,
                        player:player
                    })
                })
            }

            socket.on ( 'serverSendsChar', (data, serverSocketID) => {    
                
                    console.log("serverSendsChar",data);
                    let elm = document.querySelector(data.elmID);
                    elm.innerHTML = data.char;
                    let str = elm.innerHTML.toUpperCase();
                    str = str.replace("<br>","");
                    str = str.replace("<BR>","");
                    elm.innerHTML=str;
                    console.log(elm.innerHTML);
                    if (elm.innerHTML!="S" && elm.innerHTML!="O" ) {
                       elm.innerHTML="<br>"
                    }
                    else if (elm.innerHTML!="S" || elm.innerHTML!="O" ){
                       elm.removeAttribute("contenteditable"); 
                       elm.style.cursor="default";


                       let foundSOS = 0;
                       let matrix = matrixInfo(elm);
                      // console.log(matrix);

                       if (elm.innerHTML=="O"){
                           if (matrix.leftElm.innerHTML == "S" && matrix.rightElm.innerHTML=="S"){
                               foundSOS++;
                              
                               blinkSOS(matrix.leftElm,elm,matrix.rightElm,data.player);
                           }
                           if (matrix.downElm.innerHTML == "S" && matrix.upElm.innerHTML=="S"){
                               foundSOS++;
                               
                               blinkSOS(matrix.downElm,elm,matrix.upElm,data.player);
                           }
                           if (matrix.upLeftElm.innerHTML == "S" && matrix.downRightElm.innerHTML=="S"){
                               foundSOS++;
                               blinkSOS(matrix.upLeftElm,elm,matrix.downRightElm,data.player);
                           }
                           if (matrix.upRightElm.innerHTML == "S" && matrix.downLeftElm.innerHTML=="S"){
                               foundSOS++;
                               
                               blinkSOS(matrix.upRightElm,elm,matrix.downLeftElm,data.player);
                           }
                           if (foundSOS == 0) {
                               if (data.player.id == players[0].id) {
                                cliendSendsPlayer2();
                               }
                               else {
                                cliendSendsPlayer1();
                               }
                           }
                       }
                       
                       else if (elm.innerHTML=="S"){
                           if (matrix.leftElm.innerHTML == "O" && matrix.leftElm2.innerHTML=="S"){
                               foundSOS++;
                               blinkSOS(matrix.leftElm,elm,matrix.leftElm2,data.player);
                           }
                           if (matrix.rightElm.innerHTML == "O" && matrix.rightElm2.innerHTML=="S"){
                               foundSOS++;
                               blinkSOS(matrix.rightElm,elm,matrix.rightElm2,data.player);
                           }
                           if (matrix.upElm.innerHTML == "O" && matrix.upElm2.innerHTML=="S"){
                               foundSOS++;
                               blinkSOS(matrix.upElm,elm,matrix.upElm2,data.player);
                           }
                           if (matrix.downElm.innerHTML == "O" && matrix.downElm2.innerHTML=="S"){
                               foundSOS++;
                               blinkSOS(matrix.downElm,elm,matrix.downElm2,data.player);
                           }
                           if (matrix.upLeftElm.innerHTML == "O" && matrix.upLeftElm2.innerHTML=="S"){
                               foundSOS++;
                               blinkSOS(matrix.upLeftElm,elm,matrix.upLeftElm2,data.player);
                           }
                           if (matrix.upRightElm.innerHTML == "O" && matrix.upRightElm2.innerHTML=="S"){
                               foundSOS++;
                               blinkSOS(matrix.upRightElm,elm,matrix.upRightElm2,data.player);
                           }
                           if (matrix.downRightElm.innerHTML == "O" && matrix.downRightElm2.innerHTML=="S"){
                               foundSOS++;
                               blinkSOS(matrix.downRightElm,elm,matrix.downRightElm2,data.player);
                           }
                           if (matrix.downLeftElm.innerHTML == "O" && matrix.downLeftElm2.innerHTML=="S"){
                               foundSOS++;
                               blinkSOS(matrix.downLeftElm,elm,matrix.downLeftElm2,data.player);

                            } 
                            if (foundSOS == 0) { 

                                if (data.player.id == players[0].id) {
                                cliendSendsPlayer2();
                                }
                                else {
                                cliendSendsPlayer1();
                                }
                            }
                       }
                       
                    }
                    
                   // console.log("checkGameFinished",checkGameFinished());
                    if ( checkGameFinished() == true   ) {

                        console.log (players);

                        if (players[0].score > players[1].score) {
                            msgResult.innerHTML="The red player won the game";
                            msgResult.className="player1";
                            displayBlock(msgResult);
                            blink(msgResult,"red");
                        }
                        else if (players[0].score < players[1].score) {
                            msgResult.innerHTML="The blue player won the game";
                            msgResult.className="player2";
                            displayBlock(msgResult);
                            blink(msgResult,"blue");
                        }
                        else {
                            msgResult.innerHTML="Nobody won the game";
                            displayBlock(msgResult);
                            blink(msgResult,"purple");
                        }

                        
                        
                        //displayNone(playContainer);
                    }
                
              });


            const checkGameFinished = () => {

                let result=true;
                for (const elm of cells){
                    if (elm.innerHTML != "S" && elm.innerHTML != "O"){
                        result=false;
                    }
                }

                return result;
            }


            inputText.addEventListener('change', sendeNachricht );
            btnRestart.addEventListener('click', init );
           
            //event listeners end

            const displayNone = (el) =>{
                el.style.display='none';
            }

            const displayBlock = (el) =>{
                el.style.display='block';
            }

            let updateScroll = ()=>{
                
                ausgabe.scrollTop = ausgabe.scrollHeight;
            }

            //functions

            let blink = (elm,onBGColor="blue",onFontColor="white",offBGColor="white",offFontColor="black") => {
                let on=()=>{
                    elm.style.background = onBGColor;
                    elm.style.color=onFontColor;
                }
                let off=()=>{
                    elm.style.background = offBGColor;
                    elm.style.color = offFontColor;
                }

                setTimeout(function() {
                  off();
                }, 500);
                setTimeout(function() {
                    on();
                }, 700);
                setTimeout(function() {
                    off();
                }, 900);
                setTimeout(function() {
                    on();
                }, 1100);
                setTimeout(function() {
                    off();
                }, 1300);
                setTimeout(function() {
                    on();
                }, 1500);
                setTimeout(function() {
                    off();
                }, 1700);
                setTimeout(function() {
                    on();
                }, 1900);
            }

            let twoDigits = (str) =>{
                if (str.length == 1) {
                    str="0"+str;
                }
                return str;
            }

            let blinkSOS = (elm1,elm2,elm3,thePlayer) => {
                
                console.log("thePlayer",thePlayer);

                if (thePlayer.id == players[0].id){ //player1
                    console.log("players[0].score",players[0].score);
                    players[0].score++;
                    player1Score.innerHTML=players[0].score;
                    player1Score.innerHTML=twoDigits(player1Score.innerHTML);
                }
                else if (thePlayer.id == players[1].id){ //player 2
                    console.log("players[1].score",players[1].score);
                    players[1].score++;
                    player2Score.innerHTML=players[1].score;
                    player2Score.innerHTML=twoDigits(player2Score.innerHTML);
                }

                console.log("players",players);
                

                let on=()=>{
                    elm1.style.background = thePlayer.onBGColor;
                    elm2.style.background = thePlayer.onBGColor;
                    elm3.style.background = thePlayer.onBGColor;
                    elm1.style.color ="white";
                    elm2.style.color ="white";
                    elm3.style.color ="white";
                }
                let off=()=>{
                    elm1.style.background="white";
                    elm2.style.background="white";
                    elm3.style.background="white";  
                    elm1.style.color ="black";
                    elm2.style.color ="black";
                    elm3.style.color ="black";
                }

                setTimeout(function() {
                  off();
                }, 500);
                setTimeout(function() {
                    on();
                }, 700);
                setTimeout(function() {
                    off();
                }, 900);
                setTimeout(function() {
                    on();
                }, 1100);
                setTimeout(function() {
                    off();
                }, 1300);
                setTimeout(function() {
                    on();
                }, 1500);
                setTimeout(function() {
                    off();
                }, 1700);
                setTimeout(function() {
                    on();
                }, 1900);
            }

            let DOMElementAnlegen = ({
                inhalt=false,
                klassen=[],
                eltern=document.body,
                typ='div'
            }={}) => {
                let neu = document.createElement(typ);
                if ( inhalt ) neu.innerHTML = inhalt;
                if ( klassen.length ) neu.className = klassen.join(' ');
                eltern.appendChild ( neu );
                return neu;
            }
   
});

    
