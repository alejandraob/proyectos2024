var correosRegistrados = ['jperez@gmail.com', 'usuario1@mail.com', 'usuario2@mail.com'];
// Función para inicializar la cuenta con datos predeterminados
function inicializarCuenta() {
    var usuarios = localStorage.getItem('usuarios');
    // Si no hay usuarios registrados, se agrega un usuario predeterminado
    if (!usuarios) {
        localStorage.setItem('usuarios', JSON.stringify([{ //JSON.stringify que es un metodo de JS que se usa para convertir un objeto JavaScript o un valor en una cadena de texto JSON 
            nombre: "Juan Perez",
            email: "jperez@gmail.com",
            password: "123456",
            telefono: "1234567890",
            direccion: "Calle Falsa 123",
            piso: "",
            cp: "1234",
            provincia: "Springfield",
            pais: "Argentina",
        }]));
    }
    // Aseguramos que usuarioActual esté bien definido
    if (!localStorage.getItem('usuarioActual')) {
        localStorage.setItem('usuarioActual', JSON.stringify({}));
    }
}
// Función para rellenar el formulario con los datos del usuario actual
function rellenarFormulario() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (usuario && usuario.email) {
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
// Función para editar la cuenta del usuario actual
function editarCuenta(event) {
    event.preventDefault(); //Es un evento de JS que se utiliza para prevenir el comportamiento por defecto de un evento.

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
     // Actualizar el usuario en la lista de usuarios
    var usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    usuarios = usuarios.map(u => u.email === email ? usuarioEditado : u);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioEditado));

    console.log("Usuario actualizado:", usuarioEditado);
    alert('Usuario actualizado correctamente');
}
// Función para eliminar la cuenta del usuario actual
function eliminarCuenta(event) {
    event.preventDefault();

    var email = document.getElementById("email").value;
    var usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    usuarios = usuarios.filter(user => user.email !== email);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.removeItem('usuarioActual');

    console.log("Usuario eliminado:", email);
    alert('Usuario eliminado correctamente');
    window.location.href = "login.html";
}
// Función para ingresar a la cuenta
function ingresarCuenta(event) {
    event.preventDefault();
    var usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    var email = document.getElementById("email").value;
    var password = document.getElementById("pass").value;
    var usuarioEncontrado = usuarios.find(user => user.email === email && user.password === password);
    var errorMessage = document.querySelector('.error-message');

    if (usuarioEncontrado) {
        console.log("Usuario encontrado:", usuarioEncontrado);
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioEncontrado));
        window.location.href = "index.html";
    } else {
        console.error("Usuario o contraseña incorrectos");
        errorMessage.textContent = "Usuario o contraseña incorrectos";
        errorMessage.style.display = 'block';
    }
}
// Función para registrar un nuevo usuario
function newUser() {
    if (verificarDatosIngresados()) {
        const email = document.getElementById("email").value;

        verificarEmailRepetido(email)
            .then(() => {
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

                var usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                usuarios.push(newUser);
                localStorage.setItem('usuarios', JSON.stringify(usuarios));
                console.log("Nuevo usuario añadido:", newUser);

                alert('Usuario Creado');
                window.location.href = "login.html";
            })
            .catch((error) => {
                mostrarError(document.getElementById("email"), error);
            });
    }
}
// Función para verificar si el email ya está registrado
function verificarEmailRepetido(email) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            var usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            if (usuarios.some(user => user.email === email)) {
                reject('El correo electrónico ya está registrado.');
            } else {
                resolve();
            }
        }, 1000);
    });
}
// Función para verificar los datos ingresados en el formulario
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

   // Validación del nombre
   if (nombre === '') {
    mostrarError(document.getElementById("nombre"), 'Debe ingresar un nombre.');
    valid = false;
} else if (nombre.length < 3) {
    mostrarError(document.getElementById("nombre"), 'El nombre debe tener al menos 3 caracteres.');
    valid = false;
} else {
    ocultarError(document.getElementById("nombre"));
}

// Validación del email
if (email === '') {
    mostrarError(document.getElementById("email"), 'Por favor ingrese un email.');
    valid = false;
} else if (!validateEmail(email)) {
    mostrarError(document.getElementById("email"), 'Por favor ingrese un email válido (usuario@mail.com).');
    valid = false;
} else {
    ocultarError(document.getElementById("email"));
}

