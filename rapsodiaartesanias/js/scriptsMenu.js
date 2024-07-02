/*DECLARAMOS NUESTRAS VARIABLES PARA PODER CREAR LAS FUNCIONES NECESARIAS PARA LAS ACCIONES DE NUESTRO MENU */
///ACCION PARA ABRIR Y CERRAR MENU DE MI CUENTA
const miCuenta = document.querySelector('.miCuenta');
const menuCuenta = document.querySelector('.menu-cuenta');
///ACCION PARA ABRIR Y CERRAR MENU cuando la pantalla es muy chica
const menuHamIcon = document.querySelector('.menu');
const menuDesplegable = document.querySelector('.menu-chico');
////Menu carrito
const menuCarritoIcon = document.querySelector('.nav-compra-carrito');
const asideCarrito = document.querySelector('.producto-detail');
const cartCount = document.getElementById('cart-count'); // Contador del carrito

/*Eventos*/
miCuenta.addEventListener('click', toogleMenuCuenta);
menuHamIcon.addEventListener('click', toogleMenuDesplegable);
menuCarritoIcon.addEventListener('click', toggleCarritoMenu);

/*Funciones*/
function toogleMenuCuenta() {
    const isCarritoMenuClosed = asideCarrito.classList.contains('inactive');
    if (!isCarritoMenuClosed) {
        asideCarrito.classList.add('inactive')
    }
    productDetailAsideClose();
    menuCuenta.classList.toggle('inactive');
}

