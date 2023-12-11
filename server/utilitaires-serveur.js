const { 
  CLIENT_HELLO, 
  CLIENT_SEND, 
  CLIENT_BROADCAST, 
  CLIENT_LIST_CLIENTS,  
  CLIENT_QUIT,

  CGROUP, 
  JOIN,
  GBROADCAST,
  MEMBERS,
  MSGS,
  GROUPS,
  INVITE,
  KICK,
  LEAVE, 
  BAN,
  UNBAN,
  STATES,
  DELETE,

  PADMIN,
  PUSER,
  ADMINS,
  BANNED,
} = require('../constantes');

const { 
  generateServerHello, 
  generateServerError 
} = require('../generateur-des-messages');

const eventHistory = [];
var groups = {};

// fonctioon pour savoir comment se comporter devant une commande ou un simple message
function handleClientMessage(socket, message, clients, groups) {
  switch (message.action) {
    case CLIENT_HELLO:
      handleClientHello(socket, message, clients);
      break;
    case CLIENT_SEND:
      handleClientSend(socket, message, clients);
      break;
    case CLIENT_BROADCAST:
      handleClientBroadcast(socket, message, clients);
      break;
    case CLIENT_LIST_CLIENTS:
      handleClientListClients(socket, message, clients);
      break;
    case CLIENT_QUIT:
      handleClientQuit(socket, message, clients);
      break;
    case CGROUP:
      handleClientCreateGroup(socket, message, clients, groups);
      break;
    case PADMIN:
      handlePromoteAdmin(socket, message, clients, groups);
      break;
    case PUSER:
      handleDemoteAdmin(socket, message, clients, groups);
      break;
    case ADMINS:
      listGroupAdmins(socket, message, clients, groups);
      break;
    case BANNED:
      listBannedMembers(socket, message, clients, groups);
      break;
    case JOIN:
      handleClientJoinGroup(socket, message, clients, groups);
      break;
    case GBROADCAST:
      handleClientGroupBroadcast(socket, message, clients, groups);
      break;
    case MEMBERS:
      listGroupMembers(socket, message, clients, groups);
      break;
    case MSGS:
      listGroupMessages(socket, message, clients, groups);
      break;
    case GROUPS:
      listGroups(socket, message, clients, groups);
      break;
    case INVITE:
      handleClientInvite(socket, message, clients, groups);
      break;
    case KICK:
      handleClientKick(socket, message, clients, groups);
      break;
    case LEAVE:
      handleClientLeaveGroup(socket, message, clients, groups);
      break;
    case BAN:
      handleClientBan(socket, message, clients, groups);
      break;
    case UNBAN:
      handleClientUnban(socket, message, clients, groups);
      break;
    case STATES:
      handleClientStates(socket, message, clients, groups);
      break;
    case DELETE:
      handleClientDeleteGroup(socket, message, clients, groups);
      break;
    default:
      const errorMessage = generateServerError('action inconnue');
      socket.write(JSON.stringify(errorMessage)  + '\n');
      break;
  }
}

// fonction pour saluer le serveur
function handleClientHello(socket, message, clients) {
  const existingClient = clients.find((client) => client.username === message.from);
  if (existingClient) {
    const errorMessage = generateServerError('identifiant déjà recupéré');
    socket.write(JSON.stringify(errorMessage));
  } else {
    const newClient = { username: message.from, socket };
    clients.push(newClient);

    notifyClientsOfConnection(clients, message.from);

    const helloMessage = generateServerHello('Server', `Bienvenue ${message.from}!`);
    socket.write(JSON.stringify(helloMessage) + '\n');

    console.log(`[${message.from}] Connecté`);
    
  }
}

// fonction pour notifier lorsqu'un client se connecte
function notifyClientsOfConnection(clients, newClientUsername) {
  // Envoyer un message à tous les clients connectés (sauf au nouveau client) pour les informer de la nouvelle connexion
  const message = generateServerHello('Server', ` ${newClientUsername} a rejoint le chat.`);
  for (const client of clients) {
    if (client.username !== newClientUsername) {
      client.socket.write(JSON.stringify(message) + '\n');
    }
  }
}

