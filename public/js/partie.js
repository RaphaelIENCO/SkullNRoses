class Partie {
    constructor(id,listeUtilisateurs){
        this.id = id;
        this.listeUtilisateurs = listeUtilisateurs;
        this.nbJoueurs = listeUtilisateurs.length;
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
}

module.exports = Partie;