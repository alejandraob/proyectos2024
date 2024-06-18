/*Ejercicio 5: Funciones
a- Desarrollar una librería javascript EjJavaScript005.js con las funciones de 
suma(X,Y), resta(X,Y), división(X,Y), multiplicación(X,Y), potencia(X,Y), 
cuadrado(X). 
b- Desarrollar una página que tenga la funcionalidad de una calculadora que utilice 
la librería del ejercicio anterior. Debe contener un botón por cada operación. Al 
hacer clic sobre cada botón debe pedirle al usuario los parámetros de la función, 
llamar a la función y luego imprimir el resultado en un textarea como se muestra 
en la figura.
c- Desarrollar una página de Título conversor monetario. Te tenga la funcionalidad 
de convertir:
 de pesos a dólares
 de dólares a pesos
 de pesos a reales
 de reales a pesos
 de pesos a euros
 de euros a pes*/

function suma(x, y){
    x= parseFloat(prompt("Ingrese el primer número: "));
   y= parseFloat( prompt("Ingrese el segundo número: "));
    var resultado = x + y;
    document.getElementById("resultado").value = resultado;
}
function resta(x, y){
    x= parseFloat(prompt("Ingrese el primer número: "));
   y= parseFloat( prompt("Ingrese el segundo número: "));

    var resultado= x - y;
    document.getElementById("resultado").value = resultado;

}
function multiplicacion(x, y){
    x= parseFloat(prompt("Ingrese el primer número: "));
   y= parseFloat( prompt("Ingrese el segundo número: "));

    var resultado= x * y;
    document.getElementById("resultado").value = resultado;
}
function division(x, y){
    x= parseFloat(prompt("Ingrese el primer número: "));
   y= parseFloat( prompt("Ingrese el segundo número: "));

    var resultado= x / y;
    document.getElementById("resultado").value = resultado;
}
function potencia(x, y){
    x= parseFloat(prompt("Ingrese el primer número: "));
   y= parseFloat( prompt("Ingrese el segundo número: "));

    var resultado= Math.pow(x, y);

    document.getElementById("resultado").value = resultado;
}
function raizCuadrada(x){
    x= parseFloat(prompt("Ingrese el primer número: "));
    var resultado= Math.sqrt(x);
    document.getElementById("resultado").value = resultado;
}


/////////////////////////////////CONVERSOR MONETARIO/////////////////////////////////////\
// Tasas de cambio (ejemplo, deberías actualizar estas tasas regularmente)
const tasaPesosDolares = 100; // 1 dólar = 100 pesos
const tasaPesosReales = 20;   // 1 real = 20 pesos
const tasaPesosEuros = 120;   // 1 euro = 120 pesos


function pesoADolar(){
    var pesos = parseFloat(prompt("Ingrese la cantidad en pesos: "));
    var dolares = pesos / tasaPesosDolares;
    document.getElementById("resultadoc").value = dolares.toFixed(2) + " USD";
}
function dolaresAPesos() {
    var dolares = parseFloat(prompt("Ingrese la cantidad en dólares: "));
    var pesos = dolares * tasaPesosDolares;
    document.getElementById("resultadoc").value = pesos.toFixed(2) + " ARS";
}

function pesosAReales() {
    var pesos = parseFloat(prompt("Ingrese la cantidad en pesos: "));
    var reales = pesos / tasaPesosReales;
    document.getElementById("resultadoc").value = reales.toFixed(2) + " BRL";
}

function realesAPesos() {
    var reales = parseFloat(prompt("Ingrese la cantidad en reales: "));
    var pesos = reales * tasaPesosReales;
    document.getElementById("resultadoc").value = pesos.toFixed(2) + " ARS";
}

function pesosAEuros() {
    var pesos = parseFloat(prompt("Ingrese la cantidad en pesos: "));
    var euros = pesos / tasaPesosEuros;
    document.getElementById("resultadoc").value = euros.toFixed(2) + " EUR";
}

function eurosAPesos() {
    var euros = parseFloat(prompt("Ingrese la cantidad en euros: "));
    var pesos = euros * tasaPesosEuros;
    document.getElementById("resultadoc").value = pesos.toFixed(2) + " ARS";
}

function limpiar(){
    var btnCalculadora=document.getElementById("resultado").value = "";
    var btnConversor= document.getElementById("resultadoc").value = "";
    

}