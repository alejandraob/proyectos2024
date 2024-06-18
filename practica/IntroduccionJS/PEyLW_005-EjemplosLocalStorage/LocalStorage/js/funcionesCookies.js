/*Trabajando con Cookies*/ 

/**
 * Wrapper para guardar una cookie llamada username
 * @param {*} valor : el valor a guardar en la cookie
 */
function setCookieUsername(valor)
{
    setCookie('username', valor, 10)
}

/**
 * 
 * @param {*} name: El nombre de la cookie 
 * @param {*} value : el valor a asignar
 * @param {*} days : los días que va a durar
 */
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Calcular la fecha de expiración
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

/**
 * 
 * @param {*} name : el nombre de la cookie
 * @returns el valor que tiene almacenado o null
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';'); // Dividir las cookies en un array
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length); // Eliminar espacios en blanco al inicio
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length); // Devolver el valor de la cookie si coincide el nombre
        }
    }
    return null; // Si no se encuentra la cookie, devolver null
}

