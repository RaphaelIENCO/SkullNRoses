//const Partie = require('./partie.js');

class Utilisateur {
    constructor(pseudo){
        this.pseudo=pseudo;
        this.listeParties=[];
        this.connect=true;
    }

    getPseudo(){
        return this.pseudo;
    }

    getListeParties(){
        return this.listeParties;
    }

    addIdPartie(idPartie){
        this.listeParties.push(idPartie);
    }

    removePartie(partie){

    }

    deconnexion(){
        this.connect=false;
    }

    getConnect(){
        return this.connect;
    }
}
module.exports = Utilisateur;
