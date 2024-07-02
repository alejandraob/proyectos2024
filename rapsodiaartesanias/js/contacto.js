// Función para validar los campos del formulario
function validarCampos() {
    var nombre = document.getElementById("nombre"); // Campo de nombre
    var email = document.getElementById("email"); // Campo de email
    var tel = document.getElementById("telefono"); // Campo de teléfono

    let valid = true;

    // Validación de nombre
    if (nombre.value.trim() === '') {
        mostrarError(nombre, 'Debe ingresar un nombre.');
        valid = false;
    } else if (nombre.value.trim().length < 3) {
        mostrarError(nombre, 'El nombre debe tener al menos 3 caracteres.');
        valid = false;
    } else {
        ocultarError(nombre);
    }

    // Validación de email
    if (email.value.trim() === '') {
        mostrarError(email, 'Por favor ingrese un email.');
        valid = false;
    } else if (!validateEmail(email.value)) {
        mostrarError(email, 'Por favor ingrese un email válido usuario@mail.com');
        valid = false;
    } else {
        ocultarError(email);
    }

    // Validación de teléfono
    if (tel.value.trim() === '') {
        mostrarError(tel, 'Por favor ingrese un teléfono.');
        valid = false;
    } else if (!validatePhone(tel.value)) {
        mostrarError(tel, 'Por favor ingrese un teléfono válido (2990000000).');
        valid = false;
    } else {
        ocultarError(tel);
    }

    return valid;
}

// Función para mostrar un mensaje de error junto a un campo
function mostrarError(campo, mensaje) {
    var errorSpan = campo.nextElementSibling; // Obtener el span de error adyacente al campo
    errorSpan.innerText = mensaje; // Mostrar el mensaje de error
    errorSpan.style.display = 'block'; // Mostrar el span de error
    campo.classList.add('error'); // Agregar clase de error al campo
}

// Función para ocultar el mensaje de error de un campo
function ocultarError(campo) {
    var errorSpan = campo.nextElementSibling; // Obtener el span de error adyacente al campo
    if (errorSpan && errorSpan.classList.contains('error-message')) {
        errorSpan.innerText = ''; // Limpiar el mensaje de error
        errorSpan.style.display = 'none'; // Ocultar el span de error
    }
    campo.classList.remove('error'); // Remover clase de error del campo
}
// Función para validar el formato del email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;// Expresión regular para validar email
    return re.test(String(email).toLowerCase());
}
// Función para validar el formato del teléfono
function validatePhone(tel) {
    const re = /^\d{10}$/; // Acepta solo números de 10 dígitos
    return re.test(String(tel));
}
// Función para enviar el formulario si los campos son válidos
function enviar() {
    if (!validarCampos()) {
        return; // Detener el envío si hay campos inválidos
    }

    var nombre = document.getElementById("nombre").value;
    var email = document.getElementById("email").value;
    var tel = document.getElementById("telefono").value;
    var motivo = document.getElementById("motivo").value;
    var mensaje = document.getElementById("mensaje").value;
// Crear el cuerpo del email
    var body = `Nombre: ${nombre}\nTeléfono: ${tel}\nMotivo: ${motivo}\nMensaje: ${mensaje}`;
    var mailtoLink = `mailto:${email}?subject=${encodeURIComponent(motivo)}&body=${encodeURIComponent(body)}`;
 // Redirigir para abrir el cliente de email con los datos prellenados
    window.location.href = mailtoLink;
}