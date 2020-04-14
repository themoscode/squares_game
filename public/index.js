        'use strict'
       
       
        $(document).ready(function(){

            //variables
            console.clear(); 
            
            let eintraege = new Map();
            let socket = io.connect();
            let clientSocketID = null;
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
            let boxSound = document.querySelector("#boxSound");
            let matrix = null;
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
                    playerRed.innerHTML="*Red";
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
                    playerBlue.innerHTML="*Blue";
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
                    window.location.href = 'busy.html';
                }
                else if (sockets.length == 2 ) {
                    displayNone(msgWaitForPlayer);
                    displayNone(msgGameOccupied);
                    displayBlock(playContainer);

                    players = [
                        {
                            name:"A",
                            id:sockets[0],
                            score:0,
                            onBGColor:"red"
                        },
                        {
                            name:"B",
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
                
                $('.btn_td').popover('destroy');
                $('.btn_td').css('cursor','default');
                    
            }
            
            let enablePlay = () => {
                $('.btn_td').popover({trigger: "focus", 
                content: "<div><span class='cell upleft'>L</span><span class='cell upright'>R</span></div><div><span class='cell downleft'>U</span><span class='cell downright'>D</span></div>", 
                html: true, 
                placement: "right"
                });
                $('.btn_td').css('cursor','pointer');    
            }

            let matrixInfo = (elm) => {

                elm = elm[0];

                console.log("elm",elm);
                let spl=elm.id.split("_");
                let y=Number(spl[1]);
                let x=Number(spl[2]);

                let matrix = {
                    
                    upElm:false,
                   
                    downElm:false,
                   
                    leftElm:false,
                   
                    rightElm:false,
                   
                   
                    
                }

                let upElm = {}
                upElm.x = x;
                upElm.y = y-1;
                upElm.id = "#c_"+upElm.y+"_"+upElm.x;
                upElm.domObj = document.querySelector(upElm.id);

                if (upElm.domObj) {
                    upElm.html=upElm.domObj.innerHTML;
                    matrix.upElm = upElm.id;
                }
                //
                
                //
                let downElm = {}
                downElm.x = x;
                downElm.y = y+1;
                downElm.id = "#c_"+downElm.y+"_"+downElm.x;
                downElm.domObj = document.querySelector(downElm.id);

                console.log("downElm.id",downElm.id);

                if (downElm.domObj) {
                    downElm.html=downElm.domObj.innerHTML;
                    matrix.downElm = downElm.id;
                }
                //
                
                //
                let leftElm = {}
                leftElm.x = x-1;
                leftElm.y = y;
                leftElm.id = "#c_"+leftElm.y+"_"+leftElm.x;
                leftElm.domObj = document.querySelector(leftElm.id);

                if (leftElm.domObj) {
                    leftElm.html=leftElm.domObj.innerHTML;
                    matrix.leftElm = leftElm.id;
                }
                //
               
                //
                let rightElm = {}
                rightElm.x = x+1;
                rightElm.y = y;
                rightElm.id = "#c_"+rightElm.y+"_"+rightElm.x;
                rightElm.domObj = document.querySelector(rightElm.id);

                if (rightElm.domObj) {
                    rightElm.html=rightElm.domObj.innerHTML;
                    matrix.rightElm = rightElm.id;
                }
               
              
                return matrix;

            }
            //event listeners
            
           


            
            btnRestart.addEventListener('click', init );
           
            //event listeners end

            const displayNone = (el) =>{
                el.style.display='none';
            }

            const displayBlock = (el) =>{
                el.style.display='block';
            }

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

            let updateScroll = ()=>{
                
                ausgabe.scrollTop = ausgabe.scrollHeight;
            }

            //functions

           

            let twoDigits = (str) =>{
                if (str.length == 1) {
                    str="0"+str;
                }
                return str;
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

            ///
            let tdclicked = null;
              
              let checkGameFinished = () => {

                let result=true;

                $( ".btn_td" ).each(function( index ) {
                    if ($(this).html()=="") {
                        
                        result = false;    
                        
                    }
                });

                return result;
              }

              let checkReadyBlock = (thePlayer) =>{

                let foundBlock=0;

                $( ".btn_td" ).each(function( index ) {
                    if ($(this).css('border-left-style')=="solid" && $(this).css('border-right-style')=="solid" && $(this).css('border-top-style')=="solid" && $(this).css('border-bottom-style')=="solid"  && $(this).html() == "" ) {

                            foundBlock ++
                            boxSound.play();
                            $(this).popover('destroy');
                            $(this).css('background-color',thePlayer.onBGColor);
                            $(this).css('cursor','default');
                            $(this).html(thePlayer.name);
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
                        
                        }
                });

                if (foundBlock == 0) { 
                    console.log("foundBlock",foundBlock);
                    if (thePlayer.id == players[0].id) {
                    cliendSendsPlayer2();
                    }
                    else {
                    cliendSendsPlayer1();
                    }
                }

              } 

              $('.btn_td').popover({trigger: "focus", 
              content: "<div><span class='cell upleft'>L</span><span class='cell upright'>R</span></div><div><span class='cell downleft'>U</span><span class='cell downright'>D</span></div>", 
              html: true, 
              placement: "right"
              }); 
              
              socket.on ( 'serverSendsMove', (result, serverSocketID) => {
                
                //data.tdclickedID=$("#"+data.tdclickedID);

               // let elm = data.tdclickedID;

                let _cell = result.data.cell;
                let _tdclicked = $("#"+result.data.tdclickedID);
                let _matrix = result.data.matrix;
                let _player = result.data.player;

                console.log("player",_player);

               // console.log("data",data.data);
               // console.log("data.cell",data.data.cell);

                if (_cell == '.upleft'){
                    _tdclicked.css("border-left","2px solid black");
                    $(_matrix.leftElm).css('border-right','2px solid black');
                    checkReadyBlock(_player);
                }
                else if (_cell == '.upright'){
                     _tdclicked.css('border-right','2px solid black');
                     $(_matrix.rightElm).css('border-left','2px solid black');
                     checkReadyBlock(_player);
                }
                else if (_cell == '.downleft'){
                    _tdclicked.css("border-top","2px solid black");
                    $(_matrix.upElm).css('border-bottom','2px solid black');
                    checkReadyBlock(_player);
               }
               else if (_cell == '.downright'){
                    _tdclicked.css("border-bottom","2px solid black");
                    $(_matrix.downElm).css('border-top','2px solid black');
                    checkReadyBlock(_player);
                }
                
                let gameFinished = checkGameFinished();

                console.log("gameFinished",gameFinished);

                if ( gameFinished == true   ) {
                    
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
                
              })


              $(document).on("click", ".upleft", function() {
                
                console.log("player==",player);

                socket.emit ( 'cliendSendsMove', {
                    data: {
                        tdclickedID:tdclicked[0].id,
                        matrix:matrix,
                        cell:'.upleft',
                        player:player 
                    },
                })
                
              });
              $(document).on("click", ".upright", function() {
                
                socket.emit ( 'cliendSendsMove', {
                    data: {
                        tdclickedID:tdclicked[0].id,
                        matrix:matrix,
                        cell:'.upright',
                        player:player  
                    },
                })
                
              });
              $(document).on("click", ".downright", function() {
                
                socket.emit ( 'cliendSendsMove', {
                    data: {
                        tdclickedID:tdclicked[0].id,
                        matrix:matrix,
                        cell:'.downright',
                        player:player  
                    },
                })
                
              });
              $(document).on("click", ".downleft", function() {
                
                socket.emit ( 'cliendSendsMove', {
                    data: {
                        tdclickedID:tdclicked[0].id,
                        matrix:matrix,
                        cell:'.downleft',
                        player:player  
                    },
                })
                
              });
             
              
              $(".btn_td").on("click",function(e){
                  
                  tdclicked = $(this);
                  
                  console.log("$(this)",tdclicked[0].id);

                   matrix = matrixInfo(tdclicked);

                 if (tdclicked.css('border-left-style')=="solid" ){
                     $(".upleft").css("display","none");
                     
                 }
                
                 if (tdclicked.css('border-right-style')=="solid" ){
                     $(".upright").css("display","none");
                    
                 }
                
                  if (tdclicked.css('border-top-style')=="solid" ){
                     $(".downleft").css("display","none");
                     
                 }
                  if (tdclicked.css('border-bottom-style')=="solid" ){
                     $(".downright").css("display","none");
                     
                 }
                 
                
              })
              inputText.addEventListener('change', sendeNachricht );
              
            ///
   
});

    