// fonction pour notifier lorsqu'un client se déconnecte
function notifyClientIfDisconnection(clients, disconnectedClientUsername, groups) {
  const message = generateServerHello('Server', `client ${disconnectedClientUsername} a quitté le chat.`);
  for (const client of clients) {
    if(client.username !== disconnectedClientUsername){
      client.socket.write(JSON.stringify(message) + '\n');
    }
  }
}

// fonction pour envoyer un message
function handleClientSend(socket, message, clients) {
  const receiverClient = clients.find((client) => client.username === message.to);
  if (receiverClient) {
    const senderUsername = clients.find((client) => client.socket === socket).username;
    const forwardMessage = generateServerHello(senderUsername, message.msg);
    receiverClient.socket.write(JSON.stringify(forwardMessage));
    const event = {
      type: 'message',
      sender: senderUsername,
      receiver: message.to,
      content: message.msg,
      timestamp: new Date(),
    };
    logEvent(event);
    displayEvents();
  } else {
    const errorMessage = generateServerError(`client ${message.to} pas repertorié`);
    socket.write(JSON.stringify(errorMessage) + '\n');
  }

  
}

// fonction pour faire un broadcast
function handleClientBroadcast(socket, message, clients) {
  const senderUsername = clients.find((client) => client.socket === socket).username;
  const broadcastMessage = generateServerHello(senderUsername, message.msg);
  clients.forEach((client) => {
    if (client.socket !== socket) {
      client.socket.write(JSON.stringify(broadcastMessage) + '\n');
    }
  });

  const event = {
    type: 'broadcast',
    sender: senderUsername,
    content: message.msg,
    timestamp: new Date(),
  };
  logEvent(event);
  displayEvents();
}

// fonction pour lister tous les clients connectés
function handleClientListClients(socket, message, clients) {
  // Vérifier si clients est défini et est un tableau
  if (Array.isArray(clients)) {
    const clientNames = clients.map((client) => client.username);
    const listClientsMessage = generateServerHello('Server', `Les clients connectés sont: ${clientNames.join(', ')}`);
    socket.write(JSON.stringify(listClientsMessage) + '\n');
    const event = {
      type: 'listing des clients',
      requester: message.from,
      timestamp: new Date(),
    };
    logEvent(event);
    displayEvents();
  } else {
    // Gérer le cas où clients n'est pas défini ou n'est pas un tableau
    const errorMessage = generateServerError('Server', 'Erreur');
    socket.write(JSON.stringify(errorMessage) + '\n');
  }

  
}

// fonction pour gérer la deconnexion des clients
function handleClientQuit(socket, message, clients) {
  const disconnectedClient = clients.find((client) => client.socket === socket);
  if (disconnectedClient) {
    clients.splice(clients.indexOf(disconnectedClient), 1);
    console.log(`[${disconnectedClient.username}] Déconnecté`);
    notifyClientIfDisconnection(clients, disconnectedClient.username);
  }
}

// fonction pour créer un groupe
function handleClientCreateGroup(socket, message, clients, groups) {
  const groupName = message.group;
  const creator = message.from;
  
  // Vérifier si le groupe existe déjà
  if (groups[groupName] === undefined) {
    groups[groupName] = { creator: creator, admins: [creator], members: [creator], messages: [], bannedUsers: [] }; 

    const successMessage = generateServerHello('Server', `Le groupe ${groupName} a été créé avec ${creator} comme créateur`);
    socket.write(JSON.stringify(successMessage) + '\n');

    const event = {
      type: 'création-de-groupe',
      creator: creator,
      group: groupName,
      timestamp: new Date(),
    };
    logEvent(event);
    displayEvents();

  } else {
    const responseMessage = generateServerError(`Le groupe ${groupName} existe déjà`);
    socket.write(JSON.stringify(responseMessage) + '\n');
    return; 
  }
}

