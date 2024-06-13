const cardsContainer = document.querySelector('.cards-container');


//////Array + objeto para construir el producto
const productList = [];
productList.push(
    {
        name: 'Adorno',
        price: 1500,
        image: 'img/adornos.jpg',
        stock: 3
    }
);
productList.push(
    {
        name: 'Billetera Mujer',
        price: 2500,
        image: 'img/billetera_h.jpg',
        stock: 5
    }
);
productList.push(
    {
        name: 'Billetera Personalizada',
        price: 3000,
        image: 'img/billetera_personalizada.jpg',
        stock: 4
    }
);
productList.push(
    {
        name: 'Bolso p/Asado',
        price: 25000,
        image: 'img/bolso_asado1.jpg',
        stock: 0
    });

    productList.push(
        {
            name: 'Libreta',
            price: 1500,
            image: 'img/libreta1.jpg',
            stock: 3
        }
    );
    productList.push(
        {
            name: 'Brazalete',
            price: 4000,
            image: 'img/brazalete_comun.jpg',
            stock: 5
        }
    );
    productList.push(
        {
            name: 'Brazalete Engarzado',
            price: 4500,
            image: 'img/brazalete_engarzada1.jpg',
            stock: 4
        }
    );
    productList.push(
        {
            name: 'Cartera Cuero',
            price: 45000,
            image: 'img/cartera_cuero1.jpg',
            stock: 0
        }
    );
    productList.push(
        {
            name: 'Cartera ',
            price: 37000,
            image: 'img/cartera_cuero2.jpg',
            stock: 1
        });
    
        productList.push(
            {
                name: 'Cartera Tejida',
                price: 35000,
                image: 'img/cartera1.jpg',
                stock: 3
            }
        );
        productList.push(
            {
                name: 'Macetas',
                price: 3000,
                image: 'img/macetas2.jpg',
                stock: 5
            }
        );
        productList.push(
            {
                name: 'Maceta Colgantes',
                price: 3500,
                image: 'img/macetas_colgantes.jpg',
                stock: 0
            }
        );
        productList.push(
            {
                name: 'Porta Tabla Asado',
                price: 37500,
                image: 'img/portatabla_asado1.jpg',
                stock: 8
            }
        );
        productList.push(
            {
                name: 'Reloj Madera',
                price: 50000,
                image: 'img/reloj_madera_personalizado.jpg',
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
    //productImg.addEventListener('click', openProductDetailAside);

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
        });
    })(product);

    productInfoFigure.appendChild(productImgCard);
    productInfo.appendChild(productInfoDiv);
    productInfo.appendChild(productInfoFigure);
    productCard.appendChild(productImg);
    productCard.appendChild(productInfo);
    cardsContainer.appendChild(productCard);

}