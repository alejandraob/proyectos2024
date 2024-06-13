/*DECLARAMOS NUESTRAS VARIABLES PARA PODER CREAR LAS FUNCIONES NECESARIAS PARA LAS ACCIONES DE NUESTRO MENU */
///ACCION PARA ABRIR Y CERRAR MENU DE MI CUENTA
const miCuenta=document.querySelector('.miCuenta');
const menuCuenta=document.querySelector('.menu-cuenta');






/*Eventos*/
miCuenta.addEventListener('click', toogleMenuCuenta);





/*Funciones*/
function toogleMenuCuenta(){
    menuCuenta.classList.toggle('inactive');
}