function handlePromoteAdmin(socket, message, clients, groups) {
  const groupName = message.group;
  const sender = message.from;
  const dest = message.dest;

  // Vérifier si l'utilisateur émetteur est administrateur du groupe
  if (groups[groupName] && groups[groupName].admins.includes(sender)) {
    // Vérifier si le destinataire existe dans le groupe
    if (groups[groupName].members.includes(dest)) {
      // Vérifier si le destinataire n'est pas déjà administrateur
      if (!groups[groupName].admins.includes(dest)) {
        // Promouvoir le destinataire en administrateur
        groups[groupName].admins.push(dest);

        const event = {
          type: 'promotion admin',
          promoter: sender,
          promotee: dest,
          group: groupName,
          timestamp: new Date(),
        };
        logEvent(event);
        displayEvents();

        // Informer le destinataire de sa promotion
        const responseMessage = generateServerHello('Server', `Vous avez été promu administrateur du groupe ${groupName} par ${sender}`);
        const destSocket = clients.find((client) => client.username === dest);
        if (destSocket) {
          destSocket.socket.write(JSON.stringify(responseMessage) + '\n');
        }

        // Informer les membres du groupe de la promotion
        const groupMembers = groups[groupName].members;
        for (const member of groupMembers) {
          const memberSocket = clients.find((client) => client.username === member);
          if (memberSocket && member !== dest) {
            const promoteMessage = generateServerHello(sender, `Le client ${dest} a été promu administrateur du groupe ${groupName}`);
            memberSocket.socket.write(JSON.stringify(promoteMessage) + '\n');
          }
        }
      } else {
        // Destinataire déjà administrateur
        const errorMessage = generateServerError(`Le client ${dest} est déjà administrateur du groupe ${groupName}`);
        socket.write(JSON.stringify(errorMessage) + '\n');
      }
    } else {
      // Destinataire non trouvé dans le groupe
      const errorMessage = generateServerError(`Le client ${dest} n'est pas membre du groupe ${groupName}`);
      socket.write(JSON.stringify(errorMessage) + '\n');
    }
  } else {
    // Émetteur non administrateur du groupe
    const errorMessage = generateServerError(`Vous n'êtes pas administrateur du groupe ${groupName}`);
    socket.write(JSON.stringify(errorMessage) + '\n');
  }
}

// Nouvelle fonction pour gérer la rétrogradation d'un administrateur en simple membre
function handleDemoteAdmin(socket, message, clients, groups) {
  const groupName = message.group;
  const sender = message.from;
  const dest = message.dest;

  // Vérifier si l'utilisateur émetteur est administrateur du groupe
  if (groups[groupName] && groups[groupName].admins.includes(sender)) {
    // Vérifier si le destinataire existe dans le groupe
    if (groups[groupName].members.includes(dest)) {
      // Vérifier si le destinataire est administrateur
      if (groups[groupName].admins.includes(dest)) {
        // Rétrograder le destinataire en simple membre
        groups[groupName].admins = groups[groupName].admins.filter((admin) => admin !== dest);

        const event = {
          type: 'destitution admin',
          demoter: sender,
          demotee: dest,
          group: groupName,
          timestamp: new Date(),
        };
        logEvent(event);
        displayEvents();
        // Informer le destinataire de sa rétrogradation
        const responseMessage = generateServerHello('Server', `Vous avez été rétrogradé en simple membre du groupe ${groupName} par ${sender}`);
        const destSocket = clients.find((client) => client.username === dest);
        if (destSocket) {
          destSocket.socket.write(JSON.stringify(responseMessage) + '\n');
        }

        // Informer les membres du groupe de la rétrogradation
        const groupMembers = groups[groupName].members;
        for (const member of groupMembers) {
          const memberSocket = clients.find((client) => client.username === member);
          if (memberSocket && member !== dest) {
            const demoteMessage = generateServerHello(sender, `Le client ${dest} a été rétrogradé en simple membre du groupe ${groupName}`);
            memberSocket.socket.write(JSON.stringify(demoteMessage) + '\n');
          }
        }
      } else {
        // Destinataire n'est pas administrateur
        const errorMessage = generateServerError(`Le client ${dest} n'est pas administrateur du groupe ${groupName}`);
        socket.write(JSON.stringify(errorMessage) + '\n');
      }
    } else {
      // Destinataire non trouvé dans le groupe
      const errorMessage = generateServerError(`Le client ${dest} n'est pas membre du groupe ${groupName}`);
      socket.write(JSON.stringify(errorMessage) + '\n');
    }
  } else {
    // Émetteur non administrateur du groupe
    const errorMessage = generateServerError(`Vous n'êtes pas administrateur du groupe ${groupName}`);
    socket.write(JSON.stringify(errorMessage) + '\n');
  }
}

