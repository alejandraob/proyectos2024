/*Trabajando con LocalStorage*/


/**
 * Wrapper para guardar una entrada en local storage
* @param {*} nombre : la 'key/clave' a guardar
* @param {*} valor : el valor de la 'key/clave'
 */
function setEntry(nombre, valor) {

    /*Guardando los datos en el LocalStorage*/
    localStorage.setItem(nombre, valor);
}

/**
 * Función para obtener una colección de nombres desde localStorage
 * @returns 
 */
function obtenerNombres() {
    const nombres = localStorage.getItem('nombres');
    return nombres ? JSON.parse(nombres) : [];
}

// Función para guardar la colección de nombres en localStorage
function guardarNombres(nombres) {
    localStorage.setItem('nombres', JSON.stringify(nombres));
}


// Función para agregar un nombre a la colección
function agregarNombre() {
    const nombreInput = document.getElementById('nombreInput');
    const nombre = nombreInput.value.trim();

    if (nombre) {
        const nombres = obtenerNombres();   //obtengo del local storage el valor de la clave nombres, que me va a devolver un arreglo
        nombres.push(nombre);               //agrego al arreglo el nombre que ingreso el usuario
        guardarNombres(nombres);            //guardo nuevamente en el local storage 
        nombreInput.value = '';             // Limpiar el input
        mostrarNombres();                   //actualizo la tabla con los nombres guardados
    }
}


// Función para eliminar un nombre de la colección
function eliminarNombre(index) {
    const nombres = obtenerNombres();
    nombres.splice(index, 1); // Eliminar el nombre en el índice dado
    guardarNombres(nombres);
    mostrarNombres();
}

function limpiarLocalStorage() {
    localStorage.clear();
}


// Función para mostrar la colección de nombres en la tabla
function mostrarNombres() {
    const nombres = obtenerNombres(); //obtengo el arreglo de nombres
    const nombresTableBody = document.getElementById('nombresTable').getElementsByTagName('tbody')[0];

    // Limpio la tabla
    nombresTableBody.innerHTML = '';

    // Agregar los nombres a la tabla
    for (let i = 0; i < nombres.length; i++) {
        const row = nombresTableBody.insertRow();
        const cell = row.insertCell(0);
        cell.textContent = nombres[i];

        const actionCell = row.insertCell(1);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.onclick = function() {
            eliminarNombre(i);
        };
        actionCell.appendChild(deleteButton);
    }
}


