const usuario = [
    {
        nombre: "Juan Perez",
        email: "jperez@gmail.com",
        password: "123456",
        telefono: "1234567890",
        direccion: "Calle Falsa 123",
        piso: "",
        cp: "1234",
        provincia: "Springfield",
        pais: "Argentina",
    }
];

var correosRegistrados = ['jperez@gmail.com', 'usuario1@mail.com', 'usuario2@mail.com'];
//
function rellenarFormulario() {
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));
    if (usuario) {
        document.getElementById("nombre").value = usuario.nombre;
        document.getElementById("email").value = usuario.email;
        document.getElementById("pass").value = usuario.password;
        document.getElementById("telefono").value = usuario.telefono;
        document.getElementById("direccion").value = usuario.direccion;
        document.getElementById("piso").value = usuario.piso;
        document.getElementById("cp").value = usuario.cp;
        document.getElementById("provincia").value = usuario.provincia;
        document.getElementById("pais").value = usuario.pais;
    }
}

function editarCuenta(event) {
    event.preventDefault(); // Prevenir el comportamiento predeterminado del formulario

    var nombre = document.getElementById("nombre").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("pass").value;
    var telefono = document.getElementById("telefono").value;
    var direccion = document.getElementById("direccion").value;
    var piso = document.getElementById("piso").value;
    var cp = document.getElementById("cp").value;
    var provincia = document.getElementById("provincia").value;
    var pais = document.getElementById("pais").value;

    var usuarioEditado = {
        nombre: nombre,
        email: email,
        password: password,
        telefono: telefono,
        direccion: direccion,
        piso: piso,
        cp: cp,
        provincia: provincia,
        pais: pais
    };

    // Actualizar los datos del usuario en el array (si es necesario)
    sessionStorage.setItem('usuario', JSON.stringify(usuarioEditado));

    console.log("Usuario actualizado:", usuarioEditado);
}

function eliminarCuenta(event) {
    event.preventDefault(); // Prevenir el comportamiento predeterminado del formulario

    var email = document.getElementById("email").value;
    var index = correosRegistrados.indexOf(email);
    if (index > -1) {
        correosRegistrados.splice(index, 1);
        console.log("Usuario eliminado:", email);
    }
}

/////////
function newUser() {
    if (verificarDatosIngresados()) {
        var email = document.getElementById("email").value;

        // Verificar si el correo ya está registrado
        verificarEmailRepetido(email)
            .then(() => {
                // Si el correo no está repetido, crear el nuevo usuario
                var nombre = document.getElementById("nombre").value;
                var password = document.getElementById("pass").value;
                var telefono = document.getElementById("telefono").value;
                var direccion = document.getElementById("direccion").value;
                var piso = document.getElementById("piso").value;
                var cp = document.getElementById("cp").value;
                var provincia = document.getElementById("provincia").value;
                var pais = document.getElementById("pais").value;

                var newUser = {
                    nombre: nombre,
                    email: email,
                    password: password,
                    telefono: telefono,
                    direccion: direccion,
                    piso: piso,
                    cp: cp,
                    provincia: provincia,
                    pais: pais
                };
                usuario.push(newUser);
                alert("Usuario creado correctamente");
                console.log("Nuevo usuario añadido:", newUser);
                limpiarFormulario();
            })
            .catch((error) => {
                mostrarError(document.getElementById("email"), error);
            });
    }
}



function verificarEmailRepetido(email) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (correosRegistrados.includes(email)) {
                reject('El correo electrónico ya está registrado.');
            } else {
                correosRegistrados.push(email); // Agregar el nuevo correo a la lista
                resolve();
            }
        }, 1000);
    });
}

function verificarDatosIngresados() {
    var nombre = document.getElementById("nombre").value.trim();
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("pass").value.trim();
    var telefono = document.getElementById("telefono").value.trim();
    var direccion = document.getElementById("direccion").value.trim();
    var piso = document.getElementById("piso").value.trim();
    var cp = document.getElementById("cp").value.trim();
    var provincia = document.getElementById("provincia").value.trim();
    var pais = document.getElementById("pais").value.trim();
    var valid = true;

    // Validación de nombre
    if (nombre === '') {
        mostrarError(document.getElementById("nombre"), 'Debe ingresar un nombre.');
        valid = false;
    } else if (nombre.length < 3) {
        mostrarError(document.getElementById("nombre"), 'El nombre debe tener al menos 3 caracteres.');
        valid = false;
    } else {
        ocultarError(document.getElementById("nombre"));
    }

    // Validación de email
    if (email === '') {
        mostrarError(document.getElementById("email"), 'Por favor ingrese un email.');
        valid = false;
    } else if (!validateEmail(email)) {
        mostrarError(document.getElementById("email"), 'Por favor ingrese un email válido (usuario@mail.com).');
        valid = false;
    } else {
        ocultarError(document.getElementById("email"));
    }

    // Validación de contraseña
    if (password === '') {
        mostrarError(document.getElementById("pass"), 'Por favor ingrese una contraseña.');
        valid = false;
    } else {
        ocultarError(document.getElementById("pass"));
    }

    // Validación de teléfono
    if (telefono === '') {
        mostrarError(document.getElementById("telefono"), 'Por favor ingrese un teléfono.');
        valid = false;
    } else if (!validatePhone(telefono)) {
        mostrarError(document.getElementById("telefono"), 'Por favor ingrese un teléfono válido (ej. 2990000000).');
        valid = false;
    } else {
        ocultarError(document.getElementById("telefono"));
    }

    // Validación de dirección
    if (direccion === '') {
        mostrarError(document.getElementById("direccion"), 'Por favor ingrese una dirección.');
        valid = false;
    } else {
        ocultarError(document.getElementById("direccion"));
    }

    // Validación de código postal
    if (cp === '') {
        mostrarError(document.getElementById("cp"), 'Por favor ingrese un código postal.');
        valid = false;
    } else {
        ocultarError(document.getElementById("cp"));
    }

    // Validación de provincia
    if (provincia === '') {
        mostrarError(document.getElementById("provincia"), 'Por favor ingrese una provincia.');
        valid = false;
    } else {
        ocultarError(document.getElementById("provincia"));
    }

    // Validación de país
    if (pais === '') {
        mostrarError(document.getElementById("pais"), 'Por favor ingrese un país.');
        valid = false;
    } else {
        ocultarError(document.getElementById("pais"));
    }

    return valid;
}

function limpiarFormulario() {
    document.getElementById("nombre").value = "";
    document.getElementById("email").value = "";
    document.getElementById("pass").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("direccion").value = "";
    document.getElementById("piso").value = "";
    document.getElementById("cp").value = "";
    document.getElementById("provincia").value = "";
    document.getElementById("pais").value = "";

    // Opcional: Restaurar clases de error y mensajes de error a su estado inicial
    var campos = document.querySelectorAll('.campo');
    campos.forEach(function(campo) {
        ocultarError(campo.querySelector('input'));
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(tel) {
    const re = /^\d{10}$/; // Acepta solo números de 10 dígitos
    return re.test(tel);
}

function mostrarError(campo, mensaje) {
    var errorSpan = campo.nextElementSibling;
    if (errorSpan && errorSpan.classList.contains('error-message')) {
        errorSpan.innerText = mensaje;
        errorSpan.style.display = 'block';
    }
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
