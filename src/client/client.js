const net = require('net');
const readline = require('readline');
const yargs = require('yargs');
const { 
    generateClientHello, 
    generateClientSend, 
    generateClientBroadcast, 
    generateClientListClients, 
    generateClientQuit, 
    generateServerError,

    generateClientCreatePrivateGroup,
    generateClientCreatePublicGroup,
    generateClientJoinGroup,
    generateClientGroupBroadcast,
    generateClientListGroupMembers,
    generateClientListGroupMessages,
    generateClientListGroups,
    generateClientLeaveGroup,
    generateClientKick,
    generateClientInvite,
    generateClientBan,
    generateClientUnban,
    generateClientGroupStates,
    generateClientDeleteGroup,

    generateClientDemoteAdmin, 
    generateClientListAdmins, 
    generateClientPromoteAdmin,
    generateClientListBanned

} = require('../generateur-des-messages');
const { handleMessage } = require('./utilitaires-client');

const argv = yargs.option('port', {
    alias: 'p',
    description: 'le port',
    type: 'number',
    default: 8080,
  }).option('host', {
    alias: 'h',
    description: 'le host',
    type: 'string',
    default: '127.0.0.1',
  }).option('username', {
    alias: 'u',
    description: 'le nom du client',
    type: 'string',
    demandOption: true,
  }).argv;

// création du client

const client = net.createConnection({ port: argv.port, host: argv.host }, () => {
  const helloMessage = generateClientHello(argv.username);
  client.write(JSON.stringify(helloMessage));
});

client.on('error', (err) => {
  console.error('Client error:', err.message);
});

// gestion des entrées

client.on('data', (data) => {
    const messages = data.toString().split('\n').filter(Boolean);
    for (const message of messages) {
        const parsedMessage = JSON.parse(message);
        handleMessage(parsedMessage);
    }
});


// récupérer les informations
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// si le client tape ctrl-c pour quitter
process.on('SIGINT', () => {
  const quitCommand = generateClientQuit(argv.username);
  client.write(JSON.stringify(quitCommand) + '\n');
  rl.close();
});

