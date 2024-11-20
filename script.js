// Inicijalizacija korpe
let cart = [];

// Učitavanje korpe iz localStorage
document.addEventListener('DOMContentLoaded', function () {
    loadCart(); // Učitaj korpu kada se stranica učita

    // Učitaj klubove samo ako smo na stranici klubovi.html
    if (window.location.pathname.includes('klubovi.html')) {
        loadClubs(); // Učitaj klubove iz JSON datoteke
    }

    // Učitaj dresove samo ako smo na stranici dres.html
    if (window.location.pathname.includes('dres.html')) {
        loadDres(); // Učitaj dresove za izabrani tim
    }

    // Dodavanje event listener-a na checkout dugme u cart.html
    const checkoutButton = document.querySelector('.checkout_button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function () {
            alert('Поруџбина је потврђена!'); // Obaveštenje o potvrdi
            localStorage.removeItem('cart'); // Čišćenje korpe
            cart = [];
            updateCartDisplay();
        });
    }
});

// Funkcija za učitavanje korpe iz localStorage
function loadCart() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart); // Pretvori string u objekat
        updateCartDisplay(); // Ažuriraj prikaz korpe
    }
}

// Funkcija za učitavanje i prikazivanje klubova iz JSON-a
function loadClubs() {
    fetch('clubs.json') // Putanja do JSON datoteke
        .then(response => response.json())
        .then(data => {
            generateClubCards(data); // Generiši kartice za klubove
        })
        .catch(error => console.error('Greška pri učitavanju klubova:', error));
}

// Funkcija za generisanje kartica za klubove
function generateClubCards(clubs) {
    const container = document.querySelector('.container .row'); // Selektujte container sa klasom row
    clubs.forEach(club => {
        // Filtriraj slike koje završavaju sa '1' i podržava različite ekstenzije
        const filteredImages = club.images.filter(image => /1\.(jpg|png|jpeg|webp)$/i.test(image.src));
        filteredImages.forEach(image => {
            // Određivanje srpskog naziva za tip dresa
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

            // Kreirajte HTML za svaku karticu
            const cardHTML = `
                <div class="col-12 col-md-6 col-lg-4 mb-4">
                    <a href="dres.html?team=${club.team}&type=${image.type}" class="card-link">
                        <div class="card">
                            <img src="${image.src}" class="card-img-top" alt="${club.team}">
                            <div class="card-body text-center">
                                <h5 class="card-title">${club.team.replace('_', ' ').toUpperCase()} - ${typeLabel}</h5>
                            </div>
                        </div>
                    </a>
                </div>
            `;
            // Dodajte generisanu karticu u container
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

                    // Proverite da li elementi postoje
                    if (mainImageElement && thumbnailsContainer) {
                        mainImageElement.src = images[0].src;
                        thumbnailsContainer.innerHTML = ''; // Očisti prethodne slike

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
                            productTitle.textContent = `${club.team.replace('_', ' ').toUpperCase()} - ${type === 'home' ? 'Домаћи' : type === 'away' ? 'Гостујући' : 'Трећи'}`;
                        }
                    } else {
                        console.error('Elementi mainImage ili thumbnails nisu pronađeni.');
                    }
                }
            }
        })
        .catch(error => console.error('Greška pri učitavanju dresova:', error));
}

// Ažuriranje prikaza korpe
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems'); // Pronađi kontejner za stavke
    if (!cartItemsContainer) return; // Ako kontejner ne postoji, prekini
    cartItemsContainer.innerHTML = ''; // Očisti postojeće stavke
    let total = 0; // Ukupna cena

    // Prikaz stavki u korpi
    cart.forEach((item, index) => {
        total += item.price; // Dodaj cenu stavke
        const itemDiv = document.createElement('div'); // Kreiraj novi div
        itemDiv.innerHTML = `
            <h4>${item.name} - Величина: ${item.size}</h4>
            <p>Цена: ${item.price} РСД</p>
            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Уклони</button>
        `;
        cartItemsContainer.appendChild(itemDiv); // Dodaj div u kontejner
    });

    const totalPriceElement = document.getElementById('totalPrice'); // Pronađi element za ukupnu cenu
    if (totalPriceElement) {
        totalPriceElement.textContent = `Укупно: ${total} РСД`; // Prikaz ukupne cene
    }

    // Ažuriranje broja stavki u korpi
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = `(${cart.length})`;
    }
}

// Uklanjanje stavke iz korpe
function removeFromCart(index) {
    cart.splice(index, 1); // Ukloni stavku iz korpe
    updateCartDisplay(); // Ažuriraj prikaz korpe
    saveCart(); // Sačuvaj promene
}

// Funkcija za dodavanje proizvoda u korpu
function addToCart(productName, price, size, isZvezda = false, player = '') {
    const selectedPrint = document.getElementById("pa_odabir-stampe")?.value || '';
    if (!size || selectedPrint === '') {
        document.getElementById("sizeWarning").textContent = "Молимо изаберите величину и штампу."; // Upozorenje
        document.getElementById("sizeWarning").style.display = "block"; // Prikazivanje upozorenja
        return; // Prekini izvršavanje
    }

    if (isZvezda && !player) {
        document.getElementById("sizeWarning").textContent = "Молимо изаберите играча за дрес Црвене Звезде.";
        document.getElementById("sizeWarning").style.display = "block";
        return;
    }

    cart.push({ name: productName, price: price, size: size, player: player }); // Dodaj stavku u korpu
    saveCart(); // Sačuvaj promene

    // Prikaz obaveštenja
    const notification = document.getElementById('notification');
    notification.textContent = "Производ је успешно додат у корпу.";
    notification.classList.add('visible'); // Prikaz obaveštenja
    setTimeout(() => {
        notification.classList.remove('visible'); // Sakrij obaveštenje posle 3 sekunde
    }, 3000);
}

// Čuvanje korpe u localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart)); // Sačuvaj korpu kao string
}

// Učitaj korpu kada se stranica učita
window.onload = loadCart; // Pozovi loadCart funkciju
