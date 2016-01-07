var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore-node');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
app.io = require("socket.io")();

/*-------------CONFIGURACION de la app-------------*/
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/*--------FIN - CONFIGURACION de la app-------------*/
var usuarios = [];
var colours = [
  "rgba(255, 21, 3, 0.7)",
  "rgba(255, 181, 3, 0.7)",
  "rgba(159, 157, 24, 0.7)",
  "rgba(3, 255, 15, 0.7)",
  "rgba(3, 255, 255, 0.7)",
  "rgba(3, 104, 255, 0.7)",
  "rgba(62, 3, 255, 0.7)",
  "rgba(222, 3, 255, 0.7)",
  "rgba(255, 3, 110, 0.7)"
  ];
var actualColour = 0;

app.io.on('connection', function(socket){  
  console.log("se conecto el usuario: " + socket.handshake.query.nombre);
  var usuario = {};
  usuario.socket = socket;
  usuario.nombre = socket.handshake.query.nombre;
  usuario.color = asignarColorAUsuario();
  usuarios.push(usuario);
  agregarListenersAlSocketUsuario(usuario);
  usuario.socket.broadcast.emit("user connected", {nombre:usuario.nombre, contenido: "Se ha conectado", color:usuario.color});
  socket.emit("room status", buildRoomStatus());
});

function asignarColorAUsuario(){
  (actualColour + 1< colours.length)? actualColour++ : actualColour = 0;
  return colours[actualColour];
}

function buildRoomStatus(){
  var mensajesUsuariosActuales = [];
  console.log("cantidad de usuarios: " + usuarios.length);
  usuarios.forEach(function(usuario) {
    console.log(usuario.nombre + " " + usuario.socket);
    mensajesUsuariosActuales.push({nombre:usuario.nombre, contenido: "Se ha conectado", color:usuario.color});
  });
  return {mensajes: mensajesUsuariosActuales}
}

function agregarListenersAlSocketUsuario(usuario){
  usuario.socket.on('nuevo mensaje', function(mensaje){
    console.log("El usuario " + mensaje.nombre + " dijo: " + mensaje.contenido);
    app.io.emit("nuevo mensaje", {nombre: mensaje.nombre, contenido: mensaje.contenido, color:usuario.color});
  });

  usuario.socket.on('disconnect', function () {
    console.log("Se desconecto el usuario:" + usuario.nombre);
    usuarios = _.filter(usuarios, function(usuarioDeLaLista){ return usuarioDeLaLista.nombre !== usuario.nombre; });
    usuario.socket.broadcast.emit('user disconnected', {nombre:usuario.nombre, contenido: "Se ha desconectado...", color:usuario.color});
  });
};


module.exports = app;







/*

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

*/

