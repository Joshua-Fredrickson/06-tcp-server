'use strict';

const net = require('net');
const logger = require('./logger');
const Client = require('./client');
const commands = require('./commands');

const server = module.exports = net.createServer();
let clientPool = [];
const PORT = process.env.PORT; // eslint-disable-line

server.on('connection', (socket) => {
  const client = new Client(socket);
  clientPool.push(client);
  client.socket.write(`
       ____     ___     ___
      |_  _|   |  _|   |   |
        ||     | |_    |  _|
        ||     |   |   | | 
       ^^^^^^^^^^^^^^^^^^^^^
               Chat

            Your screen name is ${client.screenName}.
      ________________________________________________________  
     | @quit - quits TCP Chat                                 |
     | @list - to show all people connected to this TCP Chat  |
     | @dm <name> <message> - direct messages another user    |
     | @screenName <name> - changes your screenName           |
     |________________________________________________________| 
    \n\n`);

  clientPool.map(c => c.socket.write(`\t${client.screenName} has joined the chat.\n`));
  socket.on('data', (data) => {
    const message = data.toString().trim();

    if (message.slice(0, 1) === '@') commands.parse(message, client, clientPool);
    else {
      clientPool.filter(c => c.id !== client.id)
        .map(c => c.socket.write(`${client.screenName}: ${message}\n`));
    }
  });

  socket.on('close', () => {
    clientPool = clientPool.filter(c => c.id !== client.id);
    clientPool.map(c => c.socket.write(`\t${client.screenName} has left the channel.\n`));
  });

  socket.on('error', (err) => {
    logger.log(logger.ERROR, err);
  });
})
  .listen(PORT, () => logger.log(logger.INFO, `Listening on port ${PORT}`));
