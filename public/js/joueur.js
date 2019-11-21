class Joueur{
    constructor(partie,utilisateur, clan){
        this.partie=partie;
        this.utilisateur=utilisateur;
        this.clan=clan;
    }

    getUtilisateur(){
        return this.utilisateur;
    }

    getPartie(){
        return this.partie;
    }

    getClan(){
        return this.clan;
    }
}

const clan = {
    AMAZONS: 'amazons',
    CYBORGS: 'cyborgs',
    INDIANS: 'indians',
    JOKERS: 'jokers',
    CARNIVOROUS:'carnivorous'
};

module.exports = Joueur;