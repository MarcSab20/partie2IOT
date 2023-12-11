## Partir 2

# Table des matières

    Installation de l'appareil
    Utilisation
    Actions du client
    Gestion des groupes
    Enregistrement des événements
    Gestion des erreurs
    Contribution

L'installation des dépendances et l'utilisation de l'appareil ne diffèrent en rien de celles de la partie 1. La nuance apparaie seulement dans le nombre des cas d'utilisation.

# action du client
Les clients peuvent effectuer les actions suivantes :

   ## client hello : 
   Se connecter au serveur et recevoir un message de bienvenue.

   ## Envoyer un message : 
   Envoyer un message direct à un autre client.

   ## Diffuser : 
   Envoyer un message à tous les clients connectés.

   ## Lister les clients : 
   Permet d'obtenir une liste de tous les clients connectés.

   ## Quitter : 
   Se déconnecter du serveur.

   ## Create Group (Créer un groupe) : 
   Créer un nouveau groupe.

   ## Promouvoir un administrateur : 
   Promouvoir un membre d'un groupe en tant qu'administrateur.

   ## Demote Admin : 
   Rétrograder un administrateur à un membre ordinaire.

   ## List Admins (Lister les administrateurs) : 
   Liste les administrateurs d'un groupe.

   ## List Banned Members (Liste des membres bannis) : 
   Liste les membres bannis d'un groupe.

   ## Join Group (Rejoindre un groupe) : 
   Rejoindre un groupe existant.

   ## Diffusion de groupe : 
   Envoyer un message à tous les membres d'un groupe.

   ## Lister les membres d'un groupe : 
   Liste les membres d'un groupe.

   ## Liste des messages du groupe : 
   Liste les messages envoyés dans un groupe.

   ## Liste des groupes : 
   Liste de tous les groupes existants.

   ## Inviter à un groupe : 
   Inviter un autre client dans un groupe.

   ## Kick from Group (exclure d'un groupe) : 
   Expulser un membre d'un groupe.

   ## Quitter le groupe : 
   Quitter un groupe.

   ## Bannir d'un groupe : 
   Bannir un membre d'un groupe.

   ## Unban from Group (débanquer d'un groupe) : 
   Permet de débanquer un membre d'un groupe.

   ## Client States (États des clients) : 
   Permet d'obtenir des informations sur les clients connectés.

   ## Delete Group (Supprimer un groupe) : 
   Permet de supprimer un groupe.

# Gestion des groupes

Le serveur prend en charge:  
la création de groupes, 
la promotion et la révocation des administrateurs, 
la liste des administrateurs et des membres interdits, 
l'adhésion et le départ des groupes, 
l'envoi de messages de groupe, 
l'exlusion et l'éjection dans un groupe.

# Enregistrement des événements

Le serveur enregistre divers événements, tels que les connexions et déconnexions de clients, les créations de groupes, les promotions, les rétrogradations, etc. Le journal des événements est accessible via la console du serveur.

# Gestion des erreurs

Le serveur gère diverses erreurs, telles que les actions non valides, les actions non autorisées et les erreurs liées aux groupes. Les clients reçoivent les messages d'erreur appropriés en cas d'actions infructueuses.

## Constantes et générateurs de messages

Ce module contient des constantes et des générateurs de messages pour un serveur d'application de chat. Il définit diverses actions, telles que l'envoi de messages, la création de groupes et la gestion des membres des groupes.

## Constantes

### Actions du client

- `CLIENT_HELLO` : Action d'accueil du client.
- `SERVER_HELLO` : Action d'accueil du serveur.
- `CLIENT_QUIT` : Action de quitter le client.
- `CLIENT_ERROR` : Action d'erreur du client.
- `CLIENT_SEND` : Action d'envoi du client.
- `CLIENT_BROADCAST` : Action de diffusion du client.
- `CLIENT_LIST_CLIENTS` : Action de listage des clients.

### Actions de groupe

