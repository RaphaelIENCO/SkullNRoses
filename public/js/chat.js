"use strict";
document.addEventListener("DOMContentLoaded",function(e) {
    var divBtnConnecter = document.getElementById('btnConnecter');
    var divLogScreen = document.getElementById('logScreen');
    var divContent = document.getElementById('content');
    var isConnect = false;
    var aside = document.querySelector("body div aside");
    var main  = document.querySelector("body div main");
    var spanLogin = document.getElementById('login');
    var BtnEnvoyer = document.getElementById('btnEnvoyer');
    var BtnImage = document.getElementById('btnImage');
    var BtnFermer = document.getElementById('btnFermer');
    var BtnRechercher = document.getElementById('btnRechercher');
    var inputMessage = document.getElementById('monMessage');
    var modalIMG = document.getElementById('bcImage');
    var resultIMG = document.getElementById('bcResults');
    var pseudo;
    var usersOnline = [];

    divBtnConnecter.addEventListener('click',connect);
    BtnEnvoyer.addEventListener('click',envoiMSG);
    BtnImage.addEventListener('click',envoiIMG);
    BtnFermer.addEventListener('click',fermerIMG);
    BtnRechercher.addEventListener('click',rechercheIMG);

    // image s'envoie direct apres selection

    var socket = io.connect("127.0.0.1:8080");

    function connect() {
        var inputPseudo = document.getElementById("pseudo");
        if(inputPseudo.value != ""){
            socket.emit("login",inputPseudo.value);
        }
    }

    function envoiMSG(){
        var to = null;
        var message = inputMessage.value;
        var messageSplit = message.split(' ');

        var mot = messageSplit[0];
        if(mot[0]=='@'){
           if(usersOnline.includes(mot.substr(1))){
               to = mot.substr(1);
               message = message.split(' ');
               message.splice(0,1);
               message = message.join(' ');
           }else {
               console.log("user pas en ligne");
           }
        }
        //console.log(to);
        var obj = {
            "from" :pseudo,
            "to" : to,
            "text" :message,
            "date" : null
        };
        socket.emit("message",obj);
        inputMessage.value = "";
    }

    function envoiIMG(){
        modalIMG.style.display = "block";
    }

    function fermerIMG(){
        modalIMG.style.display = "none";
    }

    function rechercheIMG(){
        var recherche = document.getElementById('recherche').value;
        recherche = recherche.replace(/ /g,"+");
        //console.log(recherche);

        var request = new XMLHttpRequest();

        request.open('GET',"http://api.giphy.com/v1/gifs/search?q="+recherche+"&api_key=0X5obvHJHTxBVi92jfblPqrFbwtf1xig&limit=10",true);

        request.onload = function(){
            var data = JSON.parse(this.response);
            data = data.data;
            //console.log(data);

            data.forEach(gif => {
                //console.log(gif);
                //console.log(gif.images.downsized.url);
                var img = document.createElement('img');
                img.src = gif.images.downsized.url;

                img.addEventListener('click',function(){
                    var message = "[img:"+gif.images.downsized.url+"]";
                    var obj = {
                        "from" :pseudo,
                        "to" : null,
                        "text" :message,
                        "date" : null
                    };
                    socket.emit("message",obj);
                    modalIMG.style.display = "none";
                });
                resultIMG.appendChild(img);
            });
        };
        request.send();
    }


    socket.on("bienvenue",function(id){
        divLogScreen.style.display = 'none';
        divContent.style.display = 'block';
        isConnect = true;
        spanLogin.innerHTML = id;
        pseudo = id;
    });

    socket.on("liste",function(liste){
        if(!isConnect)return;
        aside.innerHTML = "";
        //console.log(liste);
        usersOnline = [];
        liste.forEach(function (user) {
            var div = document.createElement("div");
            div.id=user;
            div.innerText = user;
            aside.appendChild(div);

            usersOnline.push(user);
        });
    });

    socket.on("message",function(message){
        if(!isConnect)return;

        var date1 = new Date(message.date);
        var date2 = date1.toLocaleTimeString();
        var div = document.createElement("div");
        if(!(message.text[0]=="[" && message.text[1]=="i" && message.text[2]=="m" && message.text[3] == "g" && message.text[message.text.length-1]=="]")){
            message.text = message.text.replace(/:D/g,"<div class='emoji banane'></div>");
            message.text = message.text.replace(/xD/g,"<div class='emoji rire'></div>");
            message.text = message.text.replace(/>:\(/g,"<div class='emoji grrr'></div>");
            message.text = message.text.replace(/:\(/g,"<div class='emoji triste'></div>");
            message.text = message.text.replace(/:\//g,"<div class='emoji holala'></div>");
            message.text = message.text.replace(/<3/g,"<div class='emoji love'></div>");
            message.text = message.text.replace(/-.-/g,"<div class='emoji zzz'></div>");
            message.text = message.text.replace(/:\)/g,"<div class='emoji sourire'></div>");
            message.text = message.text.replace(/x\(/g,"<div class='emoji malade'></div>");
        }

        if(message.from == null && message.to == null){
            div.style.color = "red";
            div.id=message.date;
            div.innerHTML = date2+ " - [admin] : " + message.text;
        }else if(message.to != null){
            div.id=message.date;
            div.innerHTML = date2+ " - "+ message.from +" ( à "+message.to+ ") : " + message.text;
        }else{
            div.id=message.date;
            if(message.text[0]=="[" && message.text[1]=="i" && message.text[2]=="m" && message.text[3] == "g" && message.text[message.text.length-1]=="]"){

                var image ="";
                for (let i = 5; i < message.text.length-1; i++) {
                    image += message.text[i];
                }
                //console.log(image);
                div.innerHTML = date2+ " - "+ message.from + " : <img src='"+image+"'>";

            }else{
                div.innerHTML = date2+ " - "+ message.from + " : " + message.text;
            }
        }

        if(message.from == pseudo){
            div.style.color = "green";
        }else if(message.to == pseudo){
            div.style.color = "blue";
        }

        main.appendChild(div);
    });
});