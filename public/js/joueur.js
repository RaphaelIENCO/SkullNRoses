const clan = {
    0: 'amazons',
    1: 'carnivorous',
    2: 'cyborgs',
    3: 'indians',
    4: 'jokers',
    5: 'swallows'
};

class Joueur{
    constructor(partie,pseudoUtilisateur, numClan){
        this.idPartie=partie.id;
        this.pseudoUtilisateur=pseudoUtilisateur;
        this.clan=clan[numClan];
        this.actif=true;
        this.perdant=false;
        this.positionOnBord=numClan+1;

        this.jetons=["roses","roses","roses","skull"];
        this.jetonsPoses=[];
    }

    getPseudoUtilisateur(){return this.pseudoUtilisateur;}

    getPositionOnBoard(){return this.positionOnBord;}

    getIdPartie(){return this.idPartie;}

    getJetonsPoses(){return this.jetonsPoses;}

    getJetons(){return this.jetons;}

    poserJeton(type){
        for(let i =0;i<this.jetons.length;i++){
            if(this.jetons[i]===type){
                this.jetonsPoses.push(this.jetons.splice(i,1)[0]);
                return true;
            }
        }
        return false;
    }

    reprendreJetons(){
        this.jetons=this.jetons.concat(this.jetonsPoses);
        this.jetonsPoses=[];
    }

    removeJeton(type){
        for(let i =0;i<this.jetons.length;i++){
            if(this.jetons[i]===type){
                this.jetons.splice(i,1);
                return true;
            }
        }
        return false;
    }

    hasRoses(){
        this.jetons.forEach(function(jeton){
           if (jeton==="roses"){return true;}
        });
        return false;
    }

    seCouche(){this.actif=false;}

    getActif(){return this.actif;}

    aPerdu(){this.perdant=true;}

    isPerdant(){return this.perdant;}

    getClan(){return this.clan;}
}
module.exports = Joueur;