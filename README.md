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
    - Ajouter onglet dans la navbar avec un listner lancant le div de jeu concerné
- implementer le jeu 
    - chat contenant que les joueurs de cette partie
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

# Bogues trouvés
    
- Si l'hote envoie une invitation de partie a un joueur et que celui-ci ne fait rien, lorsque 
l'hote annule la partie le joueur ne reçoit pas le "Bob a annulé la partie". Il peut alors toujours 
accepté la partie ET si il accepte il est ajouté a la file d'attente
    ==== CORRIGE

- Bogue lors de la création d'une 2eme partie la file d'attente n'est pas update
et lors de la création de la partie les utilisateurs de la 1ere partie (homris l'hote)
sont mis dedans ================ CORRIGE

# Rapport de bogues "importants"

- Lors de l'ajout d'une partie à un utilisateur. Si on ajoute un objet partie dans l'utilisateur
comme il y a déjà beaucoup d'objet dans un objet partie DONT l'utilisateur cela crée une boucle infini
en mémoire (recursion d'objet). On aura en mémoire par exemple (version simplifier) : 
[ obj Utilisateur :
    - idUtil, ....
    - listeParties = [
        obj Partie :
            - idPartie, ....
            - listeUtilisateurs = [
                obj Utilisateur :
                    - idUtil, ....
                    - liste Partie = [
                        obj Partie :
                            - idPartie, ...
                            - listeUtilisateurs = [
                                ..... A L INFINI
                            ]
                    ]
            ]
    ]
] 
========== Pour empecher cette boucle infini j'ai stocker uniquement les id des parties dans listeParties
le message d'erreur était le suivant :
buffer.js:424 return b instanceof Buffer;
RangeError: Maximum call stack size exceeded
========== l'erreur vient lors de l'envoie de la socket qui est trop grande
========== pour voir le problème on print l'objet dans le terminal du serveur si l'objet apparait en [circular] c'est
que l'objet s'appelle lui même (voir exemple de la recursion d'objet ci-dessus) 