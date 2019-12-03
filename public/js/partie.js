const Joueur = require('./joueur.js');

class Partie {
    constructor(id,listeUtilisateurs){
        this.id = id;
        this.nbJoueurs = listeUtilisateurs.length;

        this.auTourDuJoueur=Math.floor(Math.random() * Math.floor(this.nbJoueurs));

        // construire liste des joueurs:
        this.listeJoueurs=[];
        //let count=0;
        for (let i=0;i<listeUtilisateurs.length;i++){
            let j = new Joueur(this,listeUtilisateurs[i].pseudo,i);
            this.listeJoueurs.push(j);
            //count++;
        }
    }

    getId(){
        return this.id;
    }

    aQuiLeTour(){
        return this.auTourDuJoueur;
    }

    auJoueurSuivant(){
        this.auTourDuJoueur++;
        return this.aQuiLeTour();
    }

    getUtilisateurByName(name){
        return this.listeUtilisateurs[name];
    }

    getNbJoueurs(){
        return this.nbJoueurs;
    }

    /*getListeUtilisateurs(){
        return this.listeUtilisateurs;
    }*/

    getListeJoueurs(){
        return this.listeJoueurs;
    }
}

module.exports = Partie;