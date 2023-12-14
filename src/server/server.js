const net = require('net');
const yargs = require('yargs');
const { handleClientMessage, notifyClientIfDisconnection } = require('./utilitaires-serveur');
const sqlite3 = require('sqlite3').verbose();
const groups = {};
const clients = [];
const infini =[];

const argv = yargs.option('port', {
    alias: 'p',
    describe: 'Port',
    default: 3000,
  }).option('host', {
    alias: 'h',
    describe: 'Host',
    default: 'localhost',
  }).argv;

  // creation d'un serveur
const server = net.createServer((socket) => {
  socket.setEncoding('utf8');

  socket.on('data', (data) => {
    const messages = data.toString().split('\n').filter(Boolean);
    for (const message of messages) {
      const parsedMessage = JSON.parse(message);
      handleClientMessage(socket, parsedMessage, infini, clients, groups);
    }
  });

  socket.on('end', () => {
    const disconnectedClient = clients.find((client) => client.socket === socket);
    if (disconnectedClient) {
      clients.splice(clients.indexOf(disconnectedClient), 1);
      console.log(`[${disconnectedClient.username}] Déconnecté`);
      notifyClientIfDisconnection(clients, disconnectedClient.username);
    }
  });
});

server.on('error', (err) => {
  console.error('Server error:', err);
  server.close();
});

server.listen(argv.port, argv.host, () => {
  console.log(`Le serveur écoute sur ${argv.host}:${argv.port}`);
});