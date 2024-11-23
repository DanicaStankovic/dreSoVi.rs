// Inicijalizacija korpe
let cart = [];

// Učitavanje korpe iz localStorage
document.addEventListener('DOMContentLoaded', function () {
    loadCart();

    // Učitaj klubove samo ako smo na stranici klubovi.html
    if (window.location.pathname.includes('klubovi.html')) {
        loadClubs();
    }

    // Učitaj dresove samo ako smo na stranici dres.html
    if (window.location.pathname.includes('dres.html')) {
        loadDres();
    }

    const checkoutButton = document.querySelector('.checkout_button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function () {
            alert('Поруџбина је потврђена!');
            localStorage.removeItem('cart');
            cart = [];
            updateCartDisplay();
        });
    }

    updateCartCount();
});

// Funkcija za učitavanje korpe iz localStorage
function loadCart() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCartDisplay();
    }
}

// Funkcija za učitavanje i prikazivanje klubova iz JSON-a
function loadClubs() {
    fetch('clubs.json')
        .then(response => response.json())
        .then(data => {
            generateClubCards(data);
        })
        .catch(error => console.error('Greška pri učitavanju klubова:', error));
}

// Funkcija za generisanje kartica za klubove
function generateClubCards(clubs) {
    const container = document.querySelector('.container .row');
    clubs.forEach(club => {
        const filteredImages = club.images.filter(image => /1\.(jpg|png|jpeg|webp)$/i.test(image.src));
        filteredImages.forEach(image => {
            let typeLabel = '';
            switch (image.type) {
                case 'home':
                    typeLabel = 'Домаћи';
                    break;
                case 'away':
                    typeLabel = 'Гостујући';
                    break;
                case 'third':
                    typeLabel = 'Трећи';
                    break;
                default:
                    typeLabel = '';
            }

            const cardHTML = `
                <div class="col-12 col-md-6 col-lg-4 mb-4">
                    <a href="dres.html?team=${club.team}&type=${image.type}" class="card-link">
                        <div class="card">
                            <img src="${image.src}" class="card-img-top" alt="${club.team}">
                            <div class="card-body text-center">
                                <h5 class="card-title">${club.team.replace('_', ' ').toUpperCase()} - ${typeLabel} (${image.season || 'Непозната сезона'})</h5>
                            </div>
                        </div>
                    </a>
                </div>
            `;
            container.innerHTML += cardHTML;
        });
    });
}

// Funkcija za učitavanje dresova iz JSON-a na osnovu izabranog tima
function loadDres() {
    const urlParams = new URLSearchParams(window.location.search);
    const team = urlParams.get('team');
    const type = urlParams.get('type');

    fetch('clubs.json')
        .then(response => response.json())
        .then(data => {
            const club = data.find(c => c.team === team);
            if (club) {
                const images = club.images.filter(img => img.type === type);
                if (images.length > 0) {
                    const mainImageElement = document.getElementById('mainImage');
                    const thumbnailsContainer = document.getElementById('thumbnails');

                    if (mainImageElement && thumbnailsContainer) {
                        mainImageElement.src = images[0].src;
                        thumbnailsContainer.innerHTML = '';

                        images.forEach(image => {
                            const thumbnail = document.createElement('img');
                            thumbnail.src = image.src;
                            thumbnail.alt = `${club.team} dres`;
                            thumbnail.className = 'thumbnail-img m-1';
                            thumbnail.style.cursor = 'pointer';
                            thumbnail.onclick = () => {
                                mainImageElement.src = image.src;
                            };
                            thumbnailsContainer.appendChild(thumbnail);
                        });

                        const productTitle = document.getElementById('productTitle');
                        if (productTitle) {
                            const season = images[0].season || 'Непозната сезона';
                            productTitle.textContent = `${club.team.replace('_', ' ').toUpperCase()} - ${type === 'home' ? 'Домаћи' : type === 'away' ? 'Гостујући' : 'Трећи'} (${season})`;
                        }
                    } else {
                        console.error('Elementi mainImage ili thumbnails nisu pronađeni.');
                    }
                }
            }
        })
        .catch(error => console.error('Greška pri učitavanju dresова:', error));
}

// Funkcija za izbor veličine
function selectSize(size) {
    const buttons = document.querySelectorAll('.size-button');
    buttons.forEach(button => {
        button.classList.remove('selected');
    });
    event.target.classList.add('selected');
    document.getElementById('sizeWarning').style.display = 'none';
}

// Funkcija za formatiranje cena
function formatPrice(price) {
    return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&.').replace('.', ',');
}

// Funkcija za dodavanje u korpu
function handleAddToCart() {
    const size = document.querySelector('.size-button.selected')?.textContent || null;
    const selectedPrint = document.getElementById('pa_odabir-stampe')?.value || '';

    // Proveri da li je veličina izabrana
    if (!size) {
        document.getElementById('sizeWarning').style.display = 'block';
    } else {
        document.getElementById('sizeWarning').style.display = 'none';
    }

    // Proveri da li je štampa izabrana
    if (!selectedPrint) {
        document.getElementById('printWarning').style.display = 'block';
    } else {
        document.getElementById('printWarning').style.display = 'none';
    }

    if (!size || !selectedPrint) {
        return; // Prekini ako nešto nije izabrano
    }

    const productName = document.getElementById('productTitle').textContent;
    const price = parseFloat(document.getElementById('productPrice').textContent.replace(/\D/g, ''));

    cart.push({ name: productName, size, price, print: selectedPrint });
    saveCart();

    const notification = document.getElementById('notification');
    notification.textContent = "Производ је успешно додат у корпу!";
    notification.style.display = 'block';

    updateCartCount();

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Funkcija za ažuriranje broja proizvoda u korpi
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = `(${cart.length})`;
    }
}

// Funkcija za čuvanje korpe
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Funkcija za uklanjanje proizvoda iz korpe
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartDisplay();
}

// Funkcija za prikaz korpe
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `
            <h4>${item.name} - Величина: ${item.size}</h4>
            <p>Цена: ${formatPrice(item.price)} РСД</p>
            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Уклони</button>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    const totalPriceElement = document.getElementById('totalPrice');
    if (totalPriceElement) {
        totalPriceElement.textContent = `Укупно: ${formatPrice(total)} РСД`;
    }

    updateCartCount();
}

// Automatsko učitavanje korpe
window.onload = loadCart;
