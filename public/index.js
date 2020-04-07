        'use strict'
        
       
        document.addEventListener('DOMContentLoaded', () => {

            //variables

            let stats=[];
            let chosenLetters = [];
            let word="";
            let totalTries = 6;
            let lostTry = 0;

            let txtWord = document.querySelector("#txtWord");
            let btnStart = document.querySelector("#btnStart");
            let btnStats = document.querySelectorAll(".btnStats");
            
            let startContainer = document.querySelector("#startContainer");
            let wordSpaces = document.querySelector("#wordSpaces");
            let chosenLetter = document.querySelector("#letters");
            let imgContainer = document.querySelector("#imgContainer");
            let gameArea = document.querySelector("#gameArea");
            
            let winMsg = document.querySelector("#winMsg");
            let loseMsg = document.querySelector("#loseMsg");
            let letters = document.querySelector("#letters");
            let spanLetters = document.querySelectorAll("#letters span");
            let initBtns = document.querySelectorAll(".initBtn");
            
            let ausgabe = document.querySelector ('#ausgabe');
            let inputText = document.querySelector ('#inputText');
            let inputName = document.querySelector ('#inputName');
            let eintraege = new Map();
            
            let socket = io.connect();
            let socketID = null;

            //SOCKETS

            socket.on('connect', function() {
                //const sessionID = socket.socket.sessionid; //
                
                socketID = socket.id;
               // console.log("socket.id",socketID);
              });

            const sendeNachricht = () => {
                socket.emit ( 'clientSendet', {
                    text: inputText.value,
                    name: inputName.value
                })
                inputText.value="";
                
            }
            
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
            
           
            socket.emit ( 'clientSendsInit', {
                text: "init",
            }); 

            

            socket.on ( 'ServerSendsInit', (data, socketID) => {

                chosenLetters = [];
                totalTries = 6;
                lostTry = 0;

                loadHangImage(lostTry);
                fadeOut(gameArea);
                
                console.log("ServerSendsInit");

                txtWord.value="";

                setTimeout(function(){ 
                    
                    displayBlock(startContainer);
                    displayNone(letters);
                    displayNone(loseMsg);
                    displayNone(winMsg);
                    displayNone(wordSpaces);
                    displayBlock(txtWord);
                    displayBlock(gameArea);
                    fadeIn(gameArea);
                    enableSpanLetters();
                    }, 1000);
  
            });

            socket.on ( 'ServerSendsWord', (data, socketID) => {

                word = data.word;
                console.log("ServerSendsWord:",data.word);
                displayNone(txtWord);
                displayNone(startContainer);
                createWordSpaces(word);
                displayBlock(wordSpaces);
                displayBlock(letters);
                fadeIn(letters);

            })

           


            socket.on ( 'ServerSendsLetter', (data, socketID) => {
                //console.log( socketID );
                //console.log(data);
                let letterToFind = data.letter;
                //console.log(letterToFind); 

                let indexFoundChosenLetters = chosenLetters.indexOf(letterToFind);

                if (indexFoundChosenLetters == -1) { //index in choosen letters

                    chosenLetters.push(letterToFind);

                    //console.log(letterToFind);
                    
                    let indexes = []; // array who keepes the indexes of an letter found in the word
                    for(let i=0; i<word.length;i++) {
                        if (word[i] === letterToFind) indexes.push(i);
                    }
                    
                    if (indexes.length == 0) { //letter no found
                        lostTry++;
                        loadHangImage(lostTry);

                        
                        if (lostTry == totalTries) {
                            
                            
                            fadeOut(gameArea);
                            disableSpanLetters();
                            setTimeout(function(){ 
                                wordSpaces.innerHTML = word;
                                displayNone(letters);
                                displayBlock(loseMsg);
                                fadeIn(gameArea);
                                }, 1000);
                            
                            //fadeIn(gameArea);
                        };
                        
                    } else {

                        createLetterInWordSpaces(letterToFind,indexes);

                    }

                    
                    disableSpanLetter(letterToFind);

                }


            })

 
            const disableSpanLetter = (letterToFind) =>{

                let found;
                    for (let i = 0; i < spanLetters.length; i++) {
                        if (spanLetters[i].textContent == letterToFind) {
                            found = spanLetters[i];
                            found.className = 'disabledLetter';
                            break;
                        }
                    }

            }

          
            //sockets end

            //event listeners

            inputText.addEventListener('change', sendeNachricht );

            for (const button of initBtns) {
                button.addEventListener('click', function(event) {
                    
                    socket.emit ( 'clientSendsInit', {
                        text: "init",
                    }); 
                    
                })
            }

            
            btnStart.addEventListener('click',(e) => {
                   
                //startGame();
                if (txtWord.value!="") {
                    word=txtWord.value;
                    word = word.toUpperCase();
                    startGame();
                }
                
               
            });

            chosenLetter.addEventListener('click',(e) => {
                   
                let letterToFind = e.target.innerHTML;
                
                if (e.target.className == "enabledLetter") {

                    socket.emit ( 'clientSendsLetter', {
                        letter: letterToFind,
                        
                    });  
                }

                
            });

            //event listeners end

            let updateScroll = ()=>{
                
                ausgabe.scrollTop = ausgabe.scrollHeight;
            }

            //functions
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

            const startGame = () => {

                chosenLetters = [];
                totalTries = 6;
                lostTry = 0;
               
                loadHangImage(lostTry);

                console.log("clientSendsWord",word);

                socket.emit ( 'clientSendsWord', {
                    word: word,
                }); 

            }

           

            const createLetterInWordSpaces = (letterToFind,indexes) =>{


                const replaceAt = (string, index, replace) => {
                    return string.substring(0, index) + replace + string.substring(index + 1);
                }

                for (let i=0;i<indexes.length;i++){
                    wordSpaces.innerHTML = replaceAt(wordSpaces.innerHTML, indexes[i], letterToFind);
                }
                
                if (word == wordSpaces.innerHTML) {

                    
                   fadeOut(gameArea);
                   disableSpanLetters();
                   setTimeout(function(){ 
                        displayNone(letters);
                        displayBlock(winMsg);
                        fadeIn(gameArea);
                        }, 1000);
                }
            }
 
            const loadHangImage = (lostTry) => {

                imgContainer.style.background = "url(images/"+lostTry+".jpg)";

            }

            const createWordSpaces = (word) => {
                let res = "";
                for (let i=0;i<word.length;i++){
                    res = res + "-";
                }
                wordSpaces.innerHTML=res;
            }


            const fadeIn = (el) =>{
                el.classList.add('show');
                el.classList.remove('hide');  
                }

            const fadeOut = (el) =>{
                el.classList.add('hide');
                el.classList.remove('show');
                }
            
            const displayNone = (el) =>{
                el.style.display='none';
            }

            const displayBlock = (el) =>{
                el.style.display='block';
            }
            
            const enableSpanLetters = () =>{
                for (const spanLetter of spanLetters) {
                    spanLetter.className = "enabledLetter";
                }
            }

            const disableSpanLetters = () =>{
                for (const spanLetter of spanLetters) {
                    spanLetter.className = "disabledLetter";
                }
            }
            //functions end
             
        });

    
