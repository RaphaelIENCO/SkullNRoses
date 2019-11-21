# SkullNRoses
Implémentation du jeu Skull N Roses en Javascript.

#Fonctionnalité à implémenter
- invitation joueurs à une partie et ce joueur peut demarrer la partie
    - salle d'attente : juste visible par l'hôte de la partie
        - le joueur ayant reçu l'invitation peut continuer d'en accepter d'autre ou de créer d'autre 
        parties
        - le joueur ayant reçu l'invit sera informé si la partie est annulée sinon la partie se lance chez lui.
    - si l'hote appuye sur "annuler" la partie est annulé, il doit donc rester sur l'onglet de création de partie.
    S'il annule la partie un message est envoyé a tout ceux "dans" la salle d'attente
    - demarre la partie avec nbr de joueurs ayant rejoint (mais pas tout seul)

- lancer la partie (adapter l'affichage en fct du nbr de joueur)
- implementer le jeu 
    - chat contenant que les joueurs de cette partie
    - 
    - un joueur qui quitte est remplacé par une IA basique
    
    
# Les classes
- Partie
    - liste d'utilisateurs
- Utilisateur (pour def son identité avec son socket, liste de partie en cours etc)
    - un id (pseudo) 
    - ? le socket ?
    - liste de partie
- Une classe Joueur (amazon, ...)
    - un joueur
    - un type (amazon, carnivorous, cyborgs, indians, etc) : ou sans ? juste le nom de la variable
    - une image

# Piste de développement
Une classe joueur pour definir son "identité" avec son pseudo etc :
- attributs: pseudo, un tableau de parties 
- blabla
    
Une classe pour le gamer (amazons, carnivorous, cyborgs, indians, jokers, swallows)
- attributs: une partie, un joueur, une image