// Validación de la contraseña
if (password === '') {
    mostrarError(document.getElementById("pass"), 'Por favor ingrese una contraseña.');
    valid = false;
} else {
    ocultarError(document.getElementById("pass"));
}

// Validación del teléfono
if (telefono === '') {
    mostrarError(document.getElementById("telefono"), 'Por favor ingrese un teléfono.');
    valid = false;
} else if (!validatePhone(telefono)) {
    mostrarError(document.getElementById("telefono"), 'Por favor ingrese un teléfono válido (ej. 2990000000).');
    valid = false;
} else {
    ocultarError(document.getElementById("telefono"));
}

// Validación de la dirección
if (direccion === '') {
    mostrarError(document.getElementById("direccion"), 'Por favor ingrese una dirección.');
    valid = false;
} else {
    ocultarError(document.getElementById("direccion"));
}

// Validación del código postal
if (cp === '') {
    mostrarError(document.getElementById("cp"), 'Por favor ingrese un código postal.');
    valid = false;
} else {
    ocultarError(document.getElementById("cp"));
}

// Validación de la provincia
if (provincia === '') {
    mostrarError(document.getElementById("provincia"), 'Por favor ingrese una provincia.');
    valid = false;
} else {
    ocultarError(document.getElementById("provincia"));
}

// Validación del país
if (pais === '') {
    mostrarError(document.getElementById("pais"), 'Por favor ingrese un país.');
    valid = false;
} else {
    ocultarError(document.getElementById("pais"));
}


    return valid;
}
// Función para limpiar el formulario
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

    var campos = document.querySelectorAll('.campo');
    campos.forEach(function(campo) {
        ocultarError(campo.querySelector('input'));
    });
}
// Función para validar el formato del email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
// Función para validar el formato del teléfono
function validatePhone(tel) {
    const re = /^\d{10}$/;
    return re.test(tel);
}
// Función para mostrar un mensaje de error junto a un campo
function mostrarError(campo, mensaje) {
    var errorSpan = campo.nextElementSibling;
    if (errorSpan && errorSpan.classList.contains('error-message')) {
        errorSpan.innerText = mensaje;
        errorSpan.style.display = 'block';
    }
    campo.classList.add('error');
}
// Función para ocultar el mensaje de error de un campo
function ocultarError(campo) {
    var errorSpan = campo.nextElementSibling;
    if (errorSpan && errorSpan.classList.contains('error-message')) {
        errorSpan.innerText = '';
        errorSpan.style.display = 'none';
    }
    campo.classList.remove('error');
}
// Función para modificar la contraseña del usuario actual
function modificarPass(event) {
    event.preventDefault();

    var pass = document.getElementById("pass").value;
    var pass2 = document.getElementById("new-pass").value;
    var errorMessage = document.querySelector('.error-message');

    if (pass === pass2) {
        //Utilizaremos JSON.parse para convertir una cadena de texto en un objeto JavaScript
        var usuario = JSON.parse(localStorage.getItem('usuarioActual')); //Utilizamos localStorage.getItem que es un metodo de JS para acceder a un valor almacenado en almacenamineto local del navegador
        var usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

        if (usuario && usuario.email) {
            usuario.password = pass;
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));//Aquí utilizamos localStorage.setItem que es un metodo de JS para almacenar datos en el almacenamiento local del navegador
            usuarios = usuarios.map(u => u.email === usuario.email ? usuario : u);
            localStorage.setItem('usuarios', JSON.stringify(usuarios)); //y lo que hacemos aqui es usar JSON.stringify que es un metodo de JS que se usa para convertir un objeto JavaScript o un valor en una cadena de texto JSON 
            document.getElementById("pass").value = "";
            document.getElementById("new-pass").value = "";
            alert("Contraseña modificada correctamente");
            window.location.href = "login.html";
        } else {
            errorMessage.textContent = "No hay usuario en sesión";
            errorMessage.style.display = 'block';
        }
    } else {
        errorMessage.textContent = "Las contraseñas no coinciden";
        errorMessage.style.display = 'block';
    }
}
// Inicializar la cuenta cuando se carga el documento
document.addEventListener('DOMContentLoaded', function() {
    inicializarCuenta();
});
