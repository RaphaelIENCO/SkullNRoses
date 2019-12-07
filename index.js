// Chargement des modules
var express = require('express');


const Utilisateur = require('./public/js/utilisateur.js');
const Partie = require('./public/js/partie.js');

var app = express();
var server = app.listen(8080, function() {
    console.log("C'est parti ! En attente de connexion sur le port 8080...");
});

// Ecoute sur les websockets
var io = require('socket.io').listen(server);

// Configuration d'express pour utiliser le répertoire "public"
app.use(express.static('public'));
// set up to 
app.get('/', function(req, res) {  
    res.sendFile(__dirname + '/public/chat.html');
});



/*** Gestion des clients et des connexions ***/
var clients = {};       // id -> socket
var utilisateurs = [];
var partieEnCours=[];

// Quand un client se connecte, on le note dans la console
io.on('connection', function (socket) { // socket = io.connect("....:8080");
    
    // message de debug
    console.log("Un client s'est connecté");
    var currentID = null;

    
    /**
     *  Doit être la première action après la connexion.
     *  @param  id  string  l'identifiant saisi par le client
     */
    socket.on("login", function(id) { // socket.emit ("login","eric");
        while (clients[id]) {
            id = id + "(1)";   
        }
        currentID = id;
        let util= new Utilisateur(currentID);

        clients[currentID] = socket;
        utilisateurs[currentID] = util;

        console.log(util);
        
        console.log("Nouvel utilisateur : " + currentID);
        // envoi d'un message de bienvenue à ce client
        socket.emit("bienvenue", id);
        // envoi aux autres clients 
        socket.broadcast.emit("message", { from: null, to: null, text: currentID + " a rejoint la discussion", date: Date.now() } );
        //envoi à tt le monde sauf au nouveau client

        // envoi de la nouvelle liste à tous les clients connectés
        io.sockets.emit("liste", Object.keys(clients)); // envoi à tt le monde
    });
    
    
    /**
     *  Réception d'un message et transmission à tous.
     *  @param  msg     Object  le message à transférer à tous  
     */
    socket.on("message", function(msg) {
        console.log("Reçu message");   
        // si jamais la date n'existe pas, on la rajoute
        msg.date = Date.now();
        // si message privé, envoi seulement au destinataire
        if (msg.to != null && clients[msg.to] !== undefined) {
            console.log(" --> message privé");
            clients[msg.to].emit("message", msg);
            if (msg.from != msg.to) {
                socket.emit("message", msg);
            }
        }else{
            console.log(msg.id);
            if(msg.id === 0){
                console.log(" --> broadcast");
                io.sockets.emit("message", msg);
            }else{
                console.log("je rentre dans le else");
                //console.log(partieEnCours);
                for (let i = 0; i < partieEnCours.length; i++) {
                    let partie = partieEnCours[i];
                    console.log(partie);
                    console.log("suis dans le for Partie");
                    if(partie.getIdPartie() === msg.id){
                        console.log("la partie a le meme id");
                        partie.getListeJoueurs().forEach(function(joueur){
                            console.log(joueur.getPseudoUtilisateur());
                            clients[joueur.getPseudoUtilisateur()].emit("message",msg);
                        });
                    }
                }
            }
        }
    });
    

    /** 
     *  Gestion des déconnexions
     */
    
    // fermeture
    socket.on("logout", function() { 
        // si client était identifié (devrait toujours être le cas)
        if (currentID) {
            console.log("Sortie de l'utilisateur " + currentID);
            // envoi de l'information de déconnexion
            socket.broadcast.emit("message", 
                { from: null, to: null, text: currentID + " a quitté la discussion", date: Date.now() } );
                // suppression de l'entrée
            delete clients[currentID];
            // envoi de la nouvelle liste pour mise à jour
            socket.broadcast.emit("liste", Object.keys(clients));
        }
    });
    
    // déconnexion de la socket
    socket.on("disconnect", function(reason) { 
        // si client était identifié
        if (currentID) {
            // envoi de l'information de déconnexion
            socket.broadcast.emit("message", 
                { from: null, to: null, text: currentID + " vient de se déconnecter de l'application", date: Date.now() } );
                // suppression de l'entrée
            delete clients[currentID];

            // test du delete
            delete utilisateurs[currentID];
            // voir si il faut parcourir les parties de l'utilisateur a supprimer avant de le supprimer
            // surement a faire plus tard (pour l'ajout de l'IA remplaçante)

            // envoi de la nouvelle liste pour mise à jour
            socket.broadcast.emit("liste", Object.keys(clients));
        }
        console.log("Client déconnecté");
    });

    socket.on("invitation",function(invit) {
        // une invitation est reçu
        let from = invit.from; let to = invit.to;
        // verif si les deux sont connectés
        if(clients[from] && clients[to]){
            console.log("-> invitation au destinataire ");
            clients[to].emit("invitation",invit);
        }else if(clients[from]){ // si le destinataire n'est pas connecté
            console.log("-> resultInvitation annulé car destinaire non connecté");
            let result = {
                "from":from,
                "to":from,
                "result": false
            };
            clients[from].emit("resultInvitation",result);
        } // sinon on n'ignore l'invitation comme l'hote de la partie est déconnecté
    });

    socket.on("resultInvitation",function(resultInvit){
        let from = resultInvit.from; let to = resultInvit.to;
        if(clients[from] && clients[to]){
            console.log("->  resultInvitation invit accepté");
            clients[from].emit("resultInvitation",resultInvit);
        }else if(clients[from]){ // si le destinataire n'est pas connecté
            resultInvit.result=false;
            clients[from].emit("resultInvitation",resultInvit);
        }else{
            resultInvit.result=false;
            clients[to].emit("resultInvitation",resultInvit);
        }
    });

    socket.on("annulerPartie",function(annuler){
       let from = annuler.from; let tabJ = annuler.listeJoueurs;
       tabJ.forEach(function(joueur){
           let resultInvit={
               "from":from,
               "to":joueur,
               "result": false
           };
           console.log("-> annuler serveur pour joueur:"+resultInvit.to);
           clients[joueur].emit("resultInvitation",resultInvit);
       });
    });

    /*** Gestion des parties en cours ***/

    socket.on("lancerPartie",function(listeJoueur){
        let listeUser= [];
        listeJoueur.forEach(function(joueur) {
            console.log(joueur);
            utilisateurs[joueur].listeParties.push(partieEnCours.length+1);
            listeUser.push(utilisateurs[joueur]);
        });

        let partie = new Partie(partieEnCours.length+1,listeUser);
        console.log("partie crée : ");
        console.log(partie);

        partieEnCours.push(partie);

        // emit qq chose pour prevenir les joueurs
        listeJoueur.forEach(function(joueur){
            utilisateurs[joueur].addIdPartie(partie.getIdPartie());
            let obj = {
                "id" : partie.id,
                "nbJoueurs" : partie.nbJoueurs,
                "listeJoueur" : partie.listeJoueurs,
                "aQuiLeTour" : partie.aQuiLeTour()
            };
            clients[joueur].emit("debutPartie",obj);
        });
    });

    socket.on("getJetons",function(askFor){
        console.log("------------- ASKFOR :");
        console.log(askFor);
        let idPartie=askFor.idPartie;let pseudo=askFor.pseudo;
        let jetonsRestant=null;
        let position = null;
        let aPerdu = false;
        let readyPourEnchere= false;
        let nbJetonsJoues=null;
        let enchereLaPlusForte=null;
        partieEnCours.forEach(function(partie){
            if(partie.getIdPartie()===idPartie){
                jetonsRestant=partie.getJoueurByName(pseudo).getJetons();
                position=partie.getJoueurByName(pseudo).getPositionOnBoard();
                aPerdu=partie.getJoueurByName(pseudo).isPerdant();
                readyPourEnchere=partie.toutLesJoueursOnPoserUnjetonOuNon();
                nbJetonsJoues=partie.getNbDeJetonsPoses();
                enchereLaPlusForte=partie.getEnchereLaPlusForte();
            }
        });

        console.log(jetonsRestant);

        let obj = {
            "idPartie" : idPartie,
            "pseudo" : pseudo,
            "position" : position,
            "jetonsRestant" : jetonsRestant,
            "aPerdu" : aPerdu,
            "readyPourEnchere" : readyPourEnchere,
            "nbJetonsJoues" : nbJetonsJoues,
            "enchereLaPlusForte" : enchereLaPlusForte
        };
        clients[pseudo].emit("returnJetons",obj);
    });

    socket.on("poseUnJeton", function(obj){
        let idPartie=obj.idPartie;let pseudo=obj.pseudo;let pose = obj.pose;
        console.log(obj);
        let joueurSuivant;
        let position;
        let nbJetonsRestant;
        partieEnCours.forEach(function(partie){
            if(partie.getIdPartie()===idPartie){
                let j= partie.getJoueurByName(pseudo);
                j.poserJeton(pose);
                joueurSuivant=partie.auJoueurSuivant();
                position=j.getPositionOnBoard();
                nbJetonsRestant=j.getJetons().length;
            }
        });
        console.log("renvoyer aux joueurs de la partie -> poserJeton");
        let objetAEmit= {
            "idPartie" : idPartie,
            "pseudo" : pseudo,
            "position" : position,
            "nbJetonsRestant": nbJetonsRestant,
            "joueurSuivant":joueurSuivant
        };
        emitToPartie("poserJeton",objetAEmit,idPartie);
    });

    socket.on("proposeEnchere", function(obj){
        let idPartie=obj.idPartie;let pseudo=obj.pseudo;
        //console.log(obj);
        let encherePropose=obj.valeurEnchere;
        let enchereMax=false;

        let joueurSuivant=null;
        let nbJetonsJoues=null;
        let enchereLaPlusForte=null;
        partieEnCours.forEach(function(partie){
            if(partie.getIdPartie()===idPartie){
                if(partie.getNbDeJetonsPoses()===encherePropose){
                    console.log("---encherMax = TRUE");
                    enchereMax=true;
                }
                partie.setEnchereLaPlusForte(pseudo,encherePropose);
                enchereLaPlusForte=partie.getEnchereLaPlusForte();
                nbJetonsJoues=partie.getNbDeJetonsPoses();

                joueurSuivant=partie.auJoueurSuivant();
            }
        });

        if(enchereMax){
            console.log("- enchere max "+pseudo+" doit retrourner les jetons");
            // socket.emit gagneEnchere
            let objetAEmit = {
                "idPartie" : idPartie,
                "pseudo" : pseudo,
                "enchereLaPlusForte" : enchereLaPlusForte
            };
            emitToPartie("gagneEnchere",objetAEmit,idPartie);

            let position = getPositionJoueur(idPartie,pseudo);
            let obj = {
                "idPartie" : idPartie,
                "pseudo" : pseudo,
                "position" : position,
                "nbParis" : enchereLaPlusForte.valeurEnchere
            };
            clients[pseudo].emit("phaseRetourneJetonsPerso",obj);
            return;
        }

        let objetAEmit = {
            "idPartie" : idPartie,
            "pseudo" : pseudo,
            "enchereLaPlusForte" : enchereLaPlusForte,
            "joueurSuivant" : joueurSuivant
        };
        emitToPartie("phaseEnchere",objetAEmit,idPartie);
    });

    socket.on("askEnchere", function(obj){
        let idPartie=obj.idPartie;let pseudo=obj.pseudo;

        let nbJetonsJoues=null;
        let enchereLaPlusForte=null;
        let position=null;
        let aPerdu=null;
        let actif=null;
        partieEnCours.forEach(function(partie){
            if(partie.getIdPartie()===idPartie){
                let j=partie.getJoueurByName(pseudo);
                aPerdu=j.isPerdant();
                actif=j.getActif();
                nbJetonsJoues=partie.getNbDeJetonsPoses();
                enchereLaPlusForte=partie.getEnchereLaPlusForte();
                position=j.getPositionOnBoard();
            }
        });
        let objetAEmit = {
            "idPartie" : idPartie,
            "pseudo" : pseudo,
            "position" : position,
            "nbJetonsJoues" : nbJetonsJoues,
            "enchereLaPlusForte" : enchereLaPlusForte
        };
        if(aPerdu || !actif){
            console.log(pseudo+" a perdu ou est déjà couché.");
            // emit special pour passer direct au joueur suivant
            clients[pseudo].emit("returnEncherePerduOuCouche",objetAEmit);
            return;
        }
        clients[pseudo].emit("returnAskEnchere",objetAEmit);
    });

    socket.on("jeMeCouche", function(obj) {
        let idPartie = obj.idPartie;let pseudo = obj.pseudo;

        let position=null;
        let nbJetonsJoues=null;
        let enchereLaPlusForte=null;
        let joueurSuivant=null;
        let nbJoueurEncoreEnListe=null;
        partieEnCours.forEach(function(partie) {
            if (partie.getIdPartie() === idPartie) {
                let j = partie.getJoueurByName(pseudo);
                j.seCouche();
                position=j.getPositionOnBoard();
                nbJetonsJoues=partie.getNbDeJetonsPoses();
                enchereLaPlusForte=partie.getEnchereLaPlusForte();
                joueurSuivant=partie.auJoueurSuivant();
                nbJoueurEncoreEnListe=partie.getNbJoueursEnListe();
            }
        });

        let objetAEmit = {
            "idPartie" : idPartie,
            "pseudo" : pseudo,
            "position" : position,
            "nbJetonsJoues" : nbJetonsJoues,
            "enchereLaPlusForte" : enchereLaPlusForte,
            "joueurSuivant" : joueurSuivant,
            "nbJoueurEncoreEnListe" : nbJoueurEncoreEnListe
        };

        emitToPartie("seCouche",objetAEmit,idPartie);
    });

    socket.on("skipJoueurEnchere", function(obj) {
        let idPartie = obj.idPartie;let pseudo = obj.pseudo;

        let nbJetonsJoues=null;
        let enchereLaPlusForte=null;
        let joueurSuivant=null;
        partieEnCours.forEach(function(partie) {
            if (partie.getIdPartie() === idPartie) {
                nbJetonsJoues=partie.getNbDeJetonsPoses();
                enchereLaPlusForte=partie.getEnchereLaPlusForte();
                joueurSuivant=partie.auJoueurSuivant();
            }
        });

        let objetAEmit = {
            "idPartie" : idPartie,
            "pseudo" : pseudo,
            "nbJetonsJoues" : nbJetonsJoues,
            "enchereLaPlusForte" : enchereLaPlusForte,
            "joueurSuivant" : joueurSuivant
        };

        emitToPartie("returnSkipEnchere",objetAEmit,idPartie);
    });

    socket.on("gagneEnchereParAbandon",function(obj){
        let pseudo=null;
        let enchereLaPlusForte=null;

        partieEnCours.forEach(function(partie) {
            if (partie.getIdPartie() === obj.idPartie) {
                enchereLaPlusForte=partie.getEnchereLaPlusForte();
                pseudo=enchereLaPlusForte.pseudoJoueur;
            }
        });
        console.log(pseudo+" gagne l'enchere par abandon");

        let objetAEmit = {
            "idPartie" : obj.idPartie,
            "pseudo" : pseudo,
            "enchereLaPlusForte" : enchereLaPlusForte
        };
        emitToPartie("gagneEnchere",objetAEmit,obj.idPartie);

        let position = getPositionJoueur(obj.idPartie,pseudo);
        let toSend = {
            "idPartie" : obj.idPartie,
            "pseudo" : pseudo,
            "position" : position,
            "nbParis" : enchereLaPlusForte.valeurEnchere
        };
        clients[pseudo].emit("phaseRetourneJetonsPerso",toSend);
    });

    socket.on("retourneJeton",function(obj){
        emitToPartie("retourneJeton",obj,obj.idPartie);
    });

    socket.on("jetonRetourne",function(obj){
        console.log("---------- jetonRetourne");
        let position = obj.position;
        let idPartie = obj.idPartie;
        let pseudo = obj.pseudo;
        let nbParis = obj.nbParis;

        let positionJoueur = getPositionJoueur(idPartie,pseudo);
        let j = getJoueurbyPosition(idPartie,position);
        //console.log(j);
        let jeton = j.retourneJeton();
        let jetonsPoses = j.getJetonsPoses();

        if(jeton === "skull"){
            partieEnCours.forEach(function(partie) {
                if (partie.getIdPartie() === obj.idPartie) {
                    partie.setProprietaireDuCrane(pseudo);
                    console.log("proprietaire du crane : "+pseudo);
                }
            });
            emitToPartie("retourneCrane",obj,idPartie);  // emit a tt le monde qu'il a retourné un crane
            //puis emit a celui qui possedait le crane
            return;
        }

        console.log(nbParis);
        nbParis--;
        console.log(nbParis);
        if (nbParis<=0){
            console.log("Fin du retournage");
            let nbJoueurs;
            let posJoueurGagnant;
            partieEnCours.forEach(function(partie){
                if (partie.getIdPartie() === obj.idPartie) {
                    let j = partie.getJoueurByName(partie.getEnchereLaPlusForte().pseudoJoueur);
                    posJoueurGagnant = j.getPositionOnBoard();
                    j.gagneUnPoint();
                    nbJoueurs = partie.getNbJoueurs();
                }
            });
            let objRetour = {
                "idPartie" : idPartie,
                "pseudo" : pseudo,
                "nbJoueurs" : nbJoueurs,
                "position" : posJoueurGagnant
            };
            emitToPartie("gagnePoint",objRetour,idPartie);
            return;
        }

        if(position === positionJoueur){
            console.log("Le joueur tire dans sa pile");
            if(jetonsPoses.length === 0){
                console.log("---Pile vide ----");
                let positions = [];

                partieEnCours.forEach(function(partie){
                    if(partie.getIdPartie()===idPartie){
                        partie.getListeJoueurs().forEach(function(joueur){
                            if(position !== joueur.getPositionOnBoard()){
                                positions.push(joueur.getPositionOnBoard());
                            }
                        });
                    }
                });

                let objAEmit = {
                    "idPartie" : idPartie,
                    "pseudo" : pseudo,
                    "position" : positions,
                    "nbParis" : nbParis
                };

                clients[pseudo].emit("phaseRetourneJetonsAutres",objAEmit);
            }
        }else {
            console.log("Le joueur tire dans une autre pile");
        }
        // tester si il vient de tirer dans une autre pile

    });

    socket.on("prepareNextTurn",function(obj){
        console.log("---------- prepareNextTurn");
        console.log(obj);
        let position=null;
        partieEnCours.forEach(function(partie){
            if(partie.getIdPartie()===obj.idPartie){
                if(obj.joueurGagnantManche!==null){
                    let joueurGagnantLaManche=  partie.getJoueurByName(obj.joueurGagnantManche);
                    if(joueurGagnantLaManche.getNbPoints()===2){
                        let objAEmit= {
                          "idPartie":obj.idPartie,
                          "gagnant":obj.joueurGagnantManche
                        };
                        emitToPartie("gagneLaPartie",objAEmit,obj.idPartie);
                        return;
                    }
                    position=joueurGagnantLaManche.getPositionOnBoard();
                }
                let setUpMancheSuivante = partie.setMancheSuivante();
                console.log(setUpMancheSuivante);
                let toSend = {
                    "idPartie" : obj.idPartie,
                    "pseudo" : obj.joueurGagnantEnchere,
                    "position": position,
                    "nbDeJetonsRestantParJoueur":partie.getNbDeJetonsParJoueur()
                };
                if(!setUpMancheSuivante.dejaSet){ // si le joueur ayant retourner le crane est eliminé
                    toSend.pseudo=setUpMancheSuivante.celuiQuiChoisit;
                    toSend.position=getPositionJoueur(obj.idPartie,setUpMancheSuivante.celuiQuiChoisit);
                    emitToPartie("choixPremierJoueur",toSend,obj.idPartie);
                    return;
                }
                emitToPartie("finPrepareTurn",toSend,obj.idPartie);
            }
        });
    });

    socket.on("returnChoixPremierJoueur",function(obj){
        console.log("---------- returnChoixPremierJoueur");
        let pseudo=getJoueurbyPosition(obj.idPartie,obj.position).getPseudoUtilisateur();
        let nbJetonsParJoueur=null;
        partieEnCours.forEach(function(partie){
            if(partie.getIdPartie()===obj.idPartie){
                partie.setJoueurSuivant(pseudo);
                nbJetonsParJoueur=partie.getNbDeJetonsParJoueur();
            }
        });
        let toSend = {
            "idPartie" : obj.idPartie,
            "pseudo" : pseudo,
            "position": obj.position,
            "nbDeJetonsRestantParJoueur":nbJetonsParJoueur
        };
        emitToPartie("finPrepareTurn",toSend,obj.idPartie);
    });

    function getPositionJoueur(idPartie,pseudo){
        let j = getJoueurbyPseudo(idPartie,pseudo);
        return j.getPositionOnBoard();
    }

    function getJoueurbyPseudo(idPartie,pseudo){
        let retour;
        partieEnCours.forEach(function(partie){
            if(partie.getIdPartie()===idPartie){
                retour = partie.getJoueurByName(pseudo);
            }
        });
        return retour;
    }

    function getJoueurbyPosition(idPartie,position){
        let retour;
        partieEnCours.forEach(function(partie){
            if(partie.getIdPartie()===idPartie){
                partie.getListeJoueurs().forEach(function(joueur){
                    if(joueur.getPositionOnBoard() === position){
                        retour = joueur;
                    }
                });
            }
        });
        return retour;
    }

    function emitToPartie(typeEmit,objetAEmit,idPartie){
        partieEnCours.forEach(function(partie){
            if(partie.getIdPartie()===idPartie){
                partie.getListeJoueurs().forEach(function(joueur){
                    clients[joueur.pseudoUtilisateur].emit(typeEmit,objetAEmit);
                });
            }
        });
    }
});