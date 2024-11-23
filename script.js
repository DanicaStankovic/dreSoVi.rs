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

    // Učitaj klubove samo ako smo na stranici klubovi.html
    if (window.location.pathname.includes("klubovi.html")) {
        loadClubs();
    }

    // Učitaj dresove samo ako smo na stranici dres.html
    if (window.location.pathname.includes("dres.html")) {
        initializeDresPage();
    }

    const checkoutButton = document.querySelector(".checkout_button");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", function () {
            alert("Поруџбина је потврђена!");
            localStorage.removeItem("cart");
            cart = [];
            updateCartDisplay();
        });
    }

    updateCartCount();
});

// Funkcija za učitavanje korpe iz localStorage
function loadCart() {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCartDisplay();
    }
}

// Funkcija za učitavanje i prikazivanje klubova iz JSON-a
function loadClubs() {
    fetch("clubs.json")
        .then(response => response.json())
        .then(data => {
            generateClubCards(data);
        })
        .catch(error => console.error("Greška pri učitavanju клубова:", error));
}

// Funkcija za generisanje kartica za klubove
function generateClubCards(clubs) {
    const container = document.querySelector(".container .row");
    clubs.forEach(club => {
        const filteredImages = club.images.filter(image =>
            /1\.(jpg|png|jpeg|webp)$/i.test(image.src)
        );
        filteredImages.forEach(image => {
            let typeLabel = "";
            switch (image.type) {
                case "home":
                    typeLabel = "Домаћи";
                    break;
                case "away":
                    typeLabel = "Гостујући";
                    break;
                case "third":
                    typeLabel = "Трећи";
                    break;
                default:
                    typeLabel = "";
            }

            const cardHTML = `
                <div class="col-12 col-md-6 col-lg-4 mb-4">
                    <a href="dres.html?team=${club.team}&type=${image.type}" class="card-link">
                        <div class="card">
                            <img src="${image.src}" class="card-img-top" alt="${club.team}">
                            <div class="card-body text-center">
                                <h5 class="card-title">${club.team.replace("_", " ").toUpperCase()} - ${typeLabel} (${image.season || "Непозната сезона"})</h5>
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
    populateSizeOptions();
    populatePrintOptions();

    const printSelect = document.getElementById("pa_odabir-stampe");
    const addToCartButton = document.getElementById("addToCartButton");

    // Dodaj event listener za promenu cene pri izboru štampe
    printSelect.addEventListener("change", updatePrice);

    // Dodaj event listener za dodavanje u korpu
    addToCartButton.addEventListener("click", handleAddToCart);

    updatePrice(); // Postavi početnu cenu
}

// Funkcija za popunjavanje opcija veličine
function populateSizeOptions() {
    const sizeButtonsContainer = document.getElementById("sizeButtons");
    SIZE_OPTIONS.forEach(size => {
        const button = document.createElement("button");
        button.className = "size-button";
        button.textContent = size;
        button.addEventListener("click", () => selectSize(size));
        sizeButtonsContainer.appendChild(button);
    });
}

// Funkcija za popunjavanje opcija štampe
function populatePrintOptions() {
    const printSelect = document.getElementById("pa_odabir-stampe");
    PRINT_OPTIONS.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option.value;
        opt.textContent = option.text;
        printSelect.appendChild(opt);
    });
}

// Funkcija za ažuriranje cene
function updatePrice() {
    const printSelect = document.getElementById("pa_odabir-stampe");
    const priceElement = document.getElementById("productPrice");
    let price = BASE_PRICE;

    if (printSelect.value === "usluzna-stampa") {
        price = USLUZNA_STAMPA_PRICE;
    }

    priceElement.textContent = `Цена: ${formatPrice(price)} РСД`;
}

// Funkcija za izbor veličine
function selectSize(size) {
    const buttons = document.querySelectorAll(".size-button");
    buttons.forEach(button => button.classList.remove("selected"));
    event.target.classList.add("selected");
    document.getElementById("sizeWarning").style.display = "none";
}

// Funkcija za dodavanje u korpu
function handleAddToCart() {
    const size = document.querySelector(".size-button.selected")?.textContent || null;
    const selectedPrint = document.getElementById("pa_odabir-stampe")?.value || "";

    // Provera unosa
    if (!size) {
        document.getElementById("sizeWarning").style.display = "block";
    } else {
        document.getElementById("sizeWarning").style.display = "none";
    }

    if (!selectedPrint) {
        document.getElementById("printWarning").style.display = "block";
    } else {
        document.getElementById("printWarning").style.display = "none";
    }

    if (!size || !selectedPrint) {
        return; // Ako nije validno, prekidamo
    }

    const productName = document.getElementById("productTitle").textContent;
    const price = parseFloat(document.getElementById("productPrice").textContent.replace(/\D/g, ""));

    cart.push({ name: productName, size, price, print: selectedPrint });
    saveCart();

    const notification = document.getElementById("notification");
    notification.textContent = "Производ је успешно додат у корпу!";
    notification.style.display = "block";

    updateCartCount();

    setTimeout(() => {
        notification.style.display = "none";
    }, 3000);
}

// Funkcija za ažuriranje broja proizvoda u korpi
function updateCartCount() {
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        cartCountElement.textContent = `(${cart.length})`;
    }
}

// Funkcija za čuvanje korpe
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
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

    console.log('Učitane slike:', images);

}
