module.exports = (app, dbConfig, mysql) => {

app.get('/', function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write("Sin datos solicitados, por lo que no se devuelve ninguno.");
    res.end();
});

app.get('/usuarios', function(req,res){ handleAllUser(req, res);} );

app.get('/usuarios/:usuariosId', function(req,res){
    var usuarioIdentifier = req.params.usuariosId;
    console.log('usuarioIdentifier: '+usuarioIdentifier);
    handleDatabaseOperation( req, res, function (request, response, connection) {
      console.log('connection: '+connection);
    var selectStatement = "Select Id, Nombre, Documento, Correo From `breadev`.`USUARIOS` Where Id = "+usuarioIdentifier;
    console.log('selectStatement: '+selectStatement);
    connection.query(selectStatement,  function(error, row) {
      if (error) {
        console.log('Error.'+selectStatement);
			  console.log('Error en la ejecución de la sentencia.'+error.message);
        response.writeHead(500, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({ status: 500,
                                      message: "Error al obtener los usuarios de AppCliente "+usuarioIdentifier,
                                      detailed_message: error.message
                                    }));  
      } else {
		    console.log('La respuesta de la base de datos esta lista. '+row);
        response.writeHead(200, {'Content-Type': 'application/json'});
        //response.end(JSON.stringify(result.rows));
        response.end(JSON.stringify(row));
      }
      doRelease(connection);
    });
	});
} );

function handleDatabaseOperation(request, response, callback) {
  console.log(request.method + ":" + request.url );
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  response.setHeader('Access-Control-Allow-Credentials', true);
  
  console.log('Handle request: '+request.url);
  //console.log('ConnectString :' + dbConfig.database.connectString);

  //var mysql = require('mysql');
  var pool  = mysql.createPool({
    host     : dbConfig.database.host,
    user     : dbConfig.database.user,
    password : dbConfig.database.password,
    database : dbConfig.database.database,
    connectionLimit : 100
  });

  pool.getConnection(function(err, connection) {
    if(err) {
      //logging here
      console.log('Error adquiriendo la conexión ...');
      console.log('Mensaje de error '+err.message);
      // Error connecting to DB
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
    console.log('Connection acquired ; go execute ');
    callback(request, response, connection);

  });
}//handleDatabaseOperation

function handleAllUser(request, response) {
  handleDatabaseOperation( request, response, function (request, response, connection) {
    console.log('connection: '+connection);
  var selectStatement = "Select Id, Nombre, Documento, Correo From `breadev`.`USUARIOS` ";
  console.log('selectStatement: '+selectStatement);
  connection.query(selectStatement,  function(error, row) {
    if (error) {
      console.log('Error.'+selectStatement);
      console.log('Error en la ejecución de la sentencia.'+error.message);
      response.writeHead(500, {'Content-Type': 'application/json'});
      response.end(JSON.stringify({ status: 500,
                                    message: "Error al obtener los usuarios de AppCliente "+usuarioIdentifier,
                                    detailed_message: error.message
                                  }));  
    } else {
      console.log('La respuesta de la base de datos esta lista. '+row);
      response.writeHead(200, {'Content-Type': 'application/json'});
      //response.end(JSON.stringify(result.rows));
      response.end(JSON.stringify(row));
    }

    doRelease(connection);
  });
});
} //handleAllDepartments

function doRelease(connection)
{
  connection.release(
    function(err) {
      if (err) {
        console.error(err.message);
      }
    });
}

}