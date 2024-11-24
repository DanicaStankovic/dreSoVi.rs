// Иницијација корпе
let cart = [];

// Константне вредности за цене
const BASE_PRICE = 9990;
const USLUZNA_STAMPA_PRICE = 11490;

// Доступне величине и опције штампе
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
const PRINT_OPTIONS = [
    { value: "", text: "Одаберите опцију" },
    { value: "bez-broja", text: "Без броја" },
    { value: "usluzna-stampa", text: "Услужна штампа" },
];

// Учитавање корпе из localStorage
document.addEventListener("DOMContentLoaded", function () {
    loadCart();

    // Учитај странице на основу URL-а
    const path = window.location.pathname;

    if (path.includes("klubovi.html")) {
        loadTeamData("data/klubovi.json", "club-container");
    } else if (path.includes("dres.html")) {
        initializeDresPage();
    } else if (path.includes("korpa.html")) {
        updateCartDisplay();
    } else if (path.includes("crvena-zvezda.html")) {
        loadTeamData("data/zvezda.json", "zvezda-container");
    } else if (path.includes("retro-dresovi.html")) {
        loadTeamData("data/retro.json", "retro-container");
    }

    const checkoutButton = document.querySelector(".checkout_button");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", checkoutHandler);
    }

    updateCartCount(); // Ажурирај број производа у корпи приликом иницијализације
});

// Универзална функција за учитавање дресова из JSON-а и приказивање
function loadTeamData(jsonPath, containerId) {
    fetch(jsonPath)
        .then(response => response.json())
        .then(data => {
            generateDresoviBySeason(data, containerId);
        })
        .catch(error => console.error(`Грешка приликом учитавања дресова из ${jsonPath}:`, error));
}

