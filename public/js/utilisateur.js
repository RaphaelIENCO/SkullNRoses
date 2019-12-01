const Partie = require('./partie.js');

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

    addPartie(partie){
        this.listeParties.push(partie);
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