// Nouvelle fonction pour lister les administrateurs d'un groupe
function listGroupAdmins(socket, message, clients, groups) {
  const groupName = message.group;
  const sender = message.from;

  // Vérifier si l'utilisateur émetteur est membre du groupe
  if (groups[groupName] && groups[groupName].members.includes(sender)) {
    // Renvoyer la liste des administrateurs
    const adminsList = groups[groupName].admins;
    const responseMessage = generateServerHello('Server', `Liste des administrateurs du groupe ${groupName}: ${adminsList.join(', ')}`);
    socket.write(JSON.stringify(responseMessage) + '\n');
  } else {
    // Émetteur non membre du groupe
    const errorMessage = generateServerError(`Vous n'êtes pas membre du groupe ${groupName}`);
    socket.write(JSON.stringify(errorMessage) + '\n');
  }
}

// Nouvelle fonction pour lister les membres bannis d'un groupe
function listBannedMembers(socket, message, clients, groups) {
  const groupName = message.group;
  const sender = message.from;

  // Vérifier si l'utilisateur émetteur est membre du groupe
  if (groups[groupName] && groups[groupName].members.includes(sender)) {
    // Renvoyer la liste des membres bannis
    const bannedList = groups[groupName].bannedUsers;
    const responseMessage = generateServerHello('Server', `Liste des membres bannis du groupe ${groupName}: ${bannedList.join(', ')}`);
    socket.write(JSON.stringify(responseMessage) + '\n');
  } else {
    // Émetteur non membre du groupe
    const errorMessage = generateServerError(`Vous n'êtes pas membre du groupe ${groupName}`);
    socket.write(JSON.stringify(errorMessage) + '\n');
  }
}


// fonction pour gérer la jonction d'un groupe par un client
function handleClientJoinGroup(socket, message, clients, groups) {
  const groupName = message.group;
  const username = message.from;

  if (groups[groupName] && !groups[groupName].members.includes(username)) {
    groups[groupName].members.push(username);

    // Informer le client qu'il a bien rejoint le groupe
    const responseMessage = generateServerHello('Server', `Vous avez rejoint le groupe ${groupName}`);
    socket.write(JSON.stringify(responseMessage) + '\n');

    // Informer les membres du groupe qu'un nouveau membre a rejoint
    const groupMembers = groups[groupName].members;
    for (const member of groupMembers) {
      const memberSocket = clients.find((client) => client.username === member);
      if (memberSocket && member !== username) {
        const joinMessage = generateServerHello(username, `Le client ${username} a rejoint le groupe ${groupName}`);
        memberSocket.socket.write(JSON.stringify(joinMessage) + '\n');
      }
    }
  } else {
    // Gérer le cas où le groupe n'existe pas ou que le client est déjà membre du groupe
    const errorMessage = generateServerError('Erreur lors de la tentative de rejoindre le groupe');
    socket.write(JSON.stringify(errorMessage) + '\n');
  }
}


// fonction pour faire un broadcast dans un groupe
function handleClientGroupBroadcast(socket, message, clients, groups) {
  const sender = message.from;
  const groupName = message.group;
  const messageText = message.msg;

  if (groups[groupName] && groups[groupName].members.includes(sender)) {
    const groupMembers = groups[groupName].members;
    const groupMessages = groups[groupName].messages;
    groupMessages.push({ sender, message: messageText});


    for (const member of groupMembers) {
      const memberSocket = clients.find((client) => client.username === member);
      if(memberSocket){
        const responseMessage = generateServerHello(sender, messageText);
        memberSocket.socket.write(JSON.stringify(responseMessage) + '\n');
      }
    }
    const event = {
      type: 'broadcast de groupe',
      sender: sender,
      group: groupName,
      content: messageText,
      timestamp: new Date(),
    };
    logEvent(event);
    displayEvents();

  } else {
    const errorMessage = generateServerError(sender, 'pas autorisé');
    socket.write(JSON.stringify(errorMessage) + '\n');
  }

}

