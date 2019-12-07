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
        this.enchereLaPlusForte={
            "pseudoJoueur" : null,
            "valeurEnchere" : 0
        };

        this.proprietaireDuCrane=null;

        this.ordreClans = ["cyborgs","jokers","amazons","indians","carnivorous","swallows"];
    }

    setEnchereLaPlusForte(pseudoJoueur,valeur){
        for(let i=0;i<this.listeJoueurs.length;i++){
            if(this.listeJoueurs[i].getPseudoUtilisateur()===pseudoJoueur){
                this.enchereLaPlusForte={
                    "pseudoJoueur" : pseudoJoueur,
                    "valeurEnchere" : valeur
                };
                return true;
            }
        }
        return false;
    }

    setMancheSuivante(){
        let jGagnantEnchere = null;
        for(let i=0;i<this.listeJoueurs.length;i++){
            if(this.listeJoueurs[i].getPseudoUtilisateur()===this.getEnchereLaPlusForte().pseudoJoueur){
                jGagnantEnchere = this.listeJoueurs[i];
            }
            this.listeJoueurs[i].reprendreJetons();
            this.listeJoueurs[i].seReleve();
        }


        let toSend = {
            "dejaSet":true,
            "celuiQuiChoisit":null
        };
        if(!jGagnantEnchere.isPerdant()){ // s'il n'a pas perdu il commence
            this.setJoueurSuivant(jGagnantEnchere.getPseudoUtilisateur());
        }else{ // s'il a perdu le proprietaire du crane designe qq un
            console.log(jGagnantEnchere.getPseudoUtilisateur()+" a perdu la manche donc le proprietaire du crane " +
                this.getProprietaireDuCrane()+" doit designer qui joue en premier");

            toSend.dejaSet=false;
            toSend.celuiQuiChoisit=this.getProprietaireDuCrane();
        }
        return toSend;
    }

    setProprietaireDuCrane(pseudoOrNull){
        this.proprietaireDuCrane=pseudoOrNull;
    }

    getProprietaireDuCrane(){
        return this.proprietaireDuCrane;
    }

    setJoueurSuivant(pseudo){
        for(let i=0;i<this.listeJoueurs.length;i++){
            if(this.listeJoueurs[i].getPseudoUtilisateur()===pseudo){
                this.auTourDuJoueur=i;
            }
        }
    }

    getEnchereLaPlusForte(){
        return this.enchereLaPlusForte;
    }

    getIdPartie(){
        return this.id;
    }

    aQuiLeTour(){
        return this.auTourDuJoueur;
    }

    auJoueurSuivant(){
        let clanDuJoueurDuTourEnCours = this.listeJoueurs[this.auTourDuJoueur].getClan();
        let indexClan = this.ordreClans.indexOf(clanDuJoueurDuTourEnCours);

        let found=false;
        while(!found){
            indexClan=(indexClan+1)%(this.ordreClans.length); // pour le suivant
            for(let i=0;i<this.listeJoueurs.length;i++){
                if(this.listeJoueurs[i].getClan()===this.ordreClans[indexClan]){
                    found=true;
                    this.auTourDuJoueur=i;
                    break;
                }
            }
        }

        // 3 5 1 4 2 6
        console.log("Dans l'array : "+this.auTourDuJoueur+", pseudo : "+
            this.listeJoueurs[this.auTourDuJoueur].pseudoUtilisateur+", position on board : "+
            this.listeJoueurs[this.auTourDuJoueur].getPositionOnBoard());
        return this.aQuiLeTour();
    }

    getJoueurByName(name){
        for(let i=0;i<this.listeJoueurs.length;i++){
            if(this.listeJoueurs[i].getPseudoUtilisateur()===name){
                return this.listeJoueurs[i];
            }
        }
        return false;
    }

    toutLesJoueursOnPoserUnjetonOuNon(){
        for(let i=0;i<this.listeJoueurs.length;i++){
            if(this.listeJoueurs[i].getJetonsPoses().length===0 && !this.listeJoueurs[i].isPerdant()){
                return false;
            }
        }
        return true;
    }

    getNbDeJetonsPoses(){
        let nbJetonsPoses=0;
        for(let i=0;i<this.listeJoueurs.length;i++){
            if(this.listeJoueurs[i].getJetonsPoses()!==0 && !this.listeJoueurs[i].isPerdant()){
                nbJetonsPoses+=this.listeJoueurs[i].getJetonsPoses().length;
            }
        }
        return nbJetonsPoses;
    }

    getNbJoueurs(){
        return this.nbJoueurs;
    }

    getNbJoueursEnListe(){
        let nbJoueurs=0;
        for(let i=0;i<this.listeJoueurs.length;i++){
            if(this.listeJoueurs[i].getActif() && !this.listeJoueurs[i].isPerdant()){
                nbJoueurs++;
            }
        }
        return nbJoueurs;
    }

    getListeJoueurs(){
        return this.listeJoueurs;
    }
}

module.exports = Partie;