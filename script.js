// Inicijalizacija korpe
let cart = [];

// Učitavanje korpe iz localStorage
document.addEventListener('DOMContentLoaded', function () {
    loadCart(); // Učitaj korpu kada se stranica učita

    // Učitaj klubove samo ako smo na stranici klubovi.html
    if (window.location.pathname.includes('klubovi.html')) {
        loadClubs(); // Učitaj klubove iz JSON datoteke
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
                    <a href="dres.html?team=${club.team}" class="card-link">
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
            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Уклон