// orienter le serveur à adopter une certaine position face aux entrées du client
rl.on('line', (input) => {
  const command = input.trim();

  if (command.startsWith('s ')) {
    const parts = command.split(' ');
    const receiver = parts[1];
    const message = parts.slice(2).join(' ');
    const sendCommand = generateClientSend(argv.username, receiver, message);
    client.write(JSON.stringify(sendCommand) + '\n');
  } else if (command.startsWith('b ')) {
      const message = command.slice(2);
      const broadcastCommand = generateClientBroadcast(argv.username, message);
      client.write(JSON.stringify(broadcastCommand) + '\n');
  } else if (command === 'ls') {
      const listClientsCommand = generateClientListClients(argv.username);
      client.write(JSON.stringify(listClientsCommand) + '\n');
  } else if (command === 'q') {
      const quitCommand = generateClientQuit(argv.username);
      client.write(JSON.stringify(quitCommand) + '\n');
      rl.close();
  } else if (command.startsWith('cg ')) {
        const parts = command.split(' ');
        let groupType = parts[1]; // 'private', 'public', or undefined
        const groupName = parts.slice(2).join(' ');

        // Si le type de groupe n'est pas défini, par défaut à 'private'
        if (!groupType || (groupType !== 'private' && groupType !== 'public')) {
        groupType = 'private';
        }

        // Envoyer la commande de création de groupe au serveur
        const createGroupCommand = groupType === 'private'
        ? generateClientCreatePrivateGroup(argv.username, groupName)
        : generateClientCreatePublicGroup(argv.username, groupName);

        client.write(JSON.stringify(createGroupCommand) + '\n');
  } else if (command.startsWith('j ')) {
      const groupName = command.slice(2);
      const joinGroupCommand = generateClientJoinGroup(argv.username, groupName);
      client.write(JSON.stringify(joinGroupCommand) + '\n');
  } else if (command.startsWith('bg ')) {
      const parts = command.split(' ');
      const groupName = parts[1];
      const message = parts.slice(2).join(' ');
      const broadcastToGroupCommand = generateClientGroupBroadcast(argv.username, groupName, message);
      client.write(JSON.stringify(broadcastToGroupCommand) + '\n');
  } else if (command.startsWith('members ')) {
      const groupName = command.slice(8);
      const listMembersCommand = generateClientListGroupMembers(argv.username, groupName);
      client.write(JSON.stringify(listMembersCommand) + '\n');
  } else if (command.startsWith('messages ')) {
      const groupName = command.slice(9);
      const listMessagesCommand = generateClientListGroupMessages(argv.username, groupName);
      client.write(JSON.stringify(listMessagesCommand) + '\n');
  } else if (command === 'groups') {
      const listGroupsCommand = generateClientListGroups(argv.username);
      client.write(JSON.stringify(listGroupsCommand) + '\n');
  }else if (command.startsWith('invite ')) {
      const parts = command.split(' ');
      const groupName = parts[1];
      const invitee = parts[2];
      const inviteCommand = generateClientInvite(argv.username, groupName, invitee);
      client.write(JSON.stringify(inviteCommand) + '\n');
  } else if (command.startsWith('kick ')) {
      const parts = command.split(' ');
      const groupName = parts[1];
      const kicked = parts[2];
      const reason = parts.slice(3).join(' ') || 'No reason provided';
      const kickCommand = generateClientKick(argv.username, groupName, kicked, reason);
      client.write(JSON.stringify(kickCommand) + '\n');
  } else if (command.startsWith('leave ')) {
      const groupName = command.slice(6);
      const leaveGroupCommand = generateClientLeaveGroup(argv.username, groupName);
      client.write(JSON.stringify(leaveGroupCommand) + '\n');
  } else if (command.startsWith('ban ')) {
      const parts = command.split(' ');
      const groupName = parts[1];
      const dest = parts[2];
      const reason = parts.slice(3).join(' ') || 'No reason provided';
      const banCommand = generateClientBan(argv.username, groupName, dest, reason);
      client.write(JSON.stringify(banCommand) + '\n');
  } else if (command.startsWith('unban ')) {
      const parts = command.split(' ');
      const groupName = parts[1];
      const dest = parts[2];
      const unbanCommand = generateClientUnban(argv.username, groupName, dest);
      client.write(JSON.stringify(unbanCommand) + '\n');
  } else if (command.startsWith('dg ')) {
      const groupName = command.slice(3);
      const deleteGroupCommand = generateClientDeleteGroup(argv.username, groupName);
      client.write(JSON.stringify(deleteGroupCommand) + '\n');
  } else if (command.startsWith('states ')) {
      const groupName = command.slice(7);
      const groupStatesCommand = generateClientGroupStates(argv.username, groupName);
      client.write(JSON.stringify(groupStatesCommand) + '\n');
  } else if (command.startsWith('padmin ')) {
        const parts = command.split(' ');
        const groupName = parts[1];
        const username = parts[2];
        const promoteAdminCommand = generateClientPromoteAdmin(argv.username, groupName, username);
        client.write(JSON.stringify(promoteAdminCommand) + '\n');
  } else if (command.startsWith('puser ')) {
        const parts = command.split(' ');
        const groupName = parts[1];
        const username = parts[2];
        const demoteAdminCommand = generateClientDemoteAdmin(argv.username, groupName, username);
        client.write(JSON.stringify(demoteAdminCommand) + '\n');
  } else if (command.startsWith('admins ')) {
        const groupName = command.slice(7);
        const listAdminsCommand = generateClientListAdmins(argv.username, groupName);
        client.write(JSON.stringify(listAdminsCommand) + '\n');
  } else if (command.startsWith('banned ')) {
        const groupName = command.slice(7);
        const listBannedCommand = generateClientListBanned(argv.username, groupName);
        client.write(JSON.stringify(listBannedCommand) + '\n');
  } else{
      console.log('Commande inconnue');
  }
});
