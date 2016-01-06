/*global io*/
var nombreUsuario;
var socket;
      
$(document).ready(function(){
    $("#modalLogin").modal("show");
});

function login(){
    nombreUsuario = $("#nombreUsuario").val();
    $("#nombreUsuarioTextBox").text(nombreUsuario);
    $('#modalLogin').modal('toggle');
    mostrarContenidoDelRoom();
    $( "#sendButton" ).click(handlerSendMessage);
}

function handlerSendMessage(){
  if($("#messageContent").val().trim() !== ""){
    console.log('enviando mensaje...' + $("#messageContent").val());
    socket.emit('nuevo mensaje', {nombre:nombreUsuario, contenido: $("#messageContent").val().trim() });
    //appendMessage({nombre:nombreUsuario, mensaje:$("#messageContent").val().trim()});
  }
  
}

function mostrarContenidoDelRoom(){
    socket = io("", { query: 'nombre=' + nombreUsuario });
    
    socket.on('room status', function (data) {//Mensaje --> nombre,contenido
      console.log("data:" + data.mensajes);
      $.each(data.mensajes, function( index, mensaje) {
        mostrarNuevoUsuario(mensaje.nombre);
        appendMessage(mensaje);
        console.log(mensaje);
      });
    });
    
    socket.on('nuevo mensaje', function (mensaje) {//Mensaje --> nombre,contenido
      appendMessage(mensaje);
      console.log(mensaje);
    });
    
    socket.on('user connected', function (mensaje) {//Mensaje --> nombre,contenido
      mostrarNuevoUsuario(mensaje.nombre);
      appendMessage(mensaje);
      console.log(mensaje);
    });
    
    socket.on('user disconnected', function (mensaje) {//Mensaje --> nombre,contenido
      borrarUsuarioDesconectado(mensaje.nombre);
      appendMessage(mensaje);
      console.log(mensaje);
    });
}

function borrarUsuarioDesconectado(nombreUsuarioDesconectado){
  $("#user" + nombreUsuarioDesconectado).remove();
}

function mostrarNuevoUsuario(nombreNuevoUsuario){
  $("#participantesDiv").append("<div class=\" user-format\" id=\"user" + nombreNuevoUsuario  + "\"><div class=\"media-left media-middle\"><a href=\"#\"><img class=\"media-object img-usuario img-usuario\" src=\"http://simpleicon.com/wp-content/uploads/user1.png\" alt=\"...\"></a></div><div class=\"media-body media-middle\">" + nombreNuevoUsuario + "</div></div>");
  /*
  <div class=" user-format">
    <div class="media-left media-middle">
      <a href="#">
        <img class="media-object img-usuario img-usuario" src="http://simpleicon.com/wp-content/uploads/user1.png" alt="...">
      </a>
    </div>
    <div class="media-body media-middle">
      AgusO
    </div>
  </div>
  */
}

function appendMessage(mensaje){//{nombre,contenido}
  $("#conversacionDiv").append("<dt>" + mensaje.nombre + "</dt> <dd>" + mensaje.contenido + "</dd>");
}