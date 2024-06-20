/*DECLARAMOS NUESTRAS VARIABLES PARA PODER CREAR LAS FUNCIONES NECESARIAS PARA LAS ACCIONES DE NUESTRO MENU */
///ACCION PARA ABRIR Y CERRAR MENU DE MI CUENTA
const miCuenta=document.querySelector('.miCuenta');
const menuCuenta=document.querySelector('.menu-cuenta');
///ACCION PARA ABRIR Y CERRAR MENU cuando la pantalla es muy chica
const menuHamIcon = document.querySelector('.menu');
const menuDesplegable=document.querySelector('.menu-chico');
////Menu carrito
const menuCarritoIcon = document.querySelector('.nav-compra-carrito');
const asideCarrito = document.querySelector('.producto-detail');
const cartCount = document.getElementById('cart-count'); // Contador del carrito


/*Eventos*/
miCuenta.addEventListener('click', toogleMenuCuenta);
menuHamIcon.addEventListener('click',toogleMenuDesplegable);
menuCarritoIcon.addEventListener('click', toggleCarritoMenu);


/*Funciones*/
function toogleMenuCuenta(){

    const isCarritoMenuClosed = asideCarrito.classList.contains('inactive');
    if(!isCarritoMenuClosed){
        asideCarrito.classList.add('inactive')
    }
   productDetailAsideClose();
    menuCuenta.classList.toggle('inactive');
}

function toogleMenuDesplegable(){
    const isCarritoMenuClosed = asideCarrito.classList.contains('inactive');
    if(!isCarritoMenuClosed){
        asideCarrito.classList.add('inactive')
    }
    productDetailAsideClose();
    menuDesplegable.classList.toggle('inactive');

}
function toggleCarritoMenu() {
    const isMenuCuentaClosed = menuCuenta.classList.contains('inactive');
    const isMenuDesplegableClosed = menuDesplegable.classList.contains('inactive');


    if (!isMenuCuentaClosed) {
        menuCuenta.classList.add('inactive');
    }
    if (!isMenuDesplegableClosed) {
        menuDesplegable.classList.add('inactive');
    }
    productDetailAsideClose();
    asideCarrito.classList.toggle('inactive');

}



const productListCarrito = [
    {
        name: 'Cartera Tejida',
        price: 35000,
        image: 'img/cartera1.jpg',
    },
    {
        name: 'Libreta',
        price: 1500,
        image: 'img/libreta1.jpg',
    },
    {
        name: 'Bolso p/Asado',
        price: 25000,
        image: 'img/bolso_asado1.jpg',
    }
];

// Seleccionar el contenedor del detalle de la orden
const orderContent = document.querySelector('.mi-orden-contenido');

function createCartItem(product) {
    // Crear un elemento para cada producto
    const shoppingCart = document.createElement('div');
    shoppingCart.classList.add('shopping-cart');

    // Crear elemento para la imagen del producto
    const productImg = document.createElement('figure');
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    productImg.appendChild(img);

    // Crear elementos para el nombre y precio del producto
    const productName = document.createElement('p');
    productName.textContent = product.name;

    const productPrice = document.createElement('p');
    productPrice.textContent = `$${product.price.toFixed(2)}`;

    // Crear elemento para el ícono de cerrar
    const closeIcon = document.createElement('img');
    closeIcon.src = 'img/icons/close.png';
    closeIcon.alt = 'close';
    closeIcon.classList.add('cursor-pointer');
    closeIcon.addEventListener('click', () => removeFromCart(product.name)); // Elimina el producto del carrito al hacer clic en el ícono


    // Agregar todos los elementos al contenedor del producto
    shoppingCart.appendChild(productImg);
    shoppingCart.appendChild(productName);
    shoppingCart.appendChild(productPrice);
    shoppingCart.appendChild(closeIcon);

    return shoppingCart;
}

function updateCar() {
    // Limpiar contenido existente dentro del contenedor
    orderContent.innerHTML = '';

    // Iterar sobre cada producto en el array y agregarlo al contenedor
    productListCarrito.forEach(product => {
        const shoppingCartItem = createCartItem(product);
        orderContent.appendChild(shoppingCartItem);
    });

    // Calcular y mostrar el total de la orden
    const total = productListCarrito.reduce((acc, product) => acc + product.price, 0);
    const orderTotal = document.createElement('div');
    orderTotal.classList.add('order');

    const totalText = document.createElement('p');
    totalText.innerHTML = '<span>Total</span>';
    const totalPrice = document.createElement('p');
    totalPrice.textContent = `$${total.toFixed(2)}`;

    orderTotal.appendChild(totalText);
    orderTotal.appendChild(totalPrice);

    orderContent.appendChild(orderTotal);

    // Agregar botón de checkout
    const checkoutButton = document.createElement('button');
    checkoutButton.classList.add('btncarrito');
    checkoutButton.textContent = 'Finalizar Compra';

    orderContent.appendChild(checkoutButton);

    // Actualizar contador del carrito
    cartCount.textContent = productListCarrito.length;
}

function addToCart(prodNombre, prodPrice, prodImg) {
    const productToAdd = productList.find(product => product.name === prodNombre);
    if (productToAdd && productToAdd.stock > 0) {
        // Restar una unidad del stock del producto
        productToAdd.stock--;
        // Agregar el producto al carrito
        productListCarrito.push({
            name: prodNombre,
            price: prodPrice,
            image: prodImg
        });
        updateCar(); // Actualiza la vista del carrito
        alert('Producto Agregado al carrito.');
    } else {
        alert('No hay suficiente stock disponible.');
    }
}

function removeFromCart(productName) {
    // Encuentra el índice del producto en el carrito
    const index = productListCarrito.findIndex(item => item.name === productName);
    
    // Si el producto está en el carrito, remuévelo
    if (index !== -1) {
        // Incrementar el stock del producto eliminado del carrito
        const removedProduct = productList.find(product => product.name === productName);
        if (removedProduct) {
            removedProduct.stock++;
        }
        
        productListCarrito.splice(index, 1); // Remueve el producto del array
        updateCar(); // Actualiza la vista del carrito
    }
}

// Crear la lista inicial del carrito
function creatListCarrito() {
    updateCar();
}

// Inicializar la lista del carrito cuando se cargue la página
creatListCarrito();

//////////
document.getElementById('editLink').addEventListener('click', function (e) {
    e.preventDefault();
    sessionStorage.setItem('usuario', JSON.stringify(usuario[0]));
    window.location.href = 'edit_usuario.html';
});




//////Modal
// Función para abrir el modal
function openModal() {
    document.getElementById("orderModal").style.display = "block";
}

// Función para cerrar el modal
function closeModal() {
    document.getElementById("orderModal").style.display = "none";
}

// Cerrar el modal si el usuario hace clic fuera del modal
window.onclick = function(event) {
    const modal = document.getElementById("orderModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
