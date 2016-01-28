/*global io*/
var nombreUsuario;
var socket;
      
$(document).ready(function(){
    $("#modalLogin").modal("show");
    $('#modalLogin').on('shown.bs.modal', function () {
      $('#nombreUsuario').focus();
      $('.demo2').colorpicker({format:"rgba", color: "rgba(0,0,255,1)"});
    });
    
     $('#nombreUsuario').keypress(function(e) {
        if ( e.keyCode == 13 ) {  // detect the enter key
            $('#loginButton').click(); // fire a sample click,  you can do anything
        }
    });
    
     $('#messageContent').keypress(function(e) {
        if ( e.keyCode == 13 ) {  // detect the enter key
            $('#sendButton').click(); // fire a sample click,  you can do anything
        }
    });
});

function login(){
  nombreUsuario = $("#nombreUsuario").val();
  if(nombreUsuario.indexOf(' ') >= 0 || nombreUsuario.trim().length === 0 || nombreUsuario.trim().length > 26){
    alert("El nombre de usuario no puede tener espacios ni tener mas de 25 caracteres. Puto.");
    $("#nombreUsuario").val("");
  }
  else{
    $("#nombreUsuarioTextBox").text(nombreUsuario);
    $('#modalLogin').modal('toggle');
    mostrarContenidoDelRoom();
    $("#messageContent").focus();
    $( "#sendButton" ).click(handlerSendMessage);
  }
}

function handlerSendMessage(){
  if($("#messageContent").val().trim() !== ""){
    console.log('enviando mensaje...' + $("#messageContent").val());
    socket.emit('nuevo mensaje', {nombre:nombreUsuario, contenido: $("#messageContent").val().trim() });
    $("#messageContent").val("");
  }
  
}

function mostrarContenidoDelRoom(){
    socket = io("", { query: 'nombre=' + nombreUsuario + '&color=' + $('.demo2').colorpicker('getValue')} );
    
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
    
    socket.on('image', function (mensaje) {//Mensaje --> nombre,contenido
      appendImage(mensaje);
      console.log(mensaje);
    });
    
    var delivery = new Delivery(socket);
 
    delivery.on('delivery.connect',function(delivery){
      $("#imageButtonSend").click(function(evt){
        var file = $("#inputFile")[0].files[0];
        var extraParams = {nombre:nombreUsuario, contenido: "He enviado una imagen" };
        delivery.send(file, extraParams);
        evt.preventDefault();
      });
      console.log("ya me conecte con delivery");
    });
 

    delivery.on('send.success',function(fileUID){
      console.log("file was successfully sent.");
    });
/*    
    delivery.on('receive.start',function(fileUID){
      console.log('receiving a file!');
    });
 
    delivery.on('receive.success',function(file){
      var parametros = file.params;
      console.log('ya recibi el archivo');
      if (file.isImage()) {
        appendImage(file);
        //$('img').attr('src', file.dataURL());
      };
    });
*/
}

function appendImage(mensaje){
  /*app.io.emit("image", {nombre, image:"/public/images/" +file.name, color);*/
  var ddcontent = "<dd><img class=\"img-conversacion\" src=\"" + mensaje.image + "\" /></a><br /></dd>";
  $("#conversacionDiv").append("<dt>" + mensaje.nombre + "</dt>" + ddcontent);
  $( "dt:last" ).css({ color: mensaje.color});
  $( "dt:last" ).nextAll().css({ color: mensaje.color});
  $("#conversacionDiv").animate({
        //scrollTop: $("#conversacionDiv").height()
        scrollTop: $('#conversacionDiv')[0].scrollHeight}, "fast");
}

function borrarUsuarioDesconectado(nombreUsuarioDesconectado){
  $("#user" + nombreUsuarioDesconectado).remove();
}

function mostrarNuevoUsuario(nombreNuevoUsuario){
  $("#participantesDiv").append("<div class=\" user-format\" id=\"user" + nombreNuevoUsuario  + "\"><div class=\"media-left media-middle\"><a href=\"#\"><img class=\"media-object img-usuario img-usuario\" src=\"http://simpleicon.com/wp-content/uploads/user1.png\" alt=\"...\"></a></div><div class=\"media-body media-middle nombre-participante\">" + nombreNuevoUsuario + "</div></div>");
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

function appendMessage(mensaje){ //{nombre,contenido}
  var ddcontent = "";
  var splitContent;
  //var maxlength = 70;//caracteres
  /*Para poner imagenes*/
  var patternImg = /([-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?(?:jpg|jpeg|gif|png))/gi;
  if(patternImg.test(mensaje.contenido)){
    var replacement = '<a href="$1" target="_blank"><img class="img-conversacion" src="$1"  /></a><br />';
    mensaje.contenido = mensaje.contenido.replace(patternImg, replacement);
    ddcontent += "<dd>" + mensaje.contenido + "</dd>";
    $("#conversacionDiv").append("<dt>" + mensaje.nombre + "</dt>" + ddcontent);
  }
  else{
    splitContent = mensaje.contenido.match(/.{1,80}/g);
    for (var pos = 0; pos < splitContent.length; pos++ ) {
      ddcontent += "<dd>" + splitContent[pos] + "</dd>";
    }
    if($( "dt:last" ).text() == mensaje.nombre)
      $("#conversacionDiv").append(ddcontent);
    else
      $("#conversacionDiv").append("<dt>" + mensaje.nombre + "</dt>" + ddcontent);
  }
  $( "dt:last" ).css({ color: mensaje.color});
  $( "dt:last" ).nextAll().css({ color: mensaje.color});
  $("#conversacionDiv").animate({
        //scrollTop: $("#conversacionDiv").height()
        scrollTop: $('#conversacionDiv')[0].scrollHeight}, "fast");
}