// fonction pour lister les membres d'un groupe
function listGroupMembers(socket, message, clients, groups) {
  const groupName = message.group;

  if (groups[groupName] && groups[groupName].members.includes(message.from)) {
    const groupMembers = groups[groupName].members;
    const memberListMessage = generateServerHello('Server', `Les membres du groupe ${groupName} sont : ${groupMembers.join(', ')}`);
    socket.write(JSON.stringify(memberListMessage) + '\n');
    const event = {
      type: 'listing des membres du groupe',
      requester: message.from,
      group: groupName,
      timestamp: new Date(),
    };
    logEvent(event);
    displayEvents();
  } else {
    const errorMessage = generateServerError('Server', `le groupe ${groupName} n'existe pas`);
    socket.write(JSON.stringify(errorMessage) + '\n');
  }
}

// fonction pour lister tous les messages échangés dans un groupe
function listGroupMessages(socket, message, clients, groups) {
  const groupName = message.group;

  if (groups[groupName] && groups[groupName].members.includes(message.from)) {
    const groupMessages = groups[groupName].messages || [];

    if (groupMessages.length > 0) {
      const formattedMessages = groupMessages.map(msg => `[${msg.sender}]: ${msg.message}`);

      const responseMessage = {
        //from: 'Server',
        //action: 'MSGS',
        group: groupName,
        messages: formattedMessages,
      };

      socket.write(JSON.stringify(responseMessage) + '\n');
      const event = {
        type: 'listing de tous les messages',
        requester: message.from,
        group: groupName,
        timestamp: new Date(),
      };
      logEvent(event);
      displayEvents();
    } else {
      const errorMessage = generateServerError('pas de messages dans le groupe');
      socket.write(JSON.stringify(errorMessage) + '\n');
    }
  } else {
    const errorMessage = generateServerError('Pas autorisé à voir les messages du groupe');
    socket.write(JSON.stringify(errorMessage) + '\n');
  }
}

// fonction pour lister tous les groupes
function listGroups(socket, message, clients, groups) {
  const groupNames = Object.keys(groups);
  const groupListMessage = generateServerHello('Server', `Les groupes disponible sont: ${groupNames.join(', ')}`);
  socket.write(JSON.stringify(groupListMessage) + '\n');

  const event = {
    type: 'list_all_groups',
    requester: message.from,
    timestamp: new Date(),
  };
  logEvent(event);
  displayEvents();
}

// fonction pour quitter un groupe 
function handleClientLeaveGroup(socket, message, clients, groups) {
  const groupName = message.group;
  const username = message.from;

  if (groups[groupName] && groups[groupName].members.includes(username)) {
    // Retirer le client du groupe
    groups[groupName].members = groups[groupName].members.filter(member => member !== username);

    // Informer les membres du groupe du départ du client
    const groupMembers = groups[groupName].members;
    for (const member of groupMembers) {
      const memberSocket = clients.find((client) => client.username === member);
      if (memberSocket) {
        const responseMessage = generateServerHello(username, `Le client ${username}  a quitté le groupe ${groupName}`);
        memberSocket.socket.write(JSON.stringify(responseMessage) + '\n');
      }
    }

    const event = {
      type: 'sortie de groupe',
      member: username,
      group: groupName,
      timestamp: new Date(),
    };
    logEvent(event);
    displayEvents();

    const responseMessage = generateServerHello('Server', `Vous avez quitté le groupe  ${groupName}`);
    socket.write(JSON.stringify(responseMessage) + '\n');
  } else {
    const errorMessage = generateServerError(username, `Tu n'es pas membre du groupe ${groupName}`);
    socket.write(JSON.stringify(errorMessage) + '\n');
  }
}

