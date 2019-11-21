"use strict";
// pour attendre le chargement de la page en entière
document.addEventListener('DOMContentLoaded',function(e){
    class Utilisateur {
        constructor(pseudo){
            this.pseudo=pseudo;
            this.listeParties=[];
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
    }
});
