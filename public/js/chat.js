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
    var btnInvite = document.getElementById('btnInviter');
    var btnLancerPartie = document.getElementById('btnLancerPartie');
    var menuInvite = document.getElementById('bcMenuInvite');
    var listeConnecteInvite = document.getElementById('bcListeConnecte');
    var listeRejointAccepter = document.getElementById('bcListeRejointAccepter');
    var btnFermerInvite = document.getElementById('btnFermerMenuInvite');
    var navbar = document.getElementById('navbar');
    var ongletChat = document.getElementById('ongletChat');
    var divParties = document.getElementById('parties');
    var pseudo;
    var usersOnline = [];
    var listeClans = ['amazons','carnivorous','cyborgs','indians','jokers','swallows'];
    var listeJoueursInvites = [];
    //slt

    divBtnConnecter.addEventListener('click',connect);
    BtnEnvoyer.addEventListener('click',envoiMSG);
    BtnImage.addEventListener('click',envoiIMG);
    BtnFermer.addEventListener('click',fermerIMG);
    BtnRechercher.addEventListener('click',rechercheIMG);
    btnInvite.addEventListener('click',afficheInvite);
    btnFermerInvite.addEventListener('click',fermerInvite);
    ongletChat.addEventListener('click',openChat);
    btnLancerPartie.addEventListener('click',lancerPartie);

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

    function afficheInvite (){
        menuInvite.style.display = "block";
        usersOnline.forEach(function (user) {
            if(user != pseudo) {
                let div = document.createElement("div");
                div.id=user+"Name";
                div.style.clear="left";
                let div1 = document.createElement("div");
                div1.innerText = user;
                div1.style.float="left";
                div1.style.paddingRight="15px";
                let div2 = document.createElement("div");
                div2.style.color="red";
                div2.id=user+"NameResult";
                div2.style.display="none";
                let button = document.createElement("input");
                button.id=user+"Btn";
                button.type = "button";
                button.value="INVITER";

                button.addEventListener('click',function(){
                    let invit = {
                        "from" :pseudo,
                        "to" : user
                    };
                    //console.log(invit);
                    socket.emit("invitation",invit);
                    div.removeChild(button);
                    listeJoueursInvites.push(user);
                });
                div.appendChild(div1);
                div.appendChild(div2);
                div.appendChild(button);
                listeConnecteInvite.appendChild(div);
            }
        });
    }

    function fermerInvite(){
        let listeJoueurs = [];
        console.log(listeJoueursInvites);
        listeJoueurs= listeJoueurs.concat(listeJoueursInvites);
        let annul = {
            from : pseudo,
            listeJoueurs : listeJoueurs
        };
        console.log(annul);
        socket.emit("annulerPartie",annul);
        listeConnecteInvite.innerHTML = "<h4>Joueurs connectés</h4>";
        listeRejointAccepter.innerHTML = "";
        listeJoueursInvites=[];
        menuInvite.style.display = "none";
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

    function openChat(){
        divContent.style.display = 'block';
        divParties.style.display = 'none';
        navbar.childNodes.forEach(function(element){
            element.className = "tablinks";
        });
        ongletChat.className += " active";
    }


    socket.on("bienvenue",function(id){
        divLogScreen.style.display = 'none';
        divContent.style.display = 'block';
        navbar.style.display = 'block';
        divParties.style.display = 'none';
        console.log(ongletChat.className);
        ongletChat.className += " active";
        isConnect = true;
        spanLogin.innerHTML = id;
        pseudo = id;
    });

    socket.on("liste",function(liste){
        if(!isConnect)return;
        aside.innerHTML = "";
        //console.log(liste);
        usersOnline = [];
        console.log(liste);
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

    socket.on("invitation",function(invit){
        var div = document.createElement("div");
        div.style.color = "red";
        div.innerText = "[admin] "+ invit.from + " vous a envoyé une invitation à jouer ! ";
        var buttonAccept = document.createElement("button");
        buttonAccept.innerText = "Accepter";
        buttonAccept.addEventListener("click",function () {
            let result = {
                "from" :invit.from,
                "to" : invit.to,
                "result" : true
            };
            socket.emit("resultInvitation",result);
            div.removeChild(buttonAccept);
            div.removeChild(buttonRefus);
            div.innerText += " Accepté !";
        });
        var buttonRefus = document.createElement("button");
        buttonRefus.innerText = "Refuser";
        buttonRefus.addEventListener("click",function () {
            let result = {
                "from" :invit.from,
                "to" : invit.to,
                "result" : false
            };
            socket.emit("resultInvitation",result);
            div.removeChild(buttonAccept);
            div.removeChild(buttonRefus);
            div.innerText += " Refusé !";
        });
        div.appendChild(buttonAccept);
        div.appendChild(buttonRefus);
        main.appendChild(div);
    });

    socket.on("resultInvitation",function (result) {
        console.log(result);
        if(result.result){
            let div = document.createElement("div");
            div.innerText = result.to;
            listeRejointAccepter.appendChild(div);
        }else if(result.to===pseudo){
            let div = document.createElement("div");
            div.style.color="red";
            div.innerText="[admin] "+ result.from + " à annulé la partie.";
            main.appendChild(div);
            main.childNodes.forEach(function (div) {
                if(div.innerText != undefined && div.innerText == "[admin] "+ result.from+" vous a envoyé une invitation à jouer ! AccepterRefuser"){
                    div.innerText = "[admin] "+ result.from+" vous a envoyé une invitation à jouer ! Invitation Annulé";
                }
            });
        }else{
            console.log('try to insert');
            let clt = document.getElementById(result.to+"NameResult");
            clt.innerText="Refusé";
            clt.style.display="block";
        }
    });

    function lancerPartie(){
        let listeJoueurs = [];
        listeRejointAccepter.childNodes.forEach(function (div) {
            if(div.innerText != undefined){
                listeJoueurs.push(div.innerText);
            }
        });
        // commenter pour test interface
        if(!(listeJoueurs.length>=2 && listeJoueurs.length<=5)){ // jouable entre 3 à 6 joueurs, ici on ne compte pas l'hôte de la partie
            alert("Le nombre de joueurs pour lancer le jeu doit être entre 3 et 6 joueurs");
            return;
        }
        listeJoueurs.push(pseudo); // on ajoute l'hote a la partie

        console.log("envoyer au serveur les id des joueurs ayant accepté suivant : ");
        console.log(listeJoueurs);
        socket.emit("lancerPartie",listeJoueurs);

        listeJoueursInvites=[];
        listeConnecteInvite.innerHTML = "<h4>Joueurs connectés</h4>";
        listeRejointAccepter.innerHTML = "";
        menuInvite.style.display = "none";
    }

    socket.on("debutPartie",function(obj){
        let button = document.createElement("button");
        button.id = obj.id;
        button.className += " tablinks";
        button.innerText = "Partie "+obj.id;
        navbar.appendChild(button);

        let buttonCHAT = document.createElement("button");
        buttonCHAT.id = "chat"+obj.id;
        buttonCHAT.data = obj.id;
        buttonCHAT.innerText = "Chat de partie";
        buttonCHAT.position = "fixe";
        buttonCHAT.left = "15px";
        buttonCHAT.top = "500px";

        let div = document.createElement("div");
        div.id = "divPartie"+obj.id;
        div.className = "unePartie";
        div.style.display = "none";

        // interface de la partie
        let contentAddPerJoueur="<div class=\"joueur\">\n" +
            "                <main></main>\n" +
            "                <aside class=\"etatJoueur carreSkull\"></aside>\n" +
            "                <footer></footer>\n" +
            "            </div>";

        divParties.appendChild(div);
        for(let i=1;i<=obj.nbJoueurs;i++){
            div.innerHTML+=contentAddPerJoueur;
            let footer = document.querySelector("body #parties #divPartie"+obj.id+" .joueur:nth-of-type("+i+") footer");
            footer.innerHTML+="<div class=\"jeton "+listeClans[i-1]+"\"></div>";
        }

        div.appendChild(buttonCHAT);

        button.addEventListener('click',function(){
            divParties.style.display = 'block';
            div.style.display = 'block';
            divContent.style.display = 'none';
            navbar.childNodes.forEach(function(element){
                element.className = "tablinks";
            });
            button.className += " active";
            //retirer class active aux autres button
        });

        let divChatPartie = document.createElement("div");
        divChatPartie.className = "content";
        let contentAddChat = "<h2>Chat de jeu</h2>\n" +
            "        <h3>Clients connectés</h3>\n" +
            "        <aside>\n" +
            "        </aside>\n" +
            "        <main>\n" +
            "        </main>\n" +
            "        <footer>\n" +
            "            <input type=\"text\" id=\"monMessage"+obj.id+"\">\n" +
            "            <input type=\"button\" value=\"Image\" id=\"btnImage"+obj.id+"\">\n"+
            "            <input type=\"button\" value=\"Envoyer\" id=\"btnEnvoyer"+obj.id+"\">\n" +
            "        </footer>\n" +
            "        <div id=\"bcImage"+obj.id+"\" style=\"display: none;\">\n" +
            "            <header>\n" +
            "                <input type=\"text\" id=\"recherche"+obj.id+"\" placeholder=\"Tapez ici le texte de votre recherche\">\n" +
            "                <input type=\"button\" value=\"Recherche\" id=\"btnRechercher"+obj.id+"\">\n" +
            "            </header>\n" +
            "            <div id=\"bcResults"+obj.id+"\"></div>\n" +
            "            <footer><input type=\"button\" value=\"Fermer\" id=\"btnFermer"+obj.id+"\"></footer>\n" +
            "        </div>";
        divChatPartie.innerHTML = contentAddChat;
        divChatPartie.style.display ="none";
        div.appendChild(divChatPartie);

        buttonCHAT.addEventListener('click',function(){
            if(divChatPartie.style.display == "none"){
                divChatPartie.style.display = "block";
            }else{
                divChatPartie.style.display = "none";
            }
        });
    });
});