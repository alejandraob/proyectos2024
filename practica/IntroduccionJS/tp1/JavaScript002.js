/* Funcion simple para ser llamada desde HTML
function ejercicio2(){
    document.write("Hola Mundo"	);
}
    */
//Funcion con evento para que aparezca sin ser llamado desde el html
function ejercicio2(){
    document.write("Hola Mundo");
}

window.onload = function() {
    ejercicio2();
};