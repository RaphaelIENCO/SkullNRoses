const Joueur = require('./joueur.js');

class Partie {
    constructor(id,listeUtilisateurs){
        this.id = id;
        this.nbJoueurs = listeUtilisateurs.length;

        //this.auTourDuJoueur=Math.floor(Math.random() * Math.floor(this.nbJoueurs));
        this.auTourDuJoueur=2;
        // construire liste des joueurs:
        this.listeJoueurs=[];
        //let count=0;
        for (let i=0;i<listeUtilisateurs.length;i++){
            let j = new Joueur(this,listeUtilisateurs[i].pseudo,i);
            this.listeJoueurs.push(j);
            //count++;
        }
    }

    getIdPartie(){
        return this.id;
    }

    aQuiLeTour(){
        return this.auTourDuJoueur;
    }

    auJoueurSuivant(){
        this.auTourDuJoueur++;
        return this.aQuiLeTour();
    }

    getJoueurByName(name){
        console.log(name);
        for(let i=0;i<this.listeJoueurs.length;i++){
            console.log("joueur : "+this.listeJoueurs[i].getPseudoUtilisateur());
            if(this.listeJoueurs[i].getPseudoUtilisateur()===name){
                return this.listeJoueurs[i];
            }
        }
        return false;
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