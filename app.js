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

var dl = require('./public/libs/delivery/lib/delivery.server'),
    fs  = require('fs');

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

app.io.on('connection', function(socket){  
  console.log("se conecto el usuario: " + socket.handshake.query.nombre);
  var usuario = {};
  usuario.socket = socket;
  usuario.nombre = socket.handshake.query.nombre;
  usuario.color = socket.handshake.query.color;
  usuario.delivery = dl.listen(usuario.socket);
  usuarios.push(usuario);
  agregarListenersAlSocketUsuario(usuario);
  usuario.socket.broadcast.emit("user connected", {nombre:usuario.nombre, contenido: "Se ha conectado", color:usuario.color});
  socket.emit("room status", buildRoomStatus());
});


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
  
  /*
  usuario.socket.on('echo', function(mensaje){
    console.log("Echo del usuario " + mensaje.nombre);
    app.io.emit("user image", {nombre: mensaje.nombre, color:usuario.color, image: mensaje.image});
    
  });
*/
  usuario.socket.on('disconnect', function () {
    console.log("Se desconecto el usuario:" + usuario.nombre);
    usuarios = _.filter(usuarios, function(usuarioDeLaLista){ return usuarioDeLaLista.nombre !== usuario.nombre; });
    usuario.socket.broadcast.emit('user disconnected', {nombre:usuario.nombre, contenido: "Se ha desconectado...", color:usuario.color});
  });
  
  usuario.socket.on('eliminar usuario', function(mensaje){
    console.log("El usuario " + usuario.nombre + " ha eliminado al usuario " + mensaje.nombreEliminado);
    var usuarioEliminado = _.find(usuarios, function(user){ return user.nombre === mensaje.nombreEliminado; });
    usuarioEliminado.socket.disconnect();
    usuarios = _.filter(usuarios, function(user){ return user.nombre !== usuario.nombre; });
    app.io.emit("nuevo mensaje", {nombre: mensaje.nombre, contenido: usuario.nombre + " ha eliminado a " + mensaje.nombreEliminado, color:usuario.color});
  });
  
  usuario.socket.on('user image', function (msg) {
    console.log(msg.nombre + " " + msg.contenido);
    app.io.emit("user image", {nombre: msg.nombre, color:usuario.color, image: msg.image});
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

