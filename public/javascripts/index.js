var idUsuario;

$(document).ready(function(){
    $("#modalLogin").modal("show");
    //$( "#principalRow" ).children().addClass( "principalDivElements");
    
});

function login(){
    var nombreUsuario = $("#nombreUsuario").val();
    idUsuario = $("#nombreUsuarioLogueado").text();
    $('#modalLogin').modal('toggle');
    mostrarContenidoDelRoom();
}

function mostrarContenidoDelRoom(){
    
}