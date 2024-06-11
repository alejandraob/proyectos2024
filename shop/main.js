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



//////////////////////

menuEmail.addEventListener('click', toggleDesktopMenu);
menuHamIcon.addEventListener('click', toggleMobileMenu);
menuCarritoIcon.addEventListener('click', toggleCarritoMenu);
productDetailIconClose.addEventListener('click', productDetailAsideClose);


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

    if (!isMobileMenuClosed) {
        mobileMenu.classList.add('inactive');
    }
    if (!isDesktopClosed) {
        desktopMenu.classList.add('inactive');
    }
    if (!isinfoProductClosed) {
        infoProducti.classList.add('inactive');
    }

    asideCarrito.classList.toggle('inactive');

}


//Funcion para abrir infoproducto
function openProductDetailAside() {
    asideCarrito.classList.add('inactive');
    mobileMenu.classList.add('inactive');
    infoProducti.classList.remove('inactive');
}

function productDetailAsideClose() {

    infoProducti.classList.add('inactive');

}



//////Array + objeto para construir el producto
const productList = [];
productList.push(
    {
        name: 'BIKE',
        price: 963,
        image: './img/pexels-dreamypixel-552774.jpg'
    }
);
productList.push(
    {
        name: 'Reloj',
        price: 693,
        image: './img/pexels-dreamypixel-552774.jpg'
    }
);
productList.push(
    {
        name: 'Silla',
        price: 1466,
        image: './img/pexels-dreamypixel-552774.jpg'
    }
);
productList.push(
    {
        name: 'Mesa',
        price: 25963,
        image: './img/pexels-dreamypixel-552774.jpg'
    }
);


///Construccion de un Elemento DIV para crear una CARDPRODUCTO

for (product of productList) {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    const productImg = document.createElement('img');
    //product={name, price, image}->product.image
    productImg.setAttribute('src', product.image);
    productImg.addEventListener('click', openProductDetailAside)


    const productInfo = document.createElement('div');
    productInfo.classList.add('product-info');



    const productInfoDiv = document.createElement('div');

    const productPrice = document.createElement('p');
    productPrice.innerText = '$' + product.price;
    const productNAme = document.createElement('p');
    productNAme.innerText = product.name;

    productInfoDiv.appendChild(productPrice);
    productInfoDiv.appendChild(productNAme);

    const productInfoFigure = document.createElement('figure');
    const productImgCard = document.createElement('img');
    productImgCard.setAttribute('src', './icons/bt_add_to_cart.svg');
    productInfoFigure.appendChild(productImgCard);


    productInfo.appendChild(productInfoDiv);
    productInfo.appendChild(productInfoFigure);
    productCard.appendChild(productImg);
    productCard.appendChild(productInfo);

    cardsContainer.appendChild(productCard);

}