function toogleMenuDesplegable() {
    const isCarritoMenuClosed = asideCarrito.classList.contains('inactive');
    if (!isCarritoMenuClosed) {
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
// Productos iniciales
const initialProducts = [
    {
        name: 'Cartera Tejida',
        price: 35000,
        image: 'img/cartera1.jpg',
        stock: 3,
        detalle: 'Cartera de cuero y tejiada a mano con diseño personalizado'
    },
    {
        name: 'Libreta',
        price: 1500,
        image: 'img/libreta1.jpg',
        stock: 3,
        detalle: 'Libreta de cuero con diseño personalizado y pintado a mano'
    },
    {
        name: 'Bolso p/Asado',
        price: 25000,
        image: 'img/bolso_asado1.jpg',
        stock: 1,
        detalle: 'Bolso de cuero para transportar utensillos de asado, con compartimentos'
    }
];

// Cargar productos iniciales o desde localStorage
let productListCarrito = JSON.parse(localStorage.getItem('cart')) || initialProducts;

// Seleccionar el contenedor del detalle de la orden
const orderContent = document.querySelector('.mi-orden-contenido');

// Guardar el carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(productListCarrito));
}

function createCartItem(product) {
    const shoppingCart = document.createElement('div');
    shoppingCart.classList.add('shopping-cart');

    const productImg = document.createElement('figure');
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    productImg.appendChild(img);

    const productName = document.createElement('p');
    productName.textContent = product.name;

    const productPrice = document.createElement('p');
    productPrice.textContent = `$${product.price.toFixed(2)}`;

    const closeIcon = document.createElement('img');
    closeIcon.src = 'img/icons/close.png';
    closeIcon.alt = 'close';
    closeIcon.classList.add('cursor-pointer');
    closeIcon.addEventListener('click', () => removeFromCart(product.name)); // Elimina el producto del carrito al hacer clic en el ícono

    shoppingCart.appendChild(productImg);
    shoppingCart.appendChild(productName);
    shoppingCart.appendChild(productPrice);
    shoppingCart.appendChild(closeIcon);

    return shoppingCart;
}

function updateCar() {
    orderContent.innerHTML = '';

    productListCarrito.forEach(product => {
        const shoppingCartItem = createCartItem(product);
        orderContent.appendChild(shoppingCartItem);
    });

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

    const checkoutButton = document.createElement('button');
    checkoutButton.classList.add('btncarrito');
    checkoutButton.textContent = 'Finalizar Compra';
    checkoutButton.addEventListener('click', openModalFinalCompra);

    orderContent.appendChild(checkoutButton);

    cartCount.textContent = productListCarrito.length;

    saveCart();
}
// Función para agregar productos al carrito
function addToCart(prodNombre, prodPrice, prodImg, prodstock) {
    const productToAdd = productList.find(product => product.name === prodNombre);
    if (productToAdd && productToAdd.stock > 0) {
        productToAdd.stock--;
        productListCarrito.push({
            name: prodNombre,
            price: prodPrice,
            image: prodImg,
            stock: prodstock
        });
        updateCar();
        poblarModal(); // Asegurarse de actualizar el modal también
        alert('Producto Agregado al carrito.');
    } else {
        alert('No hay suficiente stock disponible.');
    }
}
// Función para eliminar productos del carrito
function removeFromCart(productName) {
    const index = productListCarrito.findIndex(item => item.name === productName);

    if (index !== -1) {
        const removedProduct = productList.find(product => product.name === productName);
        if (removedProduct) {
            removedProduct.stock++;
        }

        productListCarrito.splice(index, 1);
        updateCar();
        poblarModal();
    }
}

function creatListCarrito() {
    updateCar();
    poblarModal();
}

document.addEventListener('DOMContentLoaded', creatListCarrito);

//////////
document.getElementById('editLink').addEventListener('click', function (e) {
    e.preventDefault();
    sessionStorage.setItem('usuario', JSON.stringify(usuario[0]));
    window.location.href = 'edit_usuario.html';
});

//////Modal vista de vompra realizadas
function openModal() {
    document.getElementById("orderModal").style.display = "block";
}

function closeModal() {
    document.getElementById("orderModal").style.display = "none";
}

window.onclick = function (event) {
    const modal = document.getElementById("orderModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

/////////////////////////////////////////Modal de finalizar compra
// Función para crear los elementos del producto en el carrito

function crearElementoProducto(producto) {
    const contenedorProducto = document.createElement('div');
    contenedorProducto.classList.add('product-container');

    const imagenProducto = document.createElement('img');
    imagenProducto.src = producto.image;
    imagenProducto.alt = producto.name;
    contenedorProducto.appendChild(imagenProducto);

    const descripcionProducto = document.createElement('div');
    descripcionProducto.classList.add('product-description');
    descripcionProducto.innerText = producto.name;
    contenedorProducto.appendChild(descripcionProducto);

    const stockProducto = document.createElement('div');
    stockProducto.classList.add('product-stock');
    stockProducto.innerText = `Stock: ${producto.stock}`;
    contenedorProducto.appendChild(stockProducto);

    const contenedorCantidad = document.createElement('div');
    contenedorCantidad.classList.add('quantity-container');

    const inputCantidad = document.createElement('input');
    inputCantidad.type = 'number';
    inputCantidad.value = 1;
    inputCantidad.min = 1;
    inputCantidad.max = producto.stock;
    contenedorCantidad.appendChild(inputCantidad);

    const botonAgregar = document.createElement('button');
    botonAgregar.innerText = '+';
    contenedorCantidad.appendChild(botonAgregar);

    // Evento para aumentar la cantidad del producto considerando el stock
    botonAgregar.addEventListener('click', () => {
        const cantidadActual = parseInt(inputCantidad.value);
        if (cantidadActual < producto.stock) {
            inputCantidad.value = cantidadActual + 1;
        } else {
            alert('No puedes agregar más de este producto. Stock limitado.');
        }
    });

    contenedorProducto.appendChild(contenedorCantidad);

    const precioProducto = document.createElement('div');
    precioProducto.classList.add('product-price');
    precioProducto.innerText = `$${producto.price.toFixed(2)}`;
    contenedorProducto.appendChild(precioProducto);

    const divBtnDelete = document.createElement('div');
    const botonEliminar = document.createElement('img');
    botonEliminar.classList.add('delete-button');
    botonEliminar.src = 'img/icons/eliminar.png';
    divBtnDelete.appendChild(botonEliminar);

    contenedorProducto.appendChild(divBtnDelete);

    botonEliminar.addEventListener('click', () => {
        console.log(`Intentando eliminar: ${producto.name}`);
        removeFromCart(producto.name);
    });

    return contenedorProducto;
}

// Función para poblar el modal del carrito
function poblarModal() {
    const contenedorProductosModal = document.querySelector('.contendor-productos-Modal');
    contenedorProductosModal.innerHTML = '';

    productListCarrito.forEach(producto => {
        const elementoProducto = crearElementoProducto(producto);
        contenedorProductosModal.appendChild(elementoProducto);
    });

    const contenedorAcciones = document.querySelector('.contenedor-btn-finalizar-Compra');
    contenedorAcciones.innerHTML = '';

    const botonContinuar = document.createElement('button');
    botonContinuar.classList.add('btncontinuarCompra');
    botonContinuar.innerText = 'Continuar Compra';
    contenedorAcciones.appendChild(botonContinuar);

    botonContinuar.addEventListener('click', abrirModalConfirmarCompra);

    const botonCancelar = document.createElement('button');
    botonCancelar.classList.add('btndeleteCompra');
    botonCancelar.innerText = 'Cancelar Compra';
    botonCancelar.addEventListener('click', limpiarCarrito);
    contenedorAcciones.appendChild(botonCancelar);
}

function limpiarCarrito() {
    productListCarrito.forEach(producto => {
        const productoEnCatalogo = productList.find(product => product.name === producto.name);
        if (productoEnCatalogo) {
            productoEnCatalogo.stock += producto.stock;
        }
    });

    productListCarrito.length = 0;
    updateCar();
    poblarModal();
    closeModalFinalCompra();
}

function openModalFinalCompra() {
    poblarModal();
    const modal = document.getElementById("finalCompraModal");
    if (modal) {
        modal.style.display = "block";
        asideCarrito.classList.toggle('inactive');
    } else {
        console.error("Modal no encontrado en el DOM");
    }
}

function closeModalFinalCompra() {
    const modal = document.getElementById("finalCompraModal");
    if (modal) {
        modal.style.display = "none";
    } else {
        console.error("Modal no encontrado en el DOM");
    }
}

window.onclick = function (event) {
    const modal = document.getElementById("finalCompraModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function abrirModalConfirmarCompra() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));

    if (usuario) {
        document.getElementById("nombre").value = usuario.nombre || '';
        document.getElementById("email").value = usuario.email || '';
        document.getElementById("pass").value = usuario.password || '';
        document.getElementById("telefono").value = usuario.telefono || '';
        document.getElementById("direccion").value = usuario.direccion || '';
        document.getElementById("piso").value = usuario.piso || '';
        document.getElementById("cp").value = usuario.cp || '';
        document.getElementById("provincia").value = usuario.provincia || '';
    }

    poblarResumenCompra();

    const modal = document.getElementById("confirmarCompra");
    if (modal) {
        modal.style.display = "block";
        closeModalFinalCompra();
    } else {
        console.error("Modal no encontrado en el DOM");
    }
}

// Función para cerrar el modal de confirmación de compra
function cerrarModalConfirmarCompra() {
    const modal = document.getElementById("confirmarCompra");
    if (modal) {
        modal.style.display = "none";
    } else {
        console.error("Modal no encontrado en el DOM");
    }
}

function openCartelConfirmacion() {
    const cartelFinal = document.getElementById('confirmationModal');
    if (cartelFinal) {
        cartelFinal.style.display = 'block';
        cerrarModalConfirmarCompra();
        limpiarCarrito();
    } else {
        console.error("Modal no encontrado en el DOM");
    }
}

function closeCartelConfirmacion() {
    const cartelFinal = document.getElementById('confirmationModal');
    if (cartelFinal) {
        cartelFinal.style.display = 'none';
    } else {
        console.error("Modal no encontrado en el DOM");
    }
}
function addToCartFromCatalog(product) {
    const productToAdd = productList.find(p => p.name === product.name);
    if (productToAdd && productToAdd.stock > 0) {
        productToAdd.stock--;
        productListCarrito.push({
            name: product.name,
            price: product.price,
            image: product.image,
            detalle: product.detalle
        });
        updateCar();
        poblarModal(); // Asegurarse de actualizar el modal también
        alert('Producto agregado al carrito desde el catálogo.');
    } else {
        alert('No hay suficiente stock disponible.');
    }
}

// Crear un elemento del resumen de compra
function createSummaryItem(product) {
    const shoppingCart = document.createElement('div');
    shoppingCart.classList.add('shopping-cart');

    const productImg = document.createElement('figure');
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    productImg.appendChild(img);

    const productName = document.createElement('p');
    productName.textContent = product.name;

    const productPrice = document.createElement('p');
    productPrice.textContent = `$${product.price.toFixed(2)}`;

    shoppingCart.appendChild(productImg);
    shoppingCart.appendChild(productName);
    shoppingCart.appendChild(productPrice);

    return shoppingCart;
}

// Poblar el modal de resumen de compra
function poblarResumenCompra() {
    const contenedorResumen = document.querySelector('.mi-orden-contenido-confirmado');
    contenedorResumen.innerHTML = '';

    const resumenContent = document.createElement('div');
    resumenContent.classList.add('my-order-content');

    productListCarrito.forEach(product => {
        const summaryItem = createSummaryItem(product);
        resumenContent.appendChild(summaryItem);
    });

    const total = productListCarrito.reduce((acc, product) => acc + product.price, 0);
    const orderTotal = document.createElement('div');
    orderTotal.classList.add('order');

    const totalText = document.createElement('p');
    totalText.innerHTML = '<span>Total</span>';
    const totalPrice = document.createElement('p');
    totalPrice.textContent = `$${total.toFixed(2)}`;

    orderTotal.appendChild(totalText);
    orderTotal.appendChild(totalPrice);

    resumenContent.appendChild(orderTotal);
    contenedorResumen.appendChild(resumenContent);
}

// Función para abrir el modal de finalizar compra
function openModalFinalCompra() {
    poblarModal();
    const modal = document.getElementById("finalCompraModal");
    if (modal) {
        modal.style.display = "block";
        asideCarrito.classList.toggle('inactive');
    } else {
        console.error("Modal no encontrado en el DOM");
    }
}

// Función para cerrar el modal de finalizar compra
function closeModalFinalCompra() {
    const modal = document.getElementById("finalCompraModal");
    if (modal) {
        modal.style.display = "none";
    } else {
        console.error("Modal no encontrado en el DOM");
    }
}

// Inicializar el carrito y los datos del usuario
document.addEventListener('DOMContentLoaded', function() {
    inicializarCuenta();
    creatListCarrito();
});