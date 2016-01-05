/*global io*/
var idUsuario;
var socket;
      
$(document).ready(function(){
    $("#modalLogin").modal("show");
});

function login(){
    var nombreUsuario = $("#nombreUsuario").val();
    idUsuario = $("#nombreUsuarioLogueado").text();
    $('#modalLogin').modal('toggle');
    mostrarContenidoDelRoom();
}

function mostrarContenidoDelRoom(){
    socket = io("", { query: 'nombre=' + "Lucas" });
    
    socket.on('nuevo mensaje', function (data) {
      console.log(data);
    });
    
    setInterval(function() {
    	console.log('enviando mensaje...');
    	socket.emit('nuevo mensaje', { data: 'hola' });
    }, 5000);
}
/*


console.log(tipo + ': ' + nombre);
setInterval(function() {
	console.log('Enviando pregunta');
	socket.emit('pregunta', { contenido: 'llega?' });
}, 5000);

*/