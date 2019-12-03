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

    removePartie(idPartie){
        for (let i=0;i<this.listeParties.length;i++){
            if(idPartie===this.listeParties[i]){
                this.listeParties.splice(i,1);
                return true;
            }
        }
        return false;
    }

    deconnexion(){
        this.connect=false;
    }

    getConnect(){
        return this.connect;
    }
}
module.exports = Utilisateur;
