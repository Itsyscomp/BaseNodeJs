//const User = require('../models/user.model.js');
const dbConfig = require('../../config/database.config.js');
const mysql = require('mysql');

var pool  = mysql.createPool({
    host            : dbConfig.database.host,
    user            : dbConfig.database.user,
    password        : dbConfig.database.password,
    database        : dbConfig.database.database,
    connectionLimit : 100
});

exports.init = (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write("Sin datos solicitados, por lo que no se devuelve ninguno.");
    res.end();
}

exports.getUsarios = (request, response) => {
    handleDatabaseOperation(request, response, function (request, response, connection) {
        var selectStatement = "Select Id, Nombre, Documento, Correo From `breadev`.`USUARIOS` ";
        executeOperation(selectStatement, request, response, connection);
    });
}


exports.getUsarioId = (request, response) => {
    var usuarioIdentifier = request.params.usuariosId;
    handleDatabaseOperation(request, response, function (request, response, connection) {
        var selectStatement = "Select Id, Nombre, Documento, Correo From `breadev`.`USUARIOS` Where Id = "+usuarioIdentifier;
        executeOperation(selectStatement, request, response, connection);
    });
}

function executeOperation(selectStatement, request, response, connection){
    connection.query(selectStatement,  function(error, row) {
        if (error) {
            console.log('Error en la ejecución de la sentencia.'+error.message);
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({ status: 500,
                                            message: "Error al obtener los usuarios de AppCliente "+usuarioIdentifier,
                                            detailed_message: error.message
                                        }));
            connection.destroy;
        } else {
            console.log('La respuesta de la base de datos esta lista.');
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(row));
        }
        //Se libera la conexión.
        doRelease(connection);
    });
}

function handleDatabaseOperation(request, response, callback) {
    //console.log(request.method + ":" + request.url );
    //Cabecera de la petición
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    response.setHeader('Access-Control-Allow-Credentials', true);
    console.log('Handle request: '+request.url);
    //Se obtiene la conexión a base de datos.
    getConnection(request, response, callback);
  }

  function getConnection(request, response, callback){

    if(global.SQLpool === undefined){
        console.log('SQLpool indefinido.');
        global.SQLpool = pool; //create a global sql pool connection
        console.log('SQLpool definido.');
    }

    global.SQLpool.getConnection(function(err, connection) {
        if(err) {
          console.log('Error adquiriendo la conexión ...'+err.message);
          response.writeHead(500, {'Content-Type': 'application/json'});
          response.end(JSON.stringify({status: 500,
                                       message: "Error contectando a la base de datos",
                                       detailed_message: err.message}));
          return;
        }
        connection.on('error', function(err) {
          if(err.code === "PROTOCOL_CONNECTION_LOST") {
            connection.destroy();				
          } else {
            connection.release();
          }
          return;
        });
        console.log('Conexión adquirida.');
        console.log('Id de la sesión: '+connection.threadId);
        callback(request, response, connection);
      });
  }

  function doRelease(connection){
    connection.release(
        function(err) {
            if (err) {
                 console.error(err.message);
            }
        });
    }

    /*
    DB.prototype.createTransaction = function(pool,callback) {
        var self = this;
        self.getConnection(pool,function(err,connection){
            if(err) {
                //logging here
                console.log(err);
                callback(true);
                return;
            }
            connection.beginTransaction(function(err) {
                if(err){
                    console.log(err);
                    callback(true);
                    return;
                }
                callback(null,connection)
            });
        });
    }*/