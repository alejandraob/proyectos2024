//////Acciones de menu desplegable mini
const menuEmail = document.querySelector('.navbar-email');
const desktopMenu = document.querySelector('.desktop-menu');
//////////////////MENU MOBILE
const menuHamIcon = document.querySelector('.menu');
const mobileMenu = document.querySelector('.mobile-menu');
////Menu carrito
const menuCarritoIcon = document.querySelector('.navbar-shopping-cart');
const asideCarrito = document.querySelector('.product-detail');
///
const cardsContainer = document.querySelector('.cards-container');

//INFO PRODUCTO
const infoProducti = document.querySelector('.product-detailInfo');
const productDetailIconClose = document.querySelector('.product-detailInfo-close');
//const asideCarrito=document.querySelector('.product-detail');

//Mis ordenes

const SelectMisOrdenes = document.querySelector('.misOrdenes');
const MisOrdenes = document.querySelector('.listaMisOrdenes');

//////////////////////

menuEmail.addEventListener('click', toggleDesktopMenu);
menuHamIcon.addEventListener('click', toggleMobileMenu);
menuCarritoIcon.addEventListener('click', toggleCarritoMenu);
productDetailIconClose.addEventListener('click', productDetailAsideClose);
SelectMisOrdenes.addEventListener('click', toggleListaMisOrdenes);

///////////////////////////////

//funcion para abrir y cerrar menu usuario

function toggleDesktopMenu() {
    const isCarritoMenuClosed = asideCarrito.classList.contains('inactive');
    const isinfoProductClosed = infoProducti.classList.contains('inactive');

    if (!isCarritoMenuClosed) {
        asideCarrito.classList.add('inactive');
    }
    if (!isinfoProductClosed) {
        infoProducti.classList.add('inactive');
    }

    desktopMenu.classList.toggle('inactive');


}
//funcion para abrir y cerrar menu barra navegador en modo pantalla chica
function toggleMobileMenu() {
    const isCarritoMenuClosed = asideCarrito.classList.contains('inactive');
    productDetailAsideClose();
    if (!isCarritoMenuClosed) {
        asideCarrito.classList.add('inactive');
    }
    mobileMenu.classList.toggle('inactive');
}

//Funcion para  abrir y cerrar carrito
function toggleCarritoMenu() {
    const isMobileMenuClosed = mobileMenu.classList.contains('inactive');
    const isDesktopClosed = desktopMenu.classList.contains('inactive');
    const isinfoProductClosed = infoProducti.classList.contains('inactive');
    const isMiListaOrderClosed = MisOrdenes.classList.contains('inactive');

    if (!isMobileMenuClosed) {
        mobileMenu.classList.add('inactive');
    }
    if (!isDesktopClosed) {
        desktopMenu.classList.add('inactive');
    }
    if (!isinfoProductClosed) {
        infoProducti.classList.add('inactive');
    }
    if (!isMiListaOrderClosed) {
        MisOrdenes.classList.add('inactive');
    }

    asideCarrito.classList.toggle('inactive');

}


//Funcion para abrir infoproducto
function openProductDetailAside() {
    asideCarrito.classList.add('inactive');
    mobileMenu.classList.add('inactive');
    desktopMenu.classList.add('inactive');
    MisOrdenes.classList.add('inactive');
    infoProducti.classList.remove('inactive');
}

function productDetailAsideClose() {

    infoProducti.classList.add('inactive');

}

//Funcion para abrir mi lista de ordenes
function toggleListaMisOrdenes() {
    const isCarritoMenuClosed = asideCarrito.classList.contains('inactive');

    if (!isCarritoMenuClosed) {
        asideCarrito.classList.add('inactive');
    }

    MisOrdenes.classList.toggle('inactive');

}

//////Array + objeto para construir el producto
const productList = [];
productList.push(
    {
        name: 'BIKE',
        price: 963,
        image: 'img/pexels-dreamypixel-552774.jpg',
        stock: 3
    }
);
productList.push(
    {
        name: 'Reloj',
        price: 693,
        image: 'img/pexels-dreamypixel-552774.jpg',
        stock: 5
    }
);
productList.push(
    {
        name: 'Silla',
        price: 1466,
        image: 'img/pexels-dreamypixel-552774.jpg',
        stock: 4
    }
);
productList.push(
    {
        name: 'Mesa',
        price: 25963,
        image: 'img/pexels-dreamypixel-552774.jpg',
        stock: 0
    }
);


///Construccion de un Elemento DIV para crear una CARDPRODUCTO

for (product of productList) {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    const productImg = document.createElement('img');
    //product={name, price, image}->product.image
    productImg.setAttribute('src', product.image);
    productImg.addEventListener('click', openProductDetailAside);

    const productInfo = document.createElement('div');
    productInfo.classList.add('product-info');

    const productInfoDiv = document.createElement('div');

    const productPrice = document.createElement('p');
    productPrice.innerText = '$' + product.price;
    const productNAme = document.createElement('p');
    productNAme.innerText = product.name;

    // Creamos un elemento para el stock del producto
    const productStock = document.createElement('span');
    productStock.innerText = 'Stock: ' + product.stock;

    productInfoDiv.appendChild(productPrice);
    productInfoDiv.appendChild(productNAme);
    productInfoDiv.appendChild(productStock);

    const productInfoFigure = document.createElement('figure');
    const productImgCard = document.createElement('img');
    productImgCard.setAttribute('src', 'img/icons/bt_add_to_cart.svg');

    // Agregamos un evento de clic al botón de agregar al carrito
    /*productImgCard.addEventListener('click', () => {
        // Aquí puedes agregar la lógica para añadir el producto al carrito
        // Por ejemplo: addToCart(product);
        addToCart(product.name,product.price,product.image);
        alert('Producto agregado al carrito: ' + product.name);
    });*/

    // Usamos una función de fábrica para capturar el producto actual en el bucle
    (function(product) {
        productImgCard.addEventListener('click', () => {
            addToCart(product.name, product.price, product.image);
            alert('Producto agregado al carrito: ' + product.name);
        });
    })(product);

    productInfoFigure.appendChild(productImgCard);
    productInfo.appendChild(productInfoDiv);
    productInfo.appendChild(productInfoFigure);
    productCard.appendChild(productImg);
    productCard.appendChild(productInfo);
    cardsContainer.appendChild(productCard);

}
///////////////////////////////////////////Lista Carrito
const productListCarrito = [
    {
        name: 'Bike',
        price: 30,
        image: 'https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    },
    {
        name: 'Bike',
        price: 30,
        image: 'https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    },
    {
        name: 'Bike',
        price: 30,
        image: 'https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    }
];

// Seleccionar el contenedor del detalle de la orden
const orderContent = document.querySelector('.my-order-content');

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
    closeIcon.src = 'img/icons/icon_close.png';
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
    checkoutButton.classList.add('primary-button');
    checkoutButton.textContent = 'Checkout';

    orderContent.appendChild(checkoutButton);
}

function addToCart(prodNombre, prodPrice, prodImg) {
    productListCarrito.push({
        name: prodNombre,
        price: prodPrice,
        image: prodImg
    });
    updateCar();
}


// Función para eliminar un producto del carrito
function removeFromCart(productName) {
    // Encuentra el índice del producto en el carrito
    const index = productListCarrito.findIndex(item => item.name === productName);
    
    // Si el producto está en el carrito, remuévelo
    if (index !== -1) {
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

