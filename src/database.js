const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('main.db');

const { Sequelize, DataTypes, Op} = require('sequelize');

// Création de la table pour stocker les messages privées
db.run(`
  CREATE TABLE IF NOT EXISTS private_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    content TEXT,
    receiver TEXT,
    eventDate DATETIME DEFAULT CURRENT_TIMESTAMP
  )
` , (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table private_messages:', err.message);
    } else {
      console.log('Table private_messages créée avec succès.');
    }
}); 


// Création de la table pour stocker les messages de groupe 
db.run(`
  CREATE TABLE IF NOT EXISTS group_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    groupName TEXT,
    content TEXT,
    eventDate DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Erreur lors de la création de la table group_messages:', err.message);
  } else {
    console.log('Table group_messages créée avec succès.');
  }
});

// création de la table événement de groupe
db.run(`
  CREATE TABLE IF NOT EXISTS group_event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    groupName TEXT,
    event_type TEXT,
    target TEXT,
    reason TEXT,
    eventDate DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Erreur lors de la création de la table group_event:', err.message);
  } else {
    console.log('Table group_event créée avec succès.');
  }
});

// création de la table des groupes

db.run(`
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    groupName TEXT,
    nature TEXT,
    creator TEXT,
    admins_number TEXT,
    banned_number TEXT,
    eventDate DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Erreur lors de la création de la table groups:', err.message);
  } else {
    console.log('Table groups créée avec succès.');
  }
});

// création de la table des Connexions

db.run(`
  CREATE TABLE  IF NOT EXISTS connexion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    connexion_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    deconnexion_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    event_type TEXT
  )
`, (err) => {
  if (err) {
    console.error('Erreur lors de la création de la table connexion:', err.message);
  } else {
    console.log('Table connexion créée avec succès.');
  }
});

// ajouter une connexion
function addConnexion(event) {
  db.run(`
    INSERT INTO connexion (username, connexion_date, deconnexion_date, event_type)
    VALUES (?, ?, ?, ?)
  `, [event.initiator, event.timestamp, null, 'connexion_deconnexion'], (err) => {
    if (err) {
      console.error('Error inserting connexion into database:', err.message);
    }
  });
}

// création de la table des événements
db.run(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    initiator TEXT,
    event_type TEXT,
    target TEXT,
    eventDate DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Erreur lors de la création de la table events:', err.message);
  } else {
    console.log('Table events créée avec succès.');
  }
});

// db.run(`
//     ALTER TABLE events
//     RENAME COLUMN sender TO initiator
// `, (err) => {
//     if (err) {
//       console.error('Erreur lors de la modification de la table event:', err.message);
//     } else {
//       console.log('Table events modifiée avec succès.');
//     }
// });


// fonction pour insérer dans chaque table

function addPrivateMessage(event) {
    db.run(`
      INSERT INTO private_messages (initiator, content, target, eventDate)
      VALUES (?, ?, ?, ?)
    `, [event.initiator, event.content, event.target, event.timestamp], (err) => {
      if (err) {
        console.error('Error inserting private message into database:', err.message);
      }
    });
}

function addGroupMessage(event) {
    db.run(`
      INSERT INTO group_messages (initiator, groupName, content, eventDate)
      VALUES (?, ?, ?, ?)
    `, [event.initiator, event.group, event.content, event.timestamp], (err) => {
      if (err) {
        console.error('Error inserting group message into database:', err.message);
      }
    });
}

function addGroupEvent(event) {
    db.run(`
      INSERT INTO group_event (initiator, groupName, event_type, target, eventDate)
      VALUES (?, ?, ?, ?, ?)
    `, [event.initiator, event.group, event.type, event.target, event.timestamp], (err) => {
      if (err) {
        console.error('Error inserting group event into database:', err.message);
      }
    });
}

