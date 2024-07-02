function validarCampos() {

    var nombre = document.getElementById("nombre");
    var email = document.getElementById("email");
    var tel = document.getElementById("telefono");

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

function mostrarError(campo, mensaje) {
    var errorSpan = campo.nextElementSibling;
    errorSpan.innerText = mensaje;
    errorSpan.style.display = 'block';
    campo.classList.add('error');
}

function ocultarError(campo) {
    var errorSpan = campo.nextElementSibling;
    if (errorSpan && errorSpan.classList.contains('error-message')) {
        errorSpan.innerText = '';
        errorSpan.style.display = 'none';
    }
    campo.classList.remove('error');
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(tel) {
    const re = /^\d{10}$/; // Acepta solo números de 10 dígitos
    return re.test(String(tel));
}

function enviar() {
    if (!validarCampos()) {
        return;
    }

    var nombre = document.getElementById("nombre").value;
    var email = document.getElementById("email").value;
    var tel = document.getElementById("telefono").value;
    var motivo = document.getElementById("motivo").value;
    var mensaje = document.getElementById("mensaje").value;

    var body = `Nombre: ${nombre}\nTeléfono: ${tel}\nMotivo: ${motivo}\nMensaje: ${mensaje}`;
    var mailtoLink = `mailto:${email}?subject=${encodeURIComponent(motivo)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
}