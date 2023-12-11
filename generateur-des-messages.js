const { 
  CLIENT_HELLO, 
  SERVER_HELLO, 
  CLIENT_QUIT,  
  CLIENT_ERROR, 
  CLIENT_SEND, 
  CLIENT_BROADCAST, 
  CLIENT_LIST_CLIENTS,

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
  BANNED
} = require('./constantes');

// generateur de hello aux clients
function generateClientHello(username) {
  return {
    from: username,
    action: CLIENT_HELLO,
  };
}

// generateur de hello au serveur
function generateServerHello(sender, message, groupName = '') {
  return {
    from: sender,
    action: SERVER_HELLO,
    msg: message,
    group: groupName,
  };
}

// generateur de message d'erreur serveur
function generateServerError(errorMessage) {
  return {
    code: 500,
    msg: errorMessage,
    action: CLIENT_ERROR,
  };
}

// generateur d'envoi de message
function generateClientSend(sender, receiver, message) {
  return {
    from: sender,
    to: receiver,
    msg: message,
    action: CLIENT_SEND,
  };
}

// generateur de broadcast
function generateClientBroadcast(sender, message) {
    return {
      from: sender,
      msg: message,
      action: CLIENT_BROADCAST,
    };
}

// generateur de liste des clients client
function generateClientListClients(sender) {
    return {
      from: sender,
      action: CLIENT_LIST_CLIENTS,
    };
}

// generateur de liste client serveur
function generateServerListClients(sender) {
    return {
      from: sender,
      action: CLIENT_LIST_CLIENTS,
    };
}

// generateur de deconnexion
function generateClientQuit(sender) {
    return {
      from: sender,
      action: CLIENT_QUIT,
    };
}

// generateur de liste de membres d'un groupe
function generateClientListGroupMembers(sender, groupName) {
  return {
    from: sender,
    group: groupName,
    action: MEMBERS,
  };
}

// generateur de liste des messages d'un groupe
function generateClientListGroupMessages(sender, groupName) {
  return {
    from: sender,
    group: groupName,
    action: MSGS,
  };
}

// generateur de liste des groupes
function generateClientListGroups(sender) {
  return {
    from: sender,
    action: GROUPS,
  };
}

// generateur de deconnexion de groupe
function generateClientLeaveGroup(sender, groupName) {
  return {
    from: sender,
    group: groupName,
    action: LEAVE,
  };
}

// generateur d'invitation
function generateClientInvite(sender, groupName, dest) {
  return {
    from: sender,
    group: groupName,
    dest: dest,
    action: INVITE,
  };
}

// generateur d'éjection d'un membre
function generateClientKick(sender, groupName, dest, reason) {
  return {
    from: sender,
    group: groupName,
    dest: dest,
    reason: reason,
    action: KICK,
  };
}

// generateur d'exclusion
function generateClientBan(sender, groupName, dest, reason) {
  return {
    from: sender,
    group: groupName,
    dest: dest,
    reason: reason,
    action: BAN,
  };
}

// generateur de non-exclusion
function generateClientUnban(sender, groupName, dest) {
  return {
    from: sender,
    group: groupName,
    dest: dest,
    action: UNBAN,
  };
}

// generateur d'événement
function generateClientGroupStates(sender, groupName) {
  return {
    from: sender,
    group: groupName,
    action: STATES,
  };
}

// generateur de création d'un groupe
function generateClientCreateGroup(sender, groupName){
  return {
    from: sender,
    group: groupName,
    action: CGROUP,
  };
}

// generateur de passage d'un membre en administrateur
function generateClientPromoteAdmin(sender, groupName, dest) {
  return {
    from: sender,
    group: groupName,
    dest: dest,
    action: PADMIN, // Action pour promouvoir un membre en administrateur
  };
}

// generateur de rétrogradation d'un administrateur en simple membre
function generateClientDemoteAdmin(sender, groupName, dest) {
  return {
    from: sender,
    group: groupName,
    dest: dest,
    action: PUSER, // Action pour rétrograder un administrateur en simple membre
  };
}

// generateur de liste des administrateurs d'un groupe
function generateClientListAdmins(sender, groupName) {
  return {
    from: sender,
    group: groupName,
    action: ADMINS, // Action pour lister les administrateurs
  };
}

// generateur de liste des membres bannis d'un groupe
function generateClientListBanned(sender, groupName) {
  return {
    from: sender,
    group: groupName,
    action: BANNED, // Action pour lister les membres bannis
  };
}

// generation de suppression de groupe
function generateClientDeleteGroup(sender, groupName){
  return {
    from: sender,
    group: groupName,
    action: DELETE,
  };
}

// generattion de jonction
function generateClientJoinGroup(sender, groupName){
  return {
    from: sender,
    group: groupName,
    action: JOIN,
  };
}

// generation de broadcast de groupe
function generateClientGroupBroadcast(sender, groupName, message){
return {
  from: sender,
  group: groupName,
  msg: message,
  action: GBROADCAST,
};
}

module.exports = {
  generateClientHello,
  generateServerHello,
  generateServerError,
  generateClientSend,
  generateClientBroadcast,
  generateClientListClients,
  generateServerListClients,
  generateClientQuit,

  generateClientListGroupMembers,
  generateClientListGroupMessages,
  generateClientListGroups,
  generateClientLeaveGroup,
  generateClientInvite,
  generateClientKick,
  generateClientBan,
  generateClientUnban,
  generateClientGroupStates,
  generateClientCreateGroup,
  generateClientDeleteGroup,
  generateClientJoinGroup,
  generateClientGroupBroadcast,

  generateClientListAdmins,
  generateClientListBanned,
  generateClientPromoteAdmin,
  generateClientDemoteAdmin
};