// Функција за груписање и приказивање дресова по сезонама
function generateDresoviBySeason(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Контенер за дресове није пронађен.");
        return;
    }

    container.innerHTML = ""; // Очисти претходни садржај

    // Груписање дресова по сезони и филтрирање само слика које завршавају са "1"
    const seasonGroups = {};
    for (const season in data.seasons) {
        if (data.seasons.hasOwnProperty(season)) {
            const seasonDresovi = data.seasons[season];
            if (!seasonGroups[season]) {
                seasonGroups[season] = [];
            }
            seasonDresovi.forEach(item => {
                // Филтрирање само слика које завршавају са "1"
                const filteredImages = item.images.filter(image => image.match(/1\.(jpg|png|jpeg|webp)$/i));
                if (filteredImages.length > 0) {
                    seasonGroups[season].push({ ...item, images: filteredImages });
                }
            });
        }
    }

    // Сортирање сезона од најновије ка старијој, са "retro" на крају
    const sortedSeasons = Object.keys(seasonGroups).sort((a, b) => {
        if (a === "retro") return 1;
        if (b === "retro") return -1;
        return b.localeCompare(a);
    });

    // Генерисање HTML-а за сваку сезону и дресове унутар те сезоне
    sortedSeasons.forEach(season => {
        const seasonTitleHTML = `
            <div class="col-12">
                <h2 class="text-center mt-5 mb-3">Сезона ${season}</h2>
            </div>
        `;
        container.innerHTML += seasonTitleHTML;

        seasonGroups[season].forEach(item => {
            item.images.forEach(image => {
                const cardHTML = `
                    <div class="col-12 col-md-6 col-lg-4 mb-4">
                        <a href="dres.html?team=${data.team || item.team}&type=${item.type}&season=${season}" class="card-link">
                            <div class="card">
                                <img src="${image}" class="card-img-top" alt="${data.team || item.team} - ${item.type}">
                                <div class="card-body text-center">
                                    <h5 class="card-title">${formatTeamName(data.team || item.team)} - ${getTypeLabel(item.type)} (${season})</h5>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
                container.innerHTML += cardHTML;
            });
        });
    });
}

// Функција за учитавање корпе из localStorage
function loadCart() {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
        try {
            cart = JSON.parse(storedCart);
            cart.forEach(item => {
                // Осигурај да је цена број и да није NaN
                if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
                    console.error("Неисправан артикал у корпи:", item);
                    item.price = BASE_PRICE; // Постави подразумевану цену ако није исправна
                }
            });
        } catch (error) {
            console.error("Грешка при парсирању корпе из localStorage:", error);
            cart = [];
        }
    }
}

// Функција за учитавање странице дреса
function initializeDresPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const team = urlParams.get("team");
    const type = urlParams.get("type");
    const season = urlParams.get("season");

    let jsonPath = "data/klubovi.json";
    if (team === "crvena_zvezda") {
        jsonPath = "data/zvezda.json";
    } else if (team === "retro") {
        jsonPath = "data/retro.json";
    }

    fetch(jsonPath) // Учитај JSON из исправне путање
        .then(response => response.json())
        .then(data => {
            const club = data.find(c => c.team === team);

            if (club) {
                const images = club.images.filter(img => img.type === type && img.season === season);

                if (images.length > 0) {
                    const mainImage = document.getElementById("mainImage");
                    const thumbnailsContainer = document.getElementById("thumbnails");

                    if (mainImage) {
                        mainImage.src = images[0].src || "images/default.png";
                        mainImage.alt = `${team} ${type} дрес`;
                    }

                    if (thumbnailsContainer) {
                        thumbnailsContainer.innerHTML = "";
                        images.forEach(image => {
                            const thumbnail = document.createElement("img");
                            thumbnail.src = image.src || "images/default.png";
                            thumbnail.alt = `${team} ${type} дрес`;
                            thumbnail.className = "thumbnail-img m-1";
                            thumbnail.style.cursor = "pointer";
                            thumbnail.addEventListener("click", () => {
                                if (mainImage) {
                                    mainImage.src = image.src || "images/default.png";
                                }
                            });
                            thumbnailsContainer.appendChild(thumbnail);
                        });
                    }

                    const productTitle = document.getElementById("productTitle");
                    if (productTitle) {
                        productTitle.textContent = `${formatTeamName(team)} - ${getTypeLabel(type)} (${images[0].season || "Непозната сезона"})`;
                    }
                }
            }
        })
        .catch(error => console.error("Грешка приликом учитавања података о дресу:", error));

    populateSizeOptions();
    populatePrintOptions();

    const printSelect = document.getElementById("pa_odabir-stampe");
    const addToCartButton = document.getElementById("addToCartButton");

    if (printSelect) {
        printSelect.addEventListener("change", updatePrice);
    }

    if (addToCartButton) {
        addToCartButton.addEventListener("click", handleAddToCart);
    }

    updatePrice(); // Постави почетну цену
}

// Функција за попуњавање опција величине
function populateSizeOptions() {
    const sizeButtonsContainer = document.getElementById("sizeButtons");
    if (!sizeButtonsContainer) {
        console.error("Контенер за величине није пронађен.");
        return;
    }

    SIZE_OPTIONS.forEach(size => {
        const button = document.createElement("button");
        button.className = "size-button";
        button.textContent = size;
        button.addEventListener("click", (event) => selectSize(size, event));
        sizeButtonsContainer.appendChild(button);
    });
}

// Функција за попуњавање опција штампе
function populatePrintOptions() {
    const printSelect = document.getElementById("pa_odabir-stampe");
    if (!printSelect) {
        console.error("Селект за штампу није пронађен.");
        return;
    }

    PRINT_OPTIONS.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option.value;
        opt.textContent = option.text;
        printSelect.appendChild(opt);
    });

    // Додај слушаоца догађаја за сакривање поруке при избору опције
    printSelect.addEventListener("change", () => {
        const printWarning = document.getElementById("printWarning");
        if (printWarning && printSelect.value !== "") {
            printWarning.style.display = "none";
        }
    });
}

// Функција за ажурирање цене
function updatePrice() {
    const printSelect = document.getElementById("pa_odabir-stampe");
    const priceElement = document.getElementById("productPrice");
    let price = BASE_PRICE;

    if (printSelect && printSelect.value === "usluzna-stampa") {
        price = USLUZNA_STAMPA_PRICE;
    }

    if (priceElement) {
        priceElement.textContent = `Цена: ${formatPrice(price)} РСД`;
    }
}

// Функција за избор величине
function selectSize(size, event) {
    const buttons = document.querySelectorAll(".size-button");
    buttons.forEach(button => button.classList.remove("selected"));
    event.target.classList.add("selected");
    const sizeWarning = document.getElementById("sizeWarning");
    if (sizeWarning) {
        sizeWarning.style.display = "none";
    }
}

// Funkcija za uklanjanje proizvoda iz korpe
function removeFromCart(index) {
    cart.splice(index, 1); // Uklanja proizvod iz korpe na osnovu indeksa
    saveCart(); // Čuva ažuriranu korpu u localStorage
    updateCartDisplay(); // Ažurira prikaz korpe
}

// Funkcija za dodavanje u корпу
function handleAddToCart() {
    const size = document.querySelector(".size-button.selected")?.textContent || null;
    const selectedPrint = document.getElementById("pa_odabir-stampe")?.value || "";

    if (!validateInputs(size, selectedPrint)) {
        return;
    }

    const productName = document.getElementById("productTitle").textContent;
    let price = parsePrice(document.getElementById("productPrice").textContent);

    // Proverite da li je cena validna
    if (typeof price !== 'number' || isNaN(price) || price <= 0) {
        console.error("Неисправна цена за артикал, постављам подразумевану цену.");
        price = BASE_PRICE;
    }

    cart.push({ name: productName, size, price, print: selectedPrint });
    saveCart();

    displayNotification("Производ је успешно додат у корпу!");
    updateCartCount();
}

// Funkcija za validaciju unosa
function validateInputs(size, selectedPrint) {
    const sizeWarning = document.getElementById("sizeWarning");
    const printWarning = document.getElementById("printWarning");

    if (!size) {
        sizeWarning.style.display = "block";
    } else {
        sizeWarning.style.display = "none";
    }

    if (!selectedPrint) {
        printWarning.style.display = "block";
    } else {
        printWarning.style.display = "none";
    }

    return size && selectedPrint;
}

// Funkcija za prikaz notifikacije
function displayNotification(message) {
    const notification = document.getElementById("notification");
    if (notification) {
        notification.textContent = message;
        notification.style.display = "block";

        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    }
}

// Funkcija za ažuriranje broja proizvoda u корпи
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

// Funkcija za formatiranje cena
function formatPrice(price) {
    return price.toLocaleString("sr-RS", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Funkcija za parsiranje cena iz stringa
function parsePrice(priceString) {
    return parseFloat(priceString.replace(/\./g, "").replace(",", "."));
}

// Funkcija za formatiranje imena tima
function formatTeamName(teamName) {
    return teamName.replace("_", " ").toUpperCase();
}

// Funkcija za dobijanje etikete za tip dresa
function getTypeLabel(type) {
    switch (type) {
        case "home":
            return "Домаћи";
        case "away":
            return "Гостујући";
        case "third":
            return "Трећи";
        default:
            return ""; // Vraća prazan string za nepoznat tip
    }
}

// Funkcija za završetak narudžbine
function checkoutHandler() {
    alert("Поруџбина је потврђена!");
    localStorage.removeItem("cart");
    cart = [];
    updateCartDisplay();
}

// Funkcija za prikaz korpe
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById("cartItems");
    if (!cartItemsContainer) {
        console.error("Контенер за ставке корпе није пронађен.");
        return;
    }

    cartItemsContainer.innerHTML = ""; // Очисти претходне ставке
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p class='text-center'>Ваша корпа је празна.</p>";
        document.getElementById("totalPrice").textContent = "Укупно: 0 РСД";
        return;
    }

    cart.forEach((item, index) => {
        if (!item.price || isNaN(item.price)) {
            console.error(`Производ у корпи има неважећу цену:`, item);
            item.price = BASE_PRICE;
        }

        total += item.price;
        const itemDiv = document.createElement("div");
        itemDiv.className = "col-12 mb-3";
        itemDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-center border p-3">
                <div>
                    <h5>${item.name}</h5>
                    <p>Величина: ${item.size}</p>
                    <p>Цена: ${formatPrice(item.price)} РСД</p>
                </div>
                <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Уклони</button>
            </div>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    const totalPriceElement = document.getElementById("totalPrice");
    if (totalPriceElement) {
        totalPriceElement.textContent = `Укупно: ${formatPrice(total)} РСД`;
    }
}
