/*
 Bucles for, while, do while, for in.
Para todos los puntos definir funciones que se llamen cuando se haya cargado la página.
a- Desarrollar una página con una lista no ordenada <ul> con los meses calendario. 
Los meses deben ser impresos desde una variable array.
    i- Recorrer el array con la sentencia for.
    ii- Recorrer el array con la sentencia while.
    iii- Recorrer el array con la sentencia do while.
    iv- Recorrer el array con la sentencia for in.
     */
/*
function cargarPagina() {
    var meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
        "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    var ul = document.createElement("ul");
    document.body.appendChild(ul);


    // i- Recorrer el array con la sentencia for.
    document.write("<h2>Recorrer el array con la sentencia for.</h2>");
    for (var i = 0; i < meses.length; i++) {
        var li = document.createElement("li");
        li.innerHTML = meses[i];
        ul.appendChild(li);
    }

    // ii- Recorrer el array con la sentencia while.
    var i = 0;
    document.write("<h2>Recorrer el array con la sentencia while.</h2>");
    while (i < meses.length) {
        var li = document.createElement("li");
        li.innerHTML = meses[i];
        ul.appendChild(li);
        i++;
    }

    // iii- Recorrer el array con la sentencia do while.
    var i = 0;
    document.write("<h2>Recorrer el array con la sentencia do while.</h2>");
    do {
        var li = document.createElement("li");
        li.innerHTML = meses[i];
        ul.appendChild(li);
        i++;
    } while (i < meses.length);

    // iv- Recorrer el array con la sentencia for in.
    document.write("<h2>Recorrer el array con la sentencia for in.</h2>");
    for (var i in meses) {
        var li = document.createElement("li");
        li.innerHTML = meses[i];
        ul.appendChild(li);
    }

    // v- Recorrer el array con la sentencia forEach.
    document.write("<h2>Recorrer el array con la sentencia forEach.</h2>");
    meses.forEach(function (mes) {
        var li = document.createElement("li");
        li.innerHTML = mes;
        ul.appendChild(li);
    });
}*/

function cargarPagina() {
    var meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
        "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    var body = document.body;

    // i- Recorrer el array con la sentencia for.
    var h2For = document.createElement("h2");
    h2For.innerHTML = "Recorrer el array con la sentencia for.";
    body.appendChild(h2For);
    var ulFor = document.createElement("ul");
    for (var i = 0; i < meses.length; i++) {
        var li = document.createElement("li");
        li.innerHTML = meses[i];
        ulFor.appendChild(li);
    }
    body.appendChild(ulFor);

    // ii- Recorrer el array con la sentencia while.
    var h2While = document.createElement("h2");
    h2While.innerHTML = "Recorrer el array con la sentencia while.";
    body.appendChild(h2While);
    var ulWhile = document.createElement("ul");
    var i = 0;
    while (i < meses.length) {
        var li = document.createElement("li");
        li.innerHTML = meses[i];
        ulWhile.appendChild(li);
        i++;
    }
    body.appendChild(ulWhile);

    // iii- Recorrer el array con la sentencia do while.
    var h2DoWhile = document.createElement("h2");
    h2DoWhile.innerHTML = "Recorrer el array con la sentencia do while.";
    body.appendChild(h2DoWhile);
    var ulDoWhile = document.createElement("ul");
    var i = 0;
    do {
        var li = document.createElement("li");
        li.innerHTML = meses[i];
        ulDoWhile.appendChild(li);
        i++;
    } while (i < meses.length);
    body.appendChild(ulDoWhile);

    // iv- Recorrer el array con la sentencia for in.
    var h2ForIn = document.createElement("h2");
    h2ForIn.innerHTML = "Recorrer el array con la sentencia for in.";
    body.appendChild(h2ForIn);
    var ulForIn = document.createElement("ul");
    for (var i in meses) {
        var li = document.createElement("li");
        li.innerHTML = meses[i];
        ulForIn.appendChild(li);
    }
    body.appendChild(ulForIn);

    // v- Recorrer el array con la sentencia forEach.
    var h2ForEach = document.createElement("h2");
    h2ForEach.innerHTML = "Recorrer el array con la sentencia forEach.";
    body.appendChild(h2ForEach);
    var ulForEach = document.createElement("ul");
    meses.forEach(function (mes) {
        var li = document.createElement("li");
        li.innerHTML = mes;
        ulForEach.appendChild(li);
    });
    body.appendChild(ulForEach);
}
