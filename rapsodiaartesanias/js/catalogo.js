
/////Ponemos aqui lo del catalogo porque me esta doliendo un ov.... y la mitad del otro, no funcion al huevada cuando todo estaba ok
const cardsContainer = document.querySelector('.cards-container');

//////Array + objeto para construir el producto
const productList = [];
productList.push(
    {
        name: 'Adorno',
        price: 1500,
        image: 'img/adornos.jpg',
        stock: 3,
        detalle: 'Adorno de madera elaborado con materiales reciclados '
    }
);
productList.push(
    {
        name: 'Billetera Mujer',
        price: 2500,
        image: 'img/billetera_h.jpg',
        stock: 5,
        detalle:'Billetara de cuero para mujer con cierre y compartimentos para tarjetas'
    }
);
productList.push(
    {
        name: 'Billetera Personalizada',
        price: 3000,
        image: 'img/billetera_personalizada.jpg',
        stock: 4,
        detalle:'Billeta de cuero con grabado personalizado y compartimentos para tarjetas'
    }
);
productList.push(
    {
        name: 'Bolso p/Asado',
        price: 25000,
        image: 'img/bolso_asado1.jpg',
        stock: 1,
        detalle:'Bolso de cuero para transportar utensillos de asado, con compartimentos'
    });

    productList.push(
        {
            name: 'Libreta',
            price: 1500,
            image: 'img/libreta1.jpg',
            stock: 3,
            detalle:'Libreta de cuero con diseño personalizado y pintado a mano'
        }
    );
    productList.push(
        {
            name: 'Brazalete',
            price: 4000,
            image: 'img/brazalete_comun.jpg',
            stock: 5,
            detalle:'Brazalete de cuero con diseño'
        }
    );
    productList.push(
        {
            name: 'Brazalete Engarzado',
            price: 4500,
            image: 'img/brazalete_engarzada1.jpg',
            stock: 4,
            detalle:'Brazalate de cuero con engarzado de piedras'	
        }
    );
    productList.push(
        {
            name: 'Cartera Cuero',
            price: 45000,
            image: 'img/cartera_cuero1.jpg',
            stock: 0,
            detalle:'Cartera de cuero con diseño personalizado y cinta adaptable al hombro'
        }
    );
    productList.push(
        {
            name: 'Cartera ',
            price: 37000,
            image: 'img/cartera_cuero2.jpg',
            stock: 1,
            detalle:'Cartera de cuero con diseño personalizado y cinta adaptable al hombro'
        });
    
        productList.push(
            {
                name: 'Cartera Tejida',
                price: 35000,
                image: 'img/cartera1.jpg',
                stock: 3,
                detalle:'Cartera de cuero y tejiada a mano con diseño personalizado'
            }
        );
        productList.push(
            {
                name: 'Macetas',
                price: 3000,
                image: 'img/macetas2.jpg',
                stock: 5,
                detalle:'Macetas recicladas con papel. Dibujos y colores realizados a mano'
            }
        );
        productList.push(
            {
                name: 'Maceta Colgantes',
                price: 3500,
                image: 'img/macetas_colgantes.jpg',
                stock: 0,
                detalle:'Macetas recicladas con latas de cerveza. Dibujos y colores realizados a mano'
            }
        );
        productList.push(
            {
                name: 'Porta Tabla Asado',
                price: 37500,
                image: 'img/portatabla_asado1.jpg',
                stock: 8,
                detalle:'Porta Tabla de asado de cuero con diseño'
            }
        );
        productList.push(
            {
                name: 'Reloj Madera',
                price: 50000,
                image: 'img/reloj_madera_personalizado.jpg',
                stock: 0,
                detalle:'Reloj de madera reciclada con diseño personalizado'
            }
        );


///Construccion de un Elemento DIV para crear una CARDPRODUCTO

