const Joueur = require('./joueur.js');

class Partie {
    constructor(id,listeUtilisateurs){
        this.id = id;
        this.listeUtilisateurs = listeUtilisateurs;
        this.nbJoueurs = listeUtilisateurs.length;

        // construire liste des joueurs:
        this.listeJoueurs=[];
        //let count=0;
        for (let i=0;i<listeUtilisateurs.length;i++){
            let j = new Joueur(this,listeUtilisateurs[i],i);
            this.listeJoueurs.push(j);
            //count++;
        }
    }

    getId(){
        return this.id;
    }

    getUtilisateurByName(name){
        return this.listeUtilisateurs[name];
    }

    getNbJoueurs(){
        return this.nbJoueurs;
    }

    getListeUtilisateurs(){
        return this.listeUtilisateurs;
    }

    getListeJoueurs(){
        return this.listeJoueurs;
    }
}

module.exports = Partie;