function addGroup(event) {
    db.run(`
      INSERT INTO groups (groupName, nature, creator, admins_number, banned_number, eventDate)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [event.group, event.nature, event.creator, event.nb_admins, event.nb_banned, event.timestamp], (err) => {
      if (err) {
        console.error('Error inserting group into database:', err.message);
      }
    });
}

function addEvent(event){
    db.run(`
        INSERT INTO events (initiator, event_type, target, eventDate)
        VALUES (?, ?, ?, ?)
    `, [event.initiator, event.type, event.target, event.timestamp], (err) => {
        if (err) {
            console.error('Error inserting event into database:', err.message);
        }
    });
}

// Fonction pour incrémenter le nombre de bannis d'un groupe
function incrementBannedGroup(groupName) {
    db.run(`
      UPDATE groups
      SET banned_number = banned_number + 1
      WHERE groupName = ?
    `, [groupName], (err) => {
      if (err) {
        console.error('Erreur lors de l\'incrémentation du nombre de bannis:');
      } else {
        console.log(`Le nombre de bannis du groupe ${groupName} a été incrémenté avec succès.`);
      }
    }
  );
}
  
// Fonction pour décrémenter le nombre de bannis d'un groupe
function decrementBannedGroup(groupName) {
    db.run(`
      UPDATE groups
      SET banned_number = banned_number - 1
      WHERE groupName = ? AND banned_number > 0
    `, [groupName], (err) => {
      if (err) {
        console.error('Erreur lors de la décrémentation du nombre de bannis:');
      } else {
        console.log(`Le nombre de bannis du groupe ${groupName} a été décrémenté avec succès.`);
      }
    });
}
  
// Fonction pour incrémenter le nombre d'admins d'un groupe
function incrementAdminGroup(groupName) {
    db.run(`
      UPDATE groups
      SET admins_number = admins_number + 1
      WHERE groupName = ?
    `, [groupName], (err) => {
      if (err) {
        console.log('Erreur lors de l\'incrémentation du nombre d\'admins:');
      } else {
        console.log(`Le nombre d'admins du groupe ${groupName} a été incrémenté avec succès.`);
        c
      }
    });
}
  
// Fonction pour décrémenter le nombre d'admins d'un groupe
function decrementAdminGroup(groupName) {
    db.run(`
      UPDATE groups
      SET admins_number = admins_number - 1
      WHERE groupName = ? AND admins_number > 0
    `, [groupName], (err) => {
      if (err) {
        console.error('Erreur lors de la décrémentation du nombre d\'admins:');
      } else {
        console.log(`Le nombre d'admins du groupe ${groupName} a été décrémenté avec succès.`);
      }
    });
}

// modification des connexions 
function modifyConnexion(event) {
  db.run(`
    UPDATE connexion
    SET connexion_date = ?
    WHERE username = ?
  `, [event.timestamp, event.initiator], (err) => {
    if (err) {
      console.error('Erreur lors de la modification de la dated e connexion:');
    } else {
      console.log(`Date de connexion changée avec succès.`);
    }
  }
);
}
// modification des déconnexions
function modifyDeconnexion(event) {
  db.run(`
    UPDATE connexion
    SET deconnexion_date = ?
    WHERE username = ?
  `, [event.timestamp, event.initiator], (err) => {
    if (err) {
      console.error('Erreur lors de la modification de la date de deconnexion:');
    } else {
      console.log(`Date de déconnexion changée avec succès.`);
    }
  }
);
}

// Exportez la connexion à la base de données pour pouvoir l'utiliser ailleurs
module.exports = db;
module.exports = {
    addPrivateMessage,
    addGroupMessage,
    addGroupEvent,
    addGroup,
    addEvent,
    addConnexion,

    incrementBannedGroup,
    incrementAdminGroup,
    decrementAdminGroup,
    decrementBannedGroup,
    modifyConnexion,
    modifyDeconnexion,
}

// Fermez la base de données à la fin de l'exécution du programme
process.on('exit', () => {
  db.close((err) =>{
    if(err){
        console.error('Erreur dans la ferméture de la base de données');
    } else {
        console.log('base de données fermée avec succès.');

        deleteDatabase('main.db');
    }
  });
});

function deleteDatabase(main){
    fs.unlink(main, (err) => {
        if (err){
            console.error('Erreur lors de la suppression de la base de données');
        } else {
            console.log('Base de données supprimées avec succès.');
        }
    });
}