for (product of productList) {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    const productImg = document.createElement('img');
    //product={name, price, image}->product.image
    productImg.setAttribute('src', product.image);
   // productImg.addEventListener('click', () => openProductDetailAside(product.name));
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
    productImgCard.setAttribute('src', 'img/icons/add-to-cart.png');


    if (product.stock === 0) {
        productStock.style.color = 'white';
        productStock.style.backgroundColor = 'red';
        productStock.innerText = 'Sin Stock';
        productImgCard.style.display = 'none'; // Oculta el botón cuando no hay stock
    }


    // Usamos una función de fábrica para capturar el producto actual en el bucle
    (function(product) {
        productImgCard.addEventListener('click', () => {
            addToCart(product.name, product.price, product.image);
        });
        productImg.addEventListener('click', () => openProductDetailAside(product.name));

    })(product);



    productInfoFigure.appendChild(productImgCard);
    productInfo.appendChild(productInfoDiv);
    productInfo.appendChild(productInfoFigure);
    productCard.appendChild(productImg);
    productCard.appendChild(productInfo);
    cardsContainer.appendChild(productCard);

}

//Funcion para generar el detalle del producto, debemos crear un aside con la informacion del producto, por suerte ya tenemos en nuestra variable todos los datos necesarios
function openProductDetailAside(productName) {

    const product = productList.find(p => p.name === productName);
    if (!product) {
        console.error('Producto no encontrado:', productName);
        return;
    }
    console.log('Producto encontrado:', product);  // Agregar este log para verificar el producto encontrado
    //creamos lo que ira dentro del aside que tenemos declarado en el html
    const divClose=document.createElement('div');
    //agregamos la imagen de nuestro icono cerrar
    const imgIconClose=document.createElement('img');
    imgIconClose.setAttribute('src','img/icons/close.png');
    //agregamos la clase close al div
    divClose.classList.add('product-detailInfo-close');
    //agregamos un evento de clic al div
    divClose.appendChild(imgIconClose);
    divClose.addEventListener('click',productDetailAsideClose);


    //creamos un div para la imagen del producto
    const imgproduct=document.createElement('img');
    //agregamos la imagen del producto
    imgproduct.setAttribute('src',product.image);

    //Agregamos el div que contiene el precio, nombre,, detalle y el boton para agregar al carrito
    const divInfo=document.createElement('div');
    //creamos el parrafo del precio
    const pPrice=document.createElement('p');
    //agregamos el precio al parrafo
    pPrice.innerText='$'+product.price;
    //creamos el parrafo del nombre
    const pName=document.createElement('p');
    //agregamos el nombre al parrafo
    pName.innerText=product.name;
    //creamos el parrafo del detalle
    const pDetalle=document.createElement('p');
    //agregamos el detalle al parrafo
    pDetalle.innerText=product.detalle;
    //creamos el boton para agregar al carrito
    const btnAdd=document.createElement('button');
    //agregamos la clase al boton
    btnAdd.classList.add('btncarrito');
    btnAdd.classList.add('add-to-cart-button');
    //agregamos el texto al boton
    btnAdd.innerText='Agregar al carrito';
    //agregamos un evento de clic al boton
    btnAdd.addEventListener('click',()=>addToCart(product.name,product.price,product.image));
    //Nos falta agregar la clase al div
    divInfo.classList.add('product-infoDetail');
    //agregamos los elementos al div
    divInfo.appendChild(pPrice);
    divInfo.appendChild(pName);
    divInfo.appendChild(pDetalle);
    divInfo.appendChild(btnAdd);

    //agregamos los elementos al aside
    const aside=document.querySelector('#aside');
    aside.innerHTML = ''; 
    aside.appendChild(divClose);
    aside.appendChild(imgproduct);
    aside.appendChild(divInfo);
    aside.style.display='block';


    asideCarrito.classList.add('inactive')
    menuDesplegable.classList.toggle('inactive');
    menuCuenta.classList.add('inactive');


} 
function productDetailAsideClose() {
    const aside = document.querySelector('#aside');
    if (aside) {
        aside.style.display = 'none';
    }
}