// fonction pour inviter quelqu'un dans un groupe
function handleClientInvite(socket, message, clients, groups) {
  const groupName = message.group;
  const inviter = message.from;
  const invitee = message.dest;

  if (groups[groupName] && groups[groupName].members.includes(inviter) && groups[groupName].admins.includes(inviter)) {
    const inviteeSocket = clients.find((client) => client.username === invitee);
    
    if (inviteeSocket) {
      // Vérifier si le client à inviter est déjà dans le groupe
      if (groups[groupName].members.includes(invitee)) {
        const errorMessage = generateServerError(inviter, `Le client ${invitee} est déjà membre du groupe ${groupName}`);
        socket.write(JSON.stringify(errorMessage) + '\n');
      } else {
        // Ajouter le client à inviter au groupe
        groups[groupName].members.push(invitee);

        const event = {
          type: 'invitation de groupe',
          inviter: inviter,
          invitee: invitee,
          group: groupName,
          timestamp: new Date(),
        };
        logEvent(event);
        displayEvents();

        // Informer le client à inviter qu'il a rejoint le groupe
        const responseMessage = generateServerHello('Server', `Vous avez été invité à rejoindre le groupe ${groupName} par ${inviter}`);
        inviteeSocket.socket.write(JSON.stringify(responseMessage) + '\n');

        // Informer les membres du groupe de l'invitation
        const groupMembers = groups[groupName].members;
        for (const member of groupMembers) {
          const memberSocket = clients.find((client) => client.username === member);
          if (memberSocket && member !== invitee) {
            const inviteMessage = generateServerHello(inviter, `Le client ${invitee} a rejoint le groupe ${groupName}`);
            memberSocket.socket.write(JSON.stringify(inviteMessage) + '\n');
          }
        }

        const successMessage = generateServerHello('Server', `Vous avez invité ${invitee} à rejoindre le groupe ${groupName}`);
        socket.write(JSON.stringify(successMessage) + '\n');
      }
    } else {
      const errorMessage = generateServerError(inviter, `User ${invitee} not found`);
      socket.write(JSON.stringify(errorMessage) + '\n');
    }
  } else {
    const errorMessage = generateServerError(inviter, `You are not a member of group ${groupName}`);
    socket.write(JSON.stringify(errorMessage) + '\n');
  }
}

// fonction pour éjecter un membre hors d'un groupe
function handleClientKick(socket, message, clients, groups) {
  const groupName = message.group;
  const kicker = message.from;
  const kicked = message.dest;
  const reason = message.reason || 'Pas de raisons signalées';

  if (groups[groupName] && groups[groupName].members.includes(kicker) && groups[groupName].admins.includes(kicker)) {
    // Vérifier si le client à expulser est dans le groupe
    if (groups[groupName].members.includes(kicked)) {
      // Retirer le client expulsé du groupe
      groups[groupName].members = groups[groupName].members.filter(member => member !== kicked);

      // Informer le client expulsé qu'il a été exclu du groupe
      const kickedSocket = clients.find((client) => client.username === kicked);
      if (kickedSocket) {
        const kickedMessage = generateServerHello(kicker, `Vous avez été éjecté du groupe ${groupName} par ${kicker}. La raison est: ${reason}`);
        kickedSocket.socket.write(JSON.stringify(kickedMessage) + '\n');
      }

      // Informer les membres du groupe de l'expulsion
      const groupMembers = groups[groupName].members;
      for (const member of groupMembers) {
        const memberSocket = clients.find((client) => client.username === member);
        if (memberSocket && member !== kicked) {
          const kickMessage = generateServerHello(kicker, `Le client ${kicked} a été éjecté du groupe ${groupName}. La raison est: ${reason}`);
          memberSocket.socket.write(JSON.stringify(kickMessage) + '\n');
        }
      }

      const successMessage = generateServerHello('Server', `Vous avez éjecté ${kicked} du groupe ${groupName}`);
      socket.write(JSON.stringify(successMessage) + '\n');

      const event = {
        type: 'éjetion_de_groupe',
        kicker: kicker,
        kicked: kicked,
        group: groupName,
        reason: reason,
        timestamp: new Date(),
      };
      logEvent(event);
      displayEvents();
    } else {
      const errorMessage = generateServerError(kicker, `Le client ${kicked} n'est pas membre du groupe ${groupName}`);
      socket.write(JSON.stringify(errorMessage) + '\n');
    }
  } else {
    const errorMessage = generateServerError(kicker, `Vous n'êtes pas autorisé ${groupName}`);
    socket.write(JSON.stringify(errorMessage) + '\n');
  }
}

