import { ShoppingController } from "./ShoppingController.js";

document.addEventListener("DOMContentLoaded", () => {
    const controller = new ShoppingController();
    controller.init();

    const modalElement = document.getElementById("add-item-modal");
    if (!modalElement) {
        return;
    }

    if (typeof bootstrap === "undefined") {
        return;
    }

    const modal = new bootstrap.Modal(modalElement);
    const openModalBtn = document.getElementById("open-add-item-modal");

    if (!openModalBtn) {
        return;
    }

    openModalBtn.addEventListener("click", () => {
        modal.show();
        setTimeout(addPredefinedEventListeners, 300);
    });

    addListenerButton();
});

// Event-Listener für `+`-Buttons dynamisch hinzufügen
function addPredefinedEventListeners() {
    const buttons = document.querySelectorAll(".add-predefined-btn");

    if (buttons.length === 0) {
        return;
    }

    buttons.forEach(button => {
        button.removeEventListener("click", handlePredefinedAdd);
        button.addEventListener("click", handlePredefinedAdd);
    });
}

function handlePredefinedAdd(event) {
    const itemDiv = event.target.closest(".predefined-item");
    if (!itemDiv) {
        return;
    }

    const itemName = itemDiv.querySelector(".predefined-name").textContent.trim();
    const itemIcon = itemDiv.querySelector(".predefined-icon").textContent.trim();
    const itemQuantity = itemDiv.querySelector(".predefined-quantity").value.trim();

    if (itemQuantity && itemQuantity > 0) {
        const controller = new ShoppingController();
        if (controller.currentListId) {
            controller.model.addItemToList(controller.currentListId, itemName, itemQuantity, itemIcon);
            controller.showDetailView(controller.currentListId);
        } else {
            alert("Wähle zuerst eine Liste aus!");
        }

        const modalElement = document.getElementById("add-item-modal");
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
    } else {
        alert("Bitte eine gültige Menge eingeben.");
    }
}

// Artikel zur Einkaufsliste hinzufügen
function addItemToList(name, quantity, icon) {
    const list = document.getElementById("item-detail-list");
    if (!list) {
        return;
    }

    const li = document.createElement("li");
    li.classList.add("article-item");
    li.innerHTML = `
        <span class="article-icon">${icon}</span>
        <span class="article-text">${name} (${quantity})</span>
    `;

    li.addEventListener("click", () => {
        li.classList.toggle("strikethrough");
        sortItems();
    });

    list.appendChild(li);
    sortItems();
}

// Artikel sortieren: Abgehakte Artikel nach unten
function sortItems() {
    const list = document.getElementById("item-detail-list");
    if (!list) return;

    const items = Array.from(list.children);
    items.sort((a, b) => a.classList.contains("strikethrough") - b.classList.contains("strikethrough"));

    list.innerHTML = "";
    items.forEach(item => list.appendChild(item));
}

// Button für neue Listen unter die Listenübersicht setzen
document.addEventListener("DOMContentLoaded", () => {
    const listContainer = document.getElementById("list-container");
    if (!listContainer) return;

    button.addEventListener("click", () => {
        const listName = prompt("Name der neuen Liste:");
        if (listName) {
            const controller = new ShoppingController();
            controller.model.addList(listName);
            controller.updateOverview();
        }
    });

    listContainer.appendChild(button);
});

function addListenerButton() {
    const listContainer = document.getElementById("list-container");
    if (!listContainer) return;

    const button = document.createElement("button");
    button.id = "add-listener";
    button.classList.add("add-listener-btn");
    button.textContent = "Neue Liste";

    button.addEventListener("click", () => {
        const listName = prompt("Name der neuen Liste:");
        if (listName) {
            const controller = new ShoppingController();
            controller.model.addList(listName);
            controller.updateOverview();
        }
    });

    listContainer.appendChild(button);
}

// Startseite ausblenden und Hauptansicht anzeigen
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-button");
    if (startButton) {
        startButton.addEventListener("click", () => {
            document.getElementById("title-page").style.display = "none";
            document.getElementById("overview-view").style.display = "block";
            document.getElementById("detail-view").style.display = "block";

            // Artikelverwaltung auch einblenden
            const articleManagement = document.getElementById("tag-management") || document.getElementById("article-management");
            if (articleManagement) {
                articleManagement.style.display = "block";
            }
        });
    }
    // Setzt den angemeldeten Benutzer
    function setUser(username) {
        document.getElementById("username").textContent = `Angemeldet als ${username}`;
    }

// Simulierter Benutzer (Später durch echtes Login ersetzbar)
    document.addEventListener("DOMContentLoaded", () => {
        setUser("Max Mustermann"); // Hier den Benutzername setzen
    });

});
