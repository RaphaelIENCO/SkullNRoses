"use strict";

document.addEventListener("DOMContentLoaded",function(e) {
    var divBtnConnecter = document.getElementById('btnConnecter');
    var divLogScreen = document.getElementById('logScreen');
    var divContent = document.getElementById('content');
    var isConnect = false;
    var aside = document.querySelector("body div aside");
    var main  = document.getElementById("main0");
    var spanLogin = document.getElementById('login');
    var BtnEnvoyer = document.getElementById('btnEnvoyer');
    var BtnImage = document.getElementById('btnImage0');
    var BtnFermer = document.getElementById('btnFermer0');
    var BtnRechercher = document.getElementById('btnRechercher0');
    //var inputMessage = document.getElementById('monMessage');
    //var modalIMG = document.getElementById('bcImage');
    //var resultIMG = document.getElementById('bcResults0');
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
    BtnEnvoyer.addEventListener('click',function(){ envoiMSG(0); });
    BtnImage.addEventListener('click',function(){envoiIMG(0)});
    BtnFermer.addEventListener('click',function(){fermerIMG(0)});
    BtnRechercher.addEventListener('click',function(){rechercheIMG(0)});
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

    function envoiMSG(id){
        if(id == null) id = 0;
        let inputMessage = document.getElementById("monMessage"+id);
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
            "id" : id,
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

    function envoiIMG(id){
        let modalIMG = document.getElementById('bcImage'+id);
        modalIMG.style.display = "block";
    }

    function fermerIMG(id){
        let modalIMG = document.getElementById('bcImage'+id);
        modalIMG.style.display = "none";
    }

    function rechercheIMG(id){
        var recherche = document.getElementById("recherche"+id).value;
        recherche = recherche.replace(/ /g,"+");
        //console.log(recherche);
        let modalIMG = document.getElementById('bcImage'+id);
        let resultIMG = document.getElementById('bcResults'+id);
        resultIMG.innerHTML = "";


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
                        "id" : id,
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

    var partieToSuppr=[];
    function openChat(){
        divContent.style.display = 'block';
        divParties.style.display = 'none';
        navbar.childNodes.forEach(function(element){
            element.className = "tablinks";
        });
        ongletChat.className += " active";

        let indexASuppr=[];
        for(let i=0;i<partieToSuppr.length;i++){
            for(let j=0;j<listeJoueursParPartie.length;j++){
                if(listeJoueursParPartie[j][0]===partieToSuppr[i]){
                    indexASuppr.push(j);
                }
            }
        }
        console.log(listeJoueursParPartie);
        for(let i=0;i<indexASuppr.length;i++){
            listeJoueursParPartie.splice(indexASuppr[i],1);
            let div=document.querySelector("body #parties #divPartie"+(indexASuppr[i]+1)+"");
            divParties.removeChild(div);
            let button=document.getElementById(""+(indexASuppr[i]+1)+"");
            navbar.removeChild(button);
        }
        console.log(listeJoueursParPartie);
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
        if(message.id == null) message.id = 0;

        let mainID = document.getElementById("main"+message.id);
        mainID.appendChild(div);
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

    socket.on("annulerPartie", function(obj){
        fermerInvite();
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
        let obj = {
            "pseudoHote":pseudo,
            "listeJoueurs":listeJoueurs
        };
        socket.emit("lancerPartie",obj);

        listeJoueursInvites=[];
        listeConnecteInvite.innerHTML = "<h4>Joueurs connectés</h4>";
        listeRejointAccepter.innerHTML = "";
        menuInvite.style.display = "none";
    }

    /** *************************** Gestion de la partie *************************** **/
    var indicationDebutTour=" choisissez un disque à empiler.";
    var listeJoueursParPartie =[];
    var jetonsRestant=[];

    socket.on("debutPartie",function(obj){
        let listeJoueursDeLaPartie = [];
        obj.listeJoueur.forEach(function(util){
            listeJoueursDeLaPartie.push(util);
        });
        console.log(listeJoueursDeLaPartie);
        listeJoueursParPartie.push([obj.id ,listeJoueursDeLaPartie]);
        console.log(listeJoueursParPartie);

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
        //let divContentJoueurs = document.createElement("div");
        //div.appendChild(divContentJoueurs);
        for(let i=1;i<=obj.nbJoueurs;i++){
            div.innerHTML+=contentAddPerJoueur;
            //divContentJoueurs.innerHTML+=contentAddPerJoueur;
            let footer = document.querySelector("body #parties #divPartie"+obj.id+" .joueur:nth-of-type("+i+") footer");
            if(listeClans[i-1]==="cyborgs"|| listeClans[i-1]==="jokers" || listeClans[i-1]==="swallows"){
                footer.innerHTML+="<span class='nameJoueur "+listeClans[i-1]+"'>"+listeJoueursDeLaPartie[i-1].pseudoUtilisateur+"</span>";
                footer.innerHTML+="<div class=\"englobeJ\"><div class=\"nbJetons "+listeClans[i-1]+"\">4</div><div class=\"jeton "+listeClans[i-1]+"\"></div></div>";
            }else{
                footer.innerHTML+="<div class=\"englobeJ\"><div class=\"jeton "+listeClans[i-1]+"\"></div><div class=\"nbJetons "+listeClans[i-1]+"\">4</div></div>";
                footer.innerHTML+="<span class='nameJoueur "+listeClans[i-1]+"'>"+listeJoueursDeLaPartie[i-1].pseudoUtilisateur+"</span>";
            }
        }
        div.innerHTML+="<div class='containTour'><span class='joueurCourant'>"+listeJoueursDeLaPartie[obj.aQuiLeTour].pseudoUtilisateur+"</span><span class='indication'>"+indicationDebutTour+"</span> </div>";
        if (('speechSynthesis' in window)){
            let enonciation = new SpeechSynthesisUtterance(listeJoueursDeLaPartie[obj.aQuiLeTour].pseudoUtilisateur+indicationDebutTour);
            window.speechSynthesis.speak(enonciation);
        }
        div.innerHTML+="<div class='choix'></div>";
        div.innerHTML+="<div class='enchereStatut'></div>";

        div.appendChild(buttonCHAT);
        if (!('speechSynthesis' in window)) alert("non supportée");

        button.addEventListener('click',function(){
            divParties.style.display = 'block';
            divParties.childNodes.forEach(function(div){
                if(div.innerText!==undefined){
                    div.style.display='none';
                }
            });
            let div=document.querySelector("body #parties #divPartie"+obj.id+"");
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
            "        <main id=\"main"+obj.id+"\">\n" +
            "        </main>\n" +
            "        <footer>\n" +
            "            <input type=\"text\" id=\"monMessage"+obj.id+"\">\n" +
            "            <input type=\"button\" value=\"Image\" id=\"btnImage"+obj.id+"\">\n"+
            "            <input type=\"button\" value=\"Envoyer\" id=\"btnEnvoyer"+obj.id+"\">\n" +
            "        </footer>\n" +
            "        <div id=\"bcImage"+obj.id+"\" class=\"bcImage\" style=\"display: none;\">\n" +
            "            <header>\n" +
            "                <input type=\"text\" id=\"recherche"+obj.id+"\" placeholder=\"Tapez ici le texte de votre recherche\">\n" +
            "                <input type=\"button\" value=\"Recherche\" id=\"btnRechercher"+obj.id+"\">\n" +
            "            </header>\n" +
            "            <div id=\"bcResults"+obj.id+"\" class=\"bcResults\"></div>\n" +
            "            <footer><input type=\"button\" class=\"btnFermer\" value=\"Fermer\" id=\"btnFermer"+obj.id+"\"></footer>\n" +
            "        </div>";
        divChatPartie.innerHTML = contentAddChat;
        divChatPartie.style.display ="none";
        div.appendChild(divChatPartie);

        let btnEnvoi = document.getElementById("btnEnvoyer"+obj.id);
        btnEnvoi.addEventListener('click',function(){ envoiMSG(obj.id); });

        buttonCHAT.addEventListener('click',function(){
            if(divChatPartie.style.display == "none"){
                divChatPartie.style.display = "block";
            }else{
                divChatPartie.style.display = "none";
            }
        });

        let btnIMG = document.getElementById("btnImage"+obj.id);
        btnIMG.addEventListener('click',function(){envoiIMG(obj.id)});

        let btnFermer = document.getElementById("btnFermer"+obj.id);
        btnFermer.addEventListener('click',function(){fermerIMG(obj.id)});

        let btnRechercheIMG = document.getElementById("btnRechercher"+obj.id);
        btnRechercheIMG.addEventListener('click',function(){rechercheIMG(obj.id)});

        if(listeJoueursDeLaPartie[obj.aQuiLeTour].pseudoUtilisateur===pseudo){
            console.log("c'est à mon tour de jouer");
            //socket.emit("getJetons",pseudo);
            askingJetons(obj.id,pseudo);
        }
    });


    /** ************************** LES PREPARATIFS ************************** **/

    function askingJetons(idPartie,pseudo){
        let askFor = {
            "idPartie" :idPartie,
            "pseudo" : pseudo
        };
        socket.emit("getJetons",askFor);
        // envoyer requete au joueur suivant
    }

    socket.on("returnJetons",function(obj){
        if(obj.pseudo!==pseudo){return;}
        console.log(obj);
        console.log("il me reste ces jetons : "+obj.jetonsRestant);
        // si il a deja poser des jetons sur le plateau il faudra rajouter un choix possible -> parier

        let jSuivant=obj.joueurSuivant;
        if(obj.aPerdu){
            console.log("je n'ai plus de jetons, j'ai perdu");
            for(let i=0;i<listeJoueursParPartie.length;i++){
                if(listeJoueursParPartie[i][0]===obj.idPartie){
                    //console.log("partie trouve");
                    askingJetons(obj.idPartie,listeJoueursParPartie[i][1][jSuivant].pseudoUtilisateur);
                }
            }
            return;/* joueur suivant */
        }
        jetonsRestant=obj.jetonsRestant;

        if(jetonsRestant===null || jetonsRestant.length===0){
            // enchérir ou se coucher
            let choix = document.querySelector("body #parties #divPartie"+obj.idPartie+" .choix");
            choix.style.display="block";
            setUpForEnchere(obj);
            return;
        }
        let nbRoses=0;
        let nbSkulls=0;
        jetonsRestant.forEach(function (jeton) {
            if(jeton==="roses"){nbRoses++;}
            else if(jeton==="skull"){nbSkulls++;}
        });
        // ajouter listner sur jeton -> ici footer c'est volontaire
        let jetons = document.querySelector("body #parties #divPartie"+obj.idPartie+" .joueur:nth-of-type("+obj.position+") footer");
        // faire un choix
        jetons.addEventListener("click",function(){
            // faire apparaitre div choix utilisateur
            let choix = document.querySelector("body #parties #divPartie"+obj.idPartie+" .choix");
            choix.style.display="block";
            choix.innerHTML+="<div class=\"jeton roses\"></div><span class=\"nbRoses\">"+nbRoses+"</span>\n" +
                             "<div class=\"jeton skull\"></div><span class=\"nbSkulls\">"+nbSkulls+"</span>";

            if(obj.readyPourEnchere){
                setUpForEnchere(obj);
                if (('speechSynthesis' in window)){
                    let enonciation = new SpeechSynthesisUtterance(obj.pseudo+" vous pouvez aussi commencer les enchères.");
                    window.speechSynthesis.speak(enonciation);
                }
            }

            let roses = document.querySelector("body #parties #divPartie"+obj.idPartie+" .choix .jeton.roses");
            let skull = document.querySelector("body #parties #divPartie"+obj.idPartie+" .choix .jeton.skull");
            if(nbRoses>0){
                roses.addEventListener("click",function(){
                    console.log("je choisis une rose");
                    //let choix = document.querySelector("body #parties #divPartie"+obj.idPartie+" .choix");
                    choix.innerHTML="";
                    choix.style.display="none";
                    let objEmit ={
                        "idPartie" :obj.idPartie,
                        "pseudo" : pseudo,
                        "pose": "roses"
                    };
                    socket.emit("poseUnJeton",objEmit);
                });
            }
            if(nbSkulls>0){
                skull.addEventListener("click",function() {
                    console.log("je choisis un crâne");
                    //let choix = document.querySelector("body #parties #divPartie"+obj.idPartie+" .choix");
                    choix.innerHTML="";
                    choix.style.display="none";
                    let objEmit ={
                        "idPartie" :obj.idPartie,
                        "pseudo" : pseudo,
                        "pose": "skull"
                    };
                    socket.emit("poseUnJeton",objEmit);
                });
            }
        },{once : true}); // supprime l'event listner après premiere utilisation
    });

    socket.on("poserJeton",function(obj){
        let joueurQuiAPose=obj.pseudo;let idPartie=obj.idPartie;let jSuivant=obj.joueurSuivant;
        let position=obj.position;let nbJetonsRestant=obj.nbJetonsRestant;
        console.log(joueurQuiAPose+" a posé un jeton");
        let nbJeton = document.querySelector("body #parties #divPartie"+idPartie+" .joueur:nth-of-type("+position+") footer .englobeJ .nbJetons");
        nbJeton.innerHTML=nbJetonsRestant;

        let aside = document.querySelector("body #parties #divPartie"+idPartie+" .joueur:nth-of-type("+position+") aside");
        if(aside.innerHTML===""){
            if(listeClans[position-1]==="cyborgs"|| listeClans[position-1]==="jokers" || listeClans[position-1]==="swallows"){
                aside.innerHTML= "<div class='englobeJ'><div class=\"nbJetons "+listeClans[position-1]+"\">1</div><div class=\"jeton "+listeClans[position-1]+"\"></div></div>";
            }else{
                aside.innerHTML= "<div class='englobeJ'><div class=\"jeton "+listeClans[position-1]+"\"></div><div class=\"nbJetons "+listeClans[position-1]+"\">1</div></div>";
            }
        }else{
            let nbPose = document.querySelector("body #parties #divPartie"+idPartie+" .joueur:nth-of-type("+position+") aside .englobeJ .nbJetons");
            nbPose.innerHTML=parseInt(nbPose.innerHTML)+1;
        }
        let spanJoueurCourant = document.querySelector("body #parties #divPartie"+idPartie+" .joueurCourant");
        let spanIndication = document.querySelector("body #parties #divPartie"+idPartie+" .indication");
        //console.log(listeJoueursParPartie);
        for(let i=0;i<listeJoueursParPartie.length;i++){
            if(listeJoueursParPartie[i][0]===idPartie){
                spanJoueurCourant.innerHTML = listeJoueursParPartie[i][1][jSuivant].pseudoUtilisateur;
            }
        }
        let indication=" choisissez un disque à empiler";
        updateIndication(obj.idPartie,indication,spanJoueurCourant.innerHTML,true);

        // au joueur suivant
        if(joueurQuiAPose!==pseudo){return;} // permet de faire le prochain emit qu'une fois
        for(let i=0;i<listeJoueursParPartie.length;i++){
            if(listeJoueursParPartie[i][0]===idPartie){
                //console.log("partie trouve");
                askingJetons(idPartie,listeJoueursParPartie[i][1][jSuivant].pseudoUtilisateur);
            }
        }
    });

    /** ************************** LES ENCHERES ************************** **/

    function setUpForEnchere(obj){
        let addEnchere="<div class='contentEnchere'>" +
            "<label for=\"enchere"+obj.idPartie+"\" class='labelEnchere'>De combien pariez-vous (" +
            obj.enchereLaPlusForte.valeurEnchere+"-"+obj.nbJetonsJoues+") ?</label>" +
            "<div class='divEnchereInput'><input type=\"number\" id=\"enchere"+obj.idPartie+"\" name=\"enchere\" class='inputEnchere' " +
            "min=\""+obj.enchereLaPlusForte.valeurEnchere+"\" max=\""+obj.nbJetonsJoues+"\">" +
            "<button class='buttonEnchere'>✔</button></div>" +
            "</div>";

        let choix = document.querySelector("body #parties #divPartie"+obj.idPartie+" .choix");
        choix.innerHTML+=addEnchere;

        let buttonEnchere=document.querySelector("body #parties #divPartie"+obj.idPartie+" .choix .contentEnchere .buttonEnchere");
        buttonEnchere.addEventListener("click",function () {
            console.log("je valide l'enchere");
            let input = document.querySelector("body #parties #divPartie"+obj.idPartie+" .choix .contentEnchere .inputEnchere");
            let inputValue = input.value;
            console.log(inputValue+" compare to ("+obj.enchereLaPlusForte.valeurEnchere+"-"+obj.nbJetonsJoues+")");
            if(!(inputValue>obj.enchereLaPlusForte.valeurEnchere && inputValue<=obj.nbJetonsJoues)){
                alert("Enchere non conforme réessayé svp.");
                return;
            }

            /*if(Number(inputValue)===obj.nbJetonsJoues){
                console.log("enchere gagne -> a implem");
                // emit something
                return;
            }*/
            let toSend = {
                "idPartie": obj.idPartie,
                "pseudo":pseudo,
                "valeurEnchere":Number(inputValue)
            };
            socket.emit("proposeEnchere",toSend);

            choix.innerHTML="";
            choix.style.display="none";
        });
    }

    socket.on("phaseEnchere",function(obj){
        console.log("phaseEnchereReçu");
        console.log(obj);
        let jSuivant = obj.joueurSuivant;
        let idPartie = obj.idPartie;

        // update affichage
        let divEnchere= document.querySelector("body #parties #divPartie"+obj.idPartie+" .enchereStatut");
        divEnchere.style.display="block";
        divEnchere.innerHTML=obj.pseudo+" detient la plus haute enchère qui est de "+obj.enchereLaPlusForte.valeurEnchere+" jetons.";

        let spanJoueurCourant = document.querySelector("body #parties #divPartie"+idPartie+" .joueurCourant");
        for(let i=0;i<listeJoueursParPartie.length;i++){
            if(listeJoueursParPartie[i][0]===idPartie){
                spanJoueurCourant.innerHTML = listeJoueursParPartie[i][1][jSuivant].pseudoUtilisateur;
            }
        }
        let indication=" faites votre enchère !";
        updateIndication(obj.idPartie,indication,spanJoueurCourant.innerHTML,true);

        // au joueur suivant
        if(obj.pseudo!==pseudo){return;} // permet de faire le prochain emit qu'une fois
        for(let i=0;i<listeJoueursParPartie.length;i++){
            if(listeJoueursParPartie[i][0]===idPartie){
                askingEncheres(obj.idPartie,listeJoueursParPartie[i][1][jSuivant].pseudoUtilisateur);
            }
        }
    });

    socket.on("gagneEnchere",function(obj){
        let indication=" a gagné l'enchère avec "+ obj.enchereLaPlusForte.valeurEnchere +" !";
        updateIndication(obj.idPartie,indication,obj.pseudo,true);

        let statutEnchere = document.querySelector("body #parties #divPartie"+obj.idPartie+" .enchereStatut");
        if(statutEnchere !== null){
            statutEnchere.innerHTML="";
            statutEnchere.style.display="none";
        }

        let choix = document.querySelector("body #parties #divPartie"+obj.idPartie+" .choix");
        if(choix !== null){
            choix.innerHTML="";
            choix.style.display="none";
        }
    });

    function askingEncheres(idPartie,pseudo){
        let askFor = {
            "idPartie" :idPartie,
            "pseudo" : pseudo
        };
        socket.emit("askEnchere",askFor);
    }

    socket.on("returnAskEnchere",function(obj){
        let choix = document.querySelector("body #parties #divPartie"+obj.idPartie+" .choix");
        choix.style.display="block";
        console.log("let's set up");
        setUpForEnchere(obj);
        setUpSeCoucher(obj);
    });

    function setUpSeCoucher(obj){
        let contentAddSeCoucher = "<div class='contentSeCoucher'>" +
            "<span class='textSeCoucher'>Se coucher</span><button class='buttonSeCoucher'>✘</button>" +
            "</div>";

        let choix = document.querySelector("body #parties #divPartie"+obj.idPartie+" .choix");
        //choix.innerHTML+=contentAddSeCoucher;
        let divContent=document.createElement("div");
        divContent.className="contentSeCoucher";
        let span=document.createElement("span");
        span.className="textSeCoucher";
        span.innerHTML="Se coucher";
        let button=document.createElement("button");
        button.className="buttonSeCoucher";
        button.innerHTML="✘";

        divContent.appendChild(span);
        divContent.appendChild(button);
        choix.appendChild(divContent);

        let buttonSeCoucher=document.querySelector("body #parties #divPartie"+obj.idPartie+" .choix .contentSeCoucher .buttonSeCoucher");
        buttonSeCoucher.addEventListener("click",function () {
            console.log("je me couche");
            let toSend = {
                "idPartie": obj.idPartie,
                "pseudo":pseudo
            };
            socket.emit("jeMeCouche",toSend);
            choix.innerHTML="";
            choix.style.display="none";
        });
    }

    socket.on("seCouche",function(obj){
        console.log(obj.pseudo+" se couche");
        console.log(obj);

        // changer le style du joueur pour qu'on voit qu'il s'est couché
        let jCouche= document.querySelector("body #parties #divPartie"+obj.idPartie+" .joueur:nth-of-type("+obj.position+")");
        jCouche.className+=" cross";

        // au joueur suivant
        //
        if(obj.nbJoueurEncoreEnListe===1){
            // le joueur à gagné la phase d'enchere car tlm s'est couché sauf lui
            let objAEmit = {
                "idPartie": obj.idPartie
            };
            if(obj.pseudo!==pseudo){return;}
            socket.emit("gagneEnchereParAbandon",objAEmit);
            return;
        }

        for(let i=0;i<listeJoueursParPartie.length;i++){
            if(listeJoueursParPartie[i][0]===obj.idPartie){
                let spanJoueurCourant = document.querySelector("body #parties #divPartie"+obj.idPartie+" .joueurCourant");
                let spanIndication = document.querySelector("body #parties #divPartie"+obj.idPartie+" .indication");
                spanJoueurCourant.innerHTML = listeJoueursParPartie[i][1][obj.joueurSuivant].pseudoUtilisateur;

                let indication=" faites votre enchère !";
                updateIndication(obj.idPartie,indication,spanJoueurCourant.innerHTML,true);

                if(obj.pseudo!==pseudo){return;}
                askingEncheres(obj.idPartie,listeJoueursParPartie[i][1][obj.joueurSuivant].pseudoUtilisateur);
            }
        }
    });

    socket.on("returnEncherePerduOuCouche",function(obj){
        console.log("returnEncherePerduOuCouche");
        let objAEmit={
            "idPartie" :obj.idPartie,
            "pseudo" : pseudo
        };
        socket.emit("skipJoueurEnchere",objAEmit);
    });

    socket.on("returnSkipEnchere",function(obj){
        console.log("returnSkipEnchere");
        //if(obj.pseudo!==pseudo){return;}
        for(let i=0;i<listeJoueursParPartie.length;i++){
            if(listeJoueursParPartie[i][0]===obj.idPartie){

                askingEncheres(obj.idPartie,listeJoueursParPartie[i][1][obj.joueurSuivant].pseudoUtilisateur);
            }
        }
    });

    socket.on("phaseRetourneJetonsPerso",function(obj){
        // mettre eventlistener sur la pile du joueur
        let position = obj.position;
        let idPartie = obj.idPartie;
        let nbPose = document.querySelector("body #parties #divPartie"+idPartie+" .joueur:nth-of-type("+position+") aside .englobeJ .nbJetons");
        let jeton = document.querySelector("body #parties #divPartie"+idPartie+" .joueur:nth-of-type("+position+") aside .englobeJ .jeton");
        let divComptParis = document.createElement("div");
        divComptParis.className = "comptParis";
        divComptParis.style.display = "none";
        divComptParis.innerHTML = obj.nbParis;

        let parent = document.querySelector("body #parties #divPartie"+idPartie);
        parent.appendChild(divComptParis);

        jeton.addEventListener('click',function(){
            let comptParis = document.querySelector("body #parties #divPartie"+idPartie+" .comptParis");
            console.log("click sur jetons");
            let objAEmit = {
                "idPartie" : idPartie,
                "pseudo" : pseudo,
                "position" :position,
                "nbParis" : Number(comptParis.innerHTML)
            };
            socket.emit("retourneJeton",objAEmit);
        });
    });

    socket.on("phaseRetourneJetonsAutres",function(obj){ // seulement pour le joueur qui retourne
        console.log(obj);
        let idPartie = obj.idPartie;
        let pseudo = obj.pseudo;
        let positions = obj.position;

        positions.forEach(function(position){
            let nbPose = document.querySelector("body #parties #divPartie"+idPartie+" .joueur:nth-of-type("+position+") aside .englobeJ .nbJetons");
            let jeton = document.querySelector("body #parties #divPartie"+idPartie+" .joueur:nth-of-type("+position+") aside .englobeJ .jeton");

            jeton.addEventListener('click',function(){
                let comptParis = document.querySelector("body #parties #divPartie"+idPartie+" .comptParis");
                console.log("click sur jetons");
                let objAEmit = {
                    "idPartie" : idPartie,
                    "pseudo" : pseudo,
                    "position" :position,
                    "nbParis" : Number(comptParis.innerHTML)
                };
                socket.emit("retourneJeton",objAEmit);
            });
        });
    });

    socket.on("retourneJeton",function(obj){ // pour l'affichage à tt le monde
        let position = obj.position;
        let idPartie = obj.idPartie;
        let nbPose = document.querySelector("body #parties #divPartie"+idPartie+" .joueur:nth-of-type("+position+") aside .englobeJ .nbJetons");
        let jeton = document.querySelector("body #parties #divPartie"+idPartie+" .joueur:nth-of-type("+position+") aside .englobeJ .jeton");
        let comptParis = document.querySelector("body #parties #divPartie"+idPartie +" .comptParis");

        if(comptParis != null){
            let int = Number(comptParis.innerHTML);
            comptParis.innerHTML = int - 1;
        }

        if(nbPose.innerHTML !== "1"){
            let int = Number(nbPose.innerHTML);
            nbPose.innerHTML = int - 1;
        }else{
            nbPose.innerHTML = 0;
            let parent = document.querySelector("body #parties #divPartie"+idPartie+" .joueur:nth-of-type("+position+") aside .englobeJ");
            parent.removeChild(jeton);
        }
        if(pseudo !== obj.pseudo){return;}
        let objRetour = {
            "idPartie" : idPartie,
            "pseudo" : pseudo,
            "position" : position,
            "nbParis" : obj.nbParis,
        };
        socket.emit("jetonRetourne",objRetour);
    });

    socket.on("retourneCrane",function(obj){
        console.log(obj);
        /*let nbPose = document.querySelector("body #parties #divPartie"+idPartie+" .joueur:nth-of-type("+position+") aside .englobeJ .nbJetons");
        let jeton = document.querySelector("body #parties #divPartie"+idPartie+" .joueur:nth-of-type("+position+") aside .englobeJ .jeton");*/
        vider(obj,"a retourné un crane !");

        if(pseudo!==obj.pseudo){return;}
        let objAEmit = {
            "idPartie":obj.idPartie,
            "joueurGagnantEnchere":obj.pseudo,
            "joueurGagnantManche":null
        };
        socket.emit("prepareNextTurn",objAEmit);

    });

    socket.on("gagnePoint",function(obj){
        console.log(obj);

        vider(obj, " a gagner un point !");
        let gagnant = document.querySelector("body #parties #divPartie"+obj.idPartie+" .joueur:nth-of-type("+obj.position+") aside");
        gagnant.className="etatJoueur carreRoses";

        if(pseudo!==obj.pseudo){return;}
        let objAEmit = {
            "idPartie":obj.idPartie,
            "joueurGagnantEnchere":obj.pseudo,
            "joueurGagnantManche":obj.pseudo
        };
        socket.emit("prepareNextTurn",objAEmit);
    });

    function vider(obj, indication){
        let idPartie = obj.idPartie;

        updateIndication(obj.idPartie,indication,obj.pseudo,true);

        let comptParis = document.querySelector("body #parties #divPartie"+idPartie +" .comptParis");
        if(comptParis !== null){
            comptParis.remove();
        }
        for (let i = 1; i <= obj.nbJoueurs; i++) {
            let parent = document.querySelector("body #parties #divPartie"+idPartie+" .joueur:nth-of-type("+i+") aside");
            parent.innerHTML = "";
            let joueur = document.querySelector("body #parties #divPartie"+idPartie+" .joueur:nth-of-type("+i+")");
            if(joueur.className.includes("cross")){
                joueur.className="joueur";
            }
        }
    }

    socket.on("choixPremierJoueur",function(obj){
        console.log("choixPremierJoueur");
        console.log(obj);

        let indication=" choisissez qui commencera lors du prochain tour.";
        updateIndication(obj.idPartie,indication,obj.pseudo,true);

        if(pseudo!==obj.pseudo){return;}
        // ajouter listner a tout les footer de joueur
        let joueurFooter;
        for(let i=0;i<listeJoueursParPartie.length;i++){
            if(listeJoueursParPartie[i][0]===obj.idPartie) {
                for (let j=1;j<=listeJoueursParPartie[i][1].length;j++){
                    joueurFooter = document.querySelector("body #parties #divPartie"+obj.idPartie+" .joueur:nth-of-type("+j+") footer");
                    joueurFooter.addEventListener("click",function(){
                        let toSend = {
                            "idPartie":obj.idPartie,
                            "position":j,
                            "positionPerdant" : obj.position
                        };
                        socket.emit("returnChoixPremierJoueur",toSend);
                    }, {once:true});
                }
                break;
            }
        }
    });

    socket.on("finPrepareTurn",function(obj){
        console.log("finPrepareTurn");
        console.log(obj);

        if(obj.positionPerdant !== undefined){
            let divjoueur = document.querySelector("body #parties #divPartie"+obj.idPartie+" .joueur:nth-of-type("+obj.positionPerdant+")");
            divjoueur.className += " dead";
            let spanNbJetons = document.querySelector("body #parties #divPartie"+obj.idPartie+" .joueur:nth-of-type("+obj.positionPerdant+") footer .englobeJ .nbJetons");
            spanNbJetons.remove();
        }

        updateIndication(obj.idPartie," choisissez un disque à empiler",obj.pseudo,true);

        // on met a jour les nb de jetons
        let nbJetonsRestant;
        for(let i=0;i<listeJoueursParPartie.length;i++){
            if(listeJoueursParPartie[i][0]===obj.idPartie){
                for (let j=1;j<=listeJoueursParPartie[i][1].length;j++) {
                    nbJetonsRestant = document.querySelector("body #parties #divPartie" + obj.idPartie + " .joueur:nth-of-type(" + j + ") footer .englobeJ .nbJetons");
                    if(nbJetonsRestant !== null){
                        nbJetonsRestant.innerHTML=obj.nbDeJetonsRestantParJoueur[j-1];
                    }
                }
            }
        }

        console.log(" --- liste joueursParPartie --- ");
        console.log(listeJoueursParPartie);
        if(pseudo!==obj.pseudo){return;}
        for(let i=0;i<listeJoueursParPartie.length;i++){
            if(listeJoueursParPartie[i][0]===obj.idPartie){
                console.log("try to ask jetons for : "+listeJoueursParPartie[i][1][obj.position-1].pseudoUtilisateur);
                askingJetons(obj.idPartie,listeJoueursParPartie[i][1][obj.position-1].pseudoUtilisateur);
            }
        }
    });

    socket.on("gagneLaPartie",function(obj){
        console.log("gagneLaPartie");
        console.log(obj);

        updateIndication(obj.idPartie," gagne la partie !",obj.gagnant,true);

        partieToSuppr.push(obj.idPartie);
        if(pseudo!==obj.gagnant){return;}
        socket.emit("partieTermine",obj.idPartie);
    });

    function updateIndication(idPartie,indication,pseudo,vocalOrNot){
        let spanJoueurCourant = document.querySelector("body #parties #divPartie"+idPartie+" .joueurCourant");
        let spanIndication = document.querySelector("body #parties #divPartie"+idPartie+" .indication");
        spanJoueurCourant.innerHTML = pseudo;
        spanIndication.innerHTML = indication;
        if (('speechSynthesis' in window) && vocalOrNot){
            let enonciation = new SpeechSynthesisUtterance(spanJoueurCourant.innerHTML+" "+spanIndication.innerHTML);
            window.speechSynthesis.speak(enonciation);
        }
    }
});