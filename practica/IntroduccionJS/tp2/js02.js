/*b- Crear la función valorSleccionado(Valor) que devuelva: 
-1 si Valor < 0;
0 si Valor >=0 y Valor <10;
1 si Valor >= 10 y Valor <50;
2 si Valor >=50 y Valor <100;
3 si Valor >=100
Agregar esta funcionalidad a la calculadora del Ejercicio 1 tp 2.
 */

function valorSleccionado(Valor){
    Valor=parseFloat(prompt("Ingrese un valor: "));
    if(Valor < 0){
        resultado="-1";
        document.getElementById("resultado").value = resultado;
    }else if(Valor >=0 && Valor <10){
        resultado="0";
        document.getElementById("resultado").value = resultado;
    }else if(Valor >= 10 && Valor <50){
        resultado="1";
        document.getElementById("resultado").value = resultado;
       
    }else if(Valor >=50 && Valor <100){
       resultado="2";
       document.getElementById("resultado").value = resultado;
    }else if(Valor >=100){
       resultado="3";
       document.getElementById("resultado").value = resultado;
    }

}