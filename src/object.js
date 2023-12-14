const Op = require('sequelize');

const privateMessages = [];

// Ajouter un message privé
function addPrivateMessages(event) {
  const privateMessage = {
    initiator: event.initiator,
    content: event.content,
    target: event.target,
    eventDate: event.timestamp,
  };
  privateMessages.push(privateMessage);
}

const connexions = [];

function addConnexions(event) {
  const connexion = {
    username: event.initiator,
    connexion_date: event.timestamp,
    deconnexion_date: null, // Initialisez à null lors de la connexion
    event_type: 'connexion_deconnexion',
  };
  connexions.push(connexion);
}

// modification des connexions
function modifyConnexions(event) {
    const existingCon = connexions.findIndex(c => c.username === event.initiator);
      if (existingCon === -1) {
        console.error(`Aucune connexion trouvée pour l'utilisateur ${event.initiator}`);
        return;
      }
  
      // Mettre à jour la date de connexion
      connexions[existingCon].connexion_date = event.timestamp;
  
      console.log(`Date de connexion objet changée avec succès.`);
}
  
// Modification des déconnexion
function modifyDeconnexions(event) {
    const existingDec = connexions.findIndex(c => c.username === event.initiator)
  
      if (existingDec === -1) {
        console.error(`Aucune déconnexion trouvée pour l'utilisateur ${event.initiator}`);
        return;
      }
  
      // Mettre à jour la date de déconnexion
      connexions[existingDec].deconnexion_date= event.timestamp;
  
      console.log(`Date de déconnexions objet changée avec succès.`);
}
  
function getPrivateMessages(username, connexions, privateMessages) {
    try {
        // Trouver la dernière connexion et déconnexion de l'utilisateur
        const lastConnexion = connexions.filter((c) => c.username === username && c.connexion_date).pop();
        const lastDeconnexion = connexions.filter((c) => c.username === username && c.deconnexion_date).pop();
    
        if (!lastConnexion) {
            console.log(`L'utilisateur ${username} n'a pas de connexion enregistrée.`);
            return [];
        }
    
        // Récupérer les messages privés entre la précédente connexion et la précédente déconnexion
        const messagesBetween = privateMessages.filter((message) =>
        message.username === username 
        //&&
        //message.eventDate > (lastDeconnexion ? lastDeconnexion.deconnexion_date : new Date(0)) &&
        //message.eventDate <= lastConnexion.connexion_date
        );
    
        // Mettre à jour l'heure de la dernière connexion
        if (lastConnexion) {
            lastConnexion.connexion_date = new Date();
        }
        return messagesBetween;
    } catch (error) {
        console.error('Erreur lors de la récupération des messages :', error);
        throw error;
    }
}
    
  

module.exports ={
    getPrivateMessages,
    modifyDeconnexions,
    addConnexions,
    addPrivateMessages,
    modifyConnexions,

    connexions, privateMessages
}