// fonction de notification dans un groupe
function notifyGroup(group, clients, sender, message) {
  const groupMembers = group.members;

  for (const member of groupMembers) {
    const memberSocket = clients.find((client) => client.username === member);

    if (memberSocket && member !== sender) {
      const responseMessage = generateServerHello(sender, message);
      memberSocket.socket.write(JSON.stringify(responseMessage) + '\n');
    }
  }
}

// fonction pour exclure quelqu'un d'un groupe
function handleClientBan(socket, message, clients, groups) {
  const groupName = message.group;
  const banner = message.from;
  const banned = message.dest;
  const reason = message.reason || 'Pas de raisons';

  if (groups[groupName] && groups[groupName].members.includes(banner) && groups[groupName].admins.includes(banner)) {
    const bannedSocket = clients.find((client) => client.username === banned);

    if (bannedSocket) {
      // logique d'éjection
      banUser(groupName, banned, reason);
      // Notifier les autres clients de l'éjection
      notifyGroup(groups[groupName], clients, banner, `${banned} a été exclu du groupe. La raison est: ${reason}`);
      const event = {
        type: 'exclusion_de_groupe',
        banner: banner,
        bannedUser: banned,
        group: groupName,
        reason: reason,
        timestamp: new Date(),
      };
      logEvent(event);
      displayEvents();

      const successMessage = generateServerHello('Server', `Vous avez bannis ${banned} du groupe ${groupName}`);
      socket.write(JSON.stringify(successMessage) + '\n');
      groups[groupName].bannedUsers.push(message.dest);
    } else {
      const errorMessage = generateServerError(banner, `Le client ${banned} n'existe pas`);
      socket.write(JSON.stringify(errorMessage) + '\n');
    }
  } else {
    const errorMessage = generateServerError(banner, `Vous n'êtes plus membre du grouoe ${groupName}`);
    socket.write(JSON.stringify(errorMessage) + '\n');
  }
}

function banUser(groupName, targetUsername, reason) {
  const group = groups[groupName];
  if (group) {
    const targetClientIndex = group.members.indexOf(targetUsername);
    if (targetClientIndex !== -1) {
      // logique de la fonction
      group.members.splice(targetClientIndex, 1);
      group.bannedUsers.push({ username: targetUsername, reason });


    } else {
      console.log(`Le client ${targetUsername} n'existe pas dans le groupe ${groupName}`);
    }
  } else {
    console.log(`Le groupe ${groupName} n'existe pas`);
  }
}

// fonction pour la non-exclusion
function handleClientUnban(socket, message, clients, groups) {
  const groupName = message.group;
  const unbanner = message.from;
  const unbannedUser = message.dest;

  if (groups[groupName] && groups[groupName].members.includes(unbanner)) {
    // Logique de la non éjection
    if (unbanUser(groupName, unbannedUser, groups)) {
      // Notifier les autres membres 
      notifyGroup(groups[groupName], clients, `${unbannedUser} a été repris.`);

      const unbanEvent = {
        type: 'non-exclusion',
        initiator: unbanner,
        target: unbannedUser,
        timestamp: new Date().toISOString(),
      };
      logEvent(unbanEvent);
      displayEvents();

      const successMessage = generateServerHello('Server', `Vous avez repris ${unbannedUser} du groupe ${groupName}`);
      socket.write(JSON.stringify(successMessage) + '\n');
      const bannedUserIndex = groups[groupName].bannedUsers.findIndex(user => user === message.dest);

      if (bannedUserIndex !== -1) {
        groups[groupName].bannedUsers.splice(bannedUserIndex, 1);
      }
    } else {
      const errorMessage = generateServerError(unbanner, `Le client ${unbannedUser} n'est plus exclu du groupe ${groupName}`);
      socket.write(JSON.stringify(errorMessage) + '\n');
    }
  } else {
    const errorMessage = generateServerError(unbanner, `Tu n'es pas membre du grouoe ${groupName}`);
    socket.write(JSON.stringify(errorMessage) + '\n');
  }
}

