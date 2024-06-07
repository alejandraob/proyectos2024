//querySelector

const heading=document.querySelector('h2'); //selecciona el primer h2
//console.log(heading);
//heading.textContent='Nuevo Heading'; //cambia el texto del h2


//querySelectorAll
const enlaces=document.querySelectorAll('.navegacion a');
//console.log(enlaces[0]);


//queryEmelentById
const heading2=document.getElementById('heading');
//console.log(heading2);


//Generar un nuevo enlace
const nuevoEnlace=document.createElement('A'); //crea un enlace
//agregar el href
nuevoEnlace.href='nuevo-enlace.html'; //agrega el href al enlace creado anteriormente 
//agregar el texto
nuevoEnlace.textContent='Un nuevo enlace'; //agrega el texto al enlace creado anteriormente
//agregar la clase
nuevoEnlace.classList.add('navegacion-enlace'); //agrega la clase al enlace creado anteriormente
//agregarlo al documento
const navegacion=document.querySelector('.navegacion'); //selecciona la clase navegacion
//navegacion.appendChild(nuevoEnlace); //agrega el enlace creado al final de la clase navegacion

//console.log(nuevoEnlace);

//Seleccionar elementos y asociarles un evento 
//const btnEnviar=document/querySelector('.boton--primario');
//btnEnviar.addEventListener('click',function(evento){ //cuando se haga click en el boton se ejecutara la funcion
  //  evento.preventDefault(); //previene la accion por defecto





  //0  console.log('enviando formulario'); //muestra un mensaje en la consola
//});

/*
//eventos en los inputs y textarea
const nombre=document.querySelector('#nombre'); //selecciona el input con el id nombre
nombre.addEventListener('input',function(evento){ //cuando se escriba en el input se ejecutara la funcion y se mostrara en la consola lo que se escriba en el input
    console.log(evento.target.value); //muestra en la consola lo que se escriba en el input
});
const mail=document.querySelector('#email'); //selecciona el input con el id email
mail.addEventListener('input',function(evento){ //cuando se escriba en el input se ejecutara la funcion y se mostrara en la consola lo que se escriba en el input
    console.log(evento.target.value); //muestra en la consola lo que se escriba en el input
});
const mensaje=document.querySelector('#mensaje'); //selecciona el textarea con el id mensaje
mensaje.addEventListener('input',function(evento){ //cuando se escriba en el textarea se ejecutara la funcion y se mostrara en la consola lo que se escriba en el textarea
    console.log(evento.target.value); //muestra en la consola lo que se escriba en el textarea
});*/
const datos={
    nombre:'',
    email:'',
    mensaje:''
}

const nombre=document.querySelector('#nombre'); 
const mail=document.querySelector('#email');
const mensaje=document.querySelector('#mensaje');

nombre.addEventListener('input',leerTexto);
mail.addEventListener('input',leerTexto);
mensaje.addEventListener('input',leerTexto);

function leerTexto(e){ //funcion que se ejecuta cuando se escribe en los inputs
   // console.log(e.target.value); //muestra en la consola lo que se escribe en los inputs
 //   console.log('escribiendo');     //muestra en la consola un mensaje cuando se escribe en los inputs pero no el contenido de lo escrito
   // console.log(datos);
    datos[e.target.id]=e.target.value; //guarda en el objeto datos lo que se escribe en los inputs
    console.log(datos);
}

//eventos de submit
const formulario=document.querySelector('.formulario'); //selecciona la clase formulario
formulario.addEventListener('submit',function(evento){ //cuando se envie el formulario se ejecutara la funcion
    evento.preventDefault(); //previene la accion por defecto
    //validar el formulario
    const {nombre,email,mensaje}=datos; //extrae los valores del objeto datos
    if(nombre===''|| email===''|| mensaje===''){ //si los campos estan vacios
        mostrarAlerta('Todos los campos son obligatorios','error'); //muestra una alerta de error
        return; //detiene la ejecucion del codigo
    }
    //enviar el formulario
    mostrarAlerta('Enviando...'); //muestra una alerta de envio
});

function mostrarAlerta(mensaje,error=null){ //funcion que muestra una alerta
    const alerta=document.createElement('P'); //crea un parrafo
    alerta.textContent=mensaje; //agrega el mensaje al parrafo
    if(error){ //si hay un error
        alerta.classList.add('error'); //agrega la clase error al parrafo
    }else{ //si no hay error
        alerta.classList.add('correcto'); //agrega la clase correcto al parrafo
    }
    formulario.appendChild(alerta); //agrega el parrafo al formulario
    setTimeout(() => { //despues de 5 segundos
        alerta.remove(); //elimina la alerta
    }, 5000);
}