- `CGROUP` : Créer un groupe.
- `JOIN` : Rejoindre un groupe.
- `GBROADCAST` : Action de diffusion du groupe.
- `MEMBERS` : Action de lister les membres d'un groupe.
- `MSGS` : Action de listage des messages du groupe.
- `GROUPS` : Action de la liste des groupes.
- `INVITE` : Action d'invitation à un groupe.
- `KICK` : Action d'expulser d'un groupe.
- `LEAVE` : Quitte l'action de groupe.
- `BAN` : Interdit de participer à une action de groupe.
- `UNBAN` : Se débarrasse d'une action de groupe.
- `STATES` : Action relative aux états des événements du groupe.
- `DELETE` : Action de suppression d'un groupe.

### Actions d'administration

- `PADMIN` : Action de promotion de l'administrateur.
- `PUSER` : Rétrograde l'action de l'administrateur.
- `ADMINS` : Action de lister les administrateurs.
- `BANNED` : Liste des membres bannis.

### Générateurs de messages

- `generateClientHello(username)` : Génère un message d'accueil pour le client.

- `generateServerHello(sender, message, groupName = '')` : Génère un message d'accueil pour le serveur.

- `generateServerError(errorMessage)` : Génère un message d'erreur du serveur.

- `generateClientSend(sender, receiver, message)` : Génère un message d'envoi du client.

- `generateClientBroadcast(sender, message)` : Génère un message de diffusion du client.

- `generateClientListClients(sender)` : Génère un message de liste de clients.

- `generateServerListClients(sender)` : Génère un message de liste de clients : Génère un message de liste de serveurs clients.

- `generateClientQuit(sender)` : Génère un message d'abandon de client.

- `generateClientListGroupMembers(sender, groupName)` : Génère un message de liste de clients membres d'un groupe : Génère un message de liste des membres du groupe du client.

- `generateClientListGroupMessages(sender, groupName)` : Génère un message sur les messages du groupe de la liste des clients.

- `generateClientListGroups(sender)` : Génère un message de liste de groupes de clients.

- `generateClientLeaveGroup(sender, groupName)` : Génère un message de groupe de clients : Génère un message de sortie de groupe de clients.

- `generateClientInvite(sender, groupName, dest)` : Génère un message d'invitation pour un client.

- `generateClientKick(sender, groupName, dest, reason)` : Génère un message de coup de pied au client.

- `generateClientBan(sender, groupName, dest, reason)` : Génère un message de bannissement de client.

- `generateClientUnban(sender, groupName, dest)` : Génère un message de déban du client.

- `generateClientGroupStates(sender, groupName)` : Génère un message d'état de groupe de clients.

- `generateClientCreateGroup(sender, groupName)` : Génère un message d'état de groupe client : Génère un message d'état de groupe client.

- `generateClientPromoteAdmin(sender, groupName, dest)` : Génère un message d'administration de promotion du client.

- `generateClientDemoteAdmin(sender, groupName, dest)` : Génère un message d'administration de rétrogradation de client.

- `generateClientListAdmins(sender, groupName)` : Génère un message de liste d'administrateurs pour un client.

- `generateClientListBanned(sender, groupName)` : Génère un message de bannissement des membres de la liste des clients.

- `generateClientDeleteGroup(sender, groupName)` : Génère un message de suppression de groupe de clients : Génère un message de suppression d'un groupe de clients.

- `generateClientJoinGroup(sender, groupName)` : Génère un message d'adhésion à un groupe de clients : Génère un message de regroupement de clients.

- `generateClientGroupBroadcast(sender, groupName, message)` : Génère un message de diffusion de groupe de clients.


# Auteurs
- [DJOGOUE MARIUS](https://www.github.com/DNMarius)
- [FONGANG MANUELA](https://www.github.com/manuGea6)
- [FOTSO NANA](https://www.github.com/Marcsab20)
- [HAMDJIA](https://www.github.com/Epsilon008)
- [HEUTCHOU](https://www.github.com/teumendimitry)
- [KAMGA FOTSO](https://www.github.com/jevlgx)
- [IHONG STEPHANE](https://www.github.com/SIR160701)
- [MBO ALAIN](https://www.github.com/MAG-ENCRYPTION)
- [MBOUMELA ELTON](https://www.github.com/mboumela-elton)