function unbanUser(groupName, targetUsername, groups) {
  const group = groups[groupName];

  if (group && group.bannedUsers) {
    const bannedUserIndex = group.bannedUsers.findIndex(user => user.username === targetUsername);
    if (bannedUserIndex !== -1) {
      
      const unbannedUsername = group.bannedUsers.splice(bannedUserIndex, 1)[0];
      group.members.push(unbannedUsername);

      notifyGroup(groups[groupName], clients, `${targetUsername} a été repris`);
      return true;
    } else {
      console.log(`Le client ${targetUsername} ne fait pas partir des bannis du groupe ${groupName}`);
      return false;
    }
  } else {
    console.log(`Le groupe ${groupName} n'existe pas ou ne contient pas les propriétés 'bannedUsers' `);
    return false;
  }
}

// fonction pour supprimer un groupe
function deleteGroup(groupName, groups) {
  // Vérifier si le groupe existe
  if (groups[groupName]) {
    const groupMembers = groups[groupName].members;
    // Supprimer le groupe
    delete groups[groupName];
    
    const deleteGroupEvent = {
      type: 'suppression de groupe',
      initiator: '', // Mettez l'initiateur approprié ici, par exemple, celui qui a supprimé le groupe
      target: groupName,
      timestamp: new Date().toISOString(),
    };
    logEvent(deleteGroupEvent);
    displayEvents();
    
    // Retourner la liste des membres du groupe
    return groupMembers;
  } else {
    // Si le groupe n'existe pas, retourner une liste vide
    return [];
  }
}

function handleClientDeleteGroup(socket, message, clients, groups) {
  const groupName = message.group;
  const deleter = message.from;

  if (groups[groupName] && groups[groupName].members.includes(deleter)) {
    // Récupérer la liste des membres avant la suppression
    const deletedMembers = deleteGroup(groupName, groups);

    // Informer les membres du groupe de la suppression
    for (const member of deletedMembers) {
      const memberSocket = clients.find((client) => client.username === member);
      if (memberSocket) {
        const deleteMessage = generateServerHello('Server', `Le groupe ${groupName} a été supprimé par ${deleter}`);
        memberSocket.socket.write(JSON.stringify(deleteMessage) + '\n');
      }
    }
  } else {
    const errorMessage = generateServerError(deleter, `Tu n'es plus membre du groupe ${groupName}`);
    socket.write(JSON.stringify(errorMessage) + '\n');
  }
}


// Fonction pour obtenir l'historique des événements d'un groupe
function getGroupEventHistory(groupName, groups) {
  const groupEvents = eventHistory.filter(event => event.group === groupName);
  return groupEvents;
}

// Modifier votre gestionnaire handleClientStates
function handleClientStates(socket, message, clients, groups) {
  const groupName = message.group;
  const requester = message.from;

  if (groups[groupName] && groups[groupName].members.includes(requester)) {
    // Perform group events listing logic
    const events = getGroupEventHistory(groupName, groups);

    if (events.length > 0) {
      console.log(`Found events for group ${groupName}:`, events);
      const responseMessage = {
        from: 'Server',
        action: 'STATES',
        group: groupName,
        events,
      };
      socket.write(JSON.stringify(responseMessage) + '\n');
    } else {
      const errorMessage = generateServerError('No events in the group history');
      socket.write(JSON.stringify(errorMessage) + '\n');
    }
  } else {
    const errorMessage = generateServerError(requester, `You are not a member of group ${groupName}`);
    socket.write(JSON.stringify(errorMessage) + '\n');
  }
}


// Une fonction de journalisation
function logEvent(event) {
  eventHistory.push(event);
}

// afficher les événements
function displayEvents() {
  console.log('--- événement effectué ---');
  for (const event of eventHistory) {
    console.log(`${event.type} at ${event.timestamp}: ${JSON.stringify(event)}`);
  }
  console.log('----------------------');
}

module.exports = {
  handleClientMessage,
  notifyClientsOfConnection,
  notifyClientIfDisconnection,
  handleClientSend,
  handleClientBroadcast,
  handleClientListClients,
  handleClientQuit,
  handleClientHello,

  handleClientCreateGroup,
  handleClientJoinGroup,
  handleClientLeaveGroup,
  handleClientGroupBroadcast,
  handleClientInvite,
  handleClientKick,
  handleClientBan,
  handleClientStates,
  handleClientUnban,
  handleClientDeleteGroup,

  handlePromoteAdmin, 
  handleDemoteAdmin, 
  listGroupAdmins,
  listBannedMembers
};
