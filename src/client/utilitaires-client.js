const { 
  SERVER_HELLO, 
  CLIENT_ERROR, 
  CLIENT_LIST_CLIENTS, 
  CLIENT_QUIT,
} = require('../constantes');

// fonction qui va gérer les différents messages client
function handleMessage(message) {
  switch (message.action) {
    case SERVER_HELLO:
      console.log(`[${message.from}]: ${message.msg}`);
      break;
    case CLIENT_ERROR:
      console.log(`Error: ${message.msg}`);
      break;
    case CLIENT_LIST_CLIENTS:
      console.log(message.msg);
      break;
    case CLIENT_QUIT:
      console.log(`[${message.from}]: ${message.msg}`);
      break;
    default:
      console.log(`message inconnu venant de : ${JSON.stringify(message)}`);
      break;
  }
}





module.exports = {
  handleMessage
};