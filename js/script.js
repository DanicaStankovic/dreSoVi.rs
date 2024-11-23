// Inicijalizacija korpe
let cart = [];

// Konstantne vrednosti za cene
const BASE_PRICE = 9990;
const USLUZNA_STAMPA_PRICE = 11490;

// Dostupne veličine i opcije štampe
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
const PRINT_OPTIONS = [
    { value: "", text: "Одаберите опцију" },
    { value: "bez-broja", text: "Без броја" },
    { value: "usluzna-stampa", text: "Услужна штампа" },
];

// Učitavanje korpe iz localStorage
document.addEventListener("DOMContentLoaded", function () {
    loadCart();

    // Učitaj stranice na osnovu URL-a
    const path = window.location.pathname;

    if (path.includes("klubovi.html")) {
        loadClubs();
    } else if (path.includes("dres.html")) {
        initializeDresPage();
    } else if (path.includes("korpa.html")) {
        updateCartDisplay();
    }

    const checkoutButton = document.querySelector(".checkout_button");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", checkoutHandler);
    }

    updateCartCount();
});

// Funkcija za učitavanje korpe iz localStorage
function loadCart() {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}

// Funkcija za učitavanje i prikazivanje klubova iz JSON-a
function loadClubs() {
    fetch("data/klubovi.json")
        .then((response) => response.json())
        .then((data) => {
            generateClubCards(data);
        })
        .catch((error) => console.error("Greška pri učitavanju клубова:", error));
}

// Funkcija za generisanje kartica za klubove
function generateClubCards(clubs) {
    const container = document.querySelector(".container .row");
    if (!container) {
        console.error("Container za klubove nije pronađen.");
        return;
    }

    const sortedClubs = clubs.sort((a, b) => {
        const seasonA = a.images[0]?.season || "";
        const seasonB = b.images[0]?.season || "";
        return seasonB.localeCompare(seasonA); // Sortiranje po sezoni od najnovije ka starijim
    });

    sortedClubs.forEach((club) => {
        const filteredImages = club.images.filter((image) =>
            image.src.match(/1\.(jpg|png|jpeg|webp)$/i)
        );

        filteredImages.forEach((image) => {
            const cardHTML = `
                <div class="col-12 col-md-6 col-lg-4 mb-4">
                    <a href="dres.html?team=${club.team}&season=${image.season}" class="card-link">
                        <div class="card">
                            <img src="${image.src}" class="card-img-top" alt="${club.team}">
                            <div class="card-body text-center">
                                <h5 class="card-title">${formatTeamName(club.team)} - ${image.season}</h5>
                            </div>
                        </div>
                    </a>
                </div>
            `;
            container.innerHTML += cardHTML;
        });
    });
}

// Funkcija za učitavanje stranice dresa
function initializeDresPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const team = urlParams.get("team");
    const season = urlParams.get("season");

    fetch("data/klubovi.json")
        .then((response) => response.json())
        .then((data) => {
            const club = data.find((c) => c.team === team);

            if (club) {
                const images = club.images.filter((img) => img.season === season);

                if (images.length > 0) {
                    const mainImage = document.getElementById("mainImage");
                    const thumbnailsContainer = document.getElementById("thumbnails");

                    if (mainImage) {
                        mainImage.src = images[0].src || "images/klubovi/default.png";
                        mainImage.alt = `${team} ${season} dres`;
                    }

                    if (thumbnailsContainer) {
                        thumbnailsContainer.innerHTML = "";
                        images.forEach((image) => {
                            const thumbnail = document.createElement("img");
                            thumbnail.src = image.src || "images/klubovi/default.png";
                            thumbnail.alt = `${team} ${season} dres`;
                            thumbnail.className = "thumbnail-img m-1";
                            thumbnail.style.cursor = "pointer";
                            thumbnail.addEventListener("click", () => {
                                if (mainImage) {
                                    mainImage.src = image.src || "images/klubovi/default.png";
                                }
                            });
                            thumbnailsContainer.appendChild(thumbnail);
                        });
                    }

                    const productTitle = document.getElementById("productTitle");
                    if (productTitle) {
                        productTitle.textContent = `${formatTeamName(team)} (${season})`;
                    }
                }
            }
        })
        .catch((error) => console.error("Greška pri učitavanju podataka о дресу:", error));
}

// Funkcija za formatiranje imena tima
function formatTeamName(teamName) {
    return teamName.replace("_", " ").toUpperCase();
}

// Funkcija za prikaz korpe
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById("cartItems");
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        const itemDiv = document.createElement("div");
        itemDiv.innerHTML = `
            <h4>${item.name} - Величина: ${item.size}</h4>
            <p>Цена: ${formatPrice(item.price)} РСД</p>
            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Уклони</button>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    const totalPriceElement = document.getElementById("totalPrice");
    if (totalPriceElement) {
        totalPriceElement.textContent = `Укупно: ${formatPrice(total)} РСД`;
    }

    updateCartCount();
}

// Funkcija za čuvanje korpe
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Funkcija za formatiranje cena
function formatPrice(price) {
    return price.toLocaleString("sr-RS", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Funkcija za parsiranje cena iz stringa
function parsePrice(priceString) {
    return parseFloat(priceString.replace(/\./g, "").replace(",", "."));
}
