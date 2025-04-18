import { ShoppingController } from "./ShoppingController.js";

document.addEventListener("DOMContentLoaded", () => {
    const controller = new ShoppingController();
    controller.init();

    const modalElement = document.getElementById("add-item-modal");
    if (!modalElement || typeof bootstrap === "undefined") {
        console.error("❌ Modal oder Bootstrap nicht verfügbar");
        return;
    }

    const modal = new bootstrap.Modal(modalElement);
    const openModalBtn = document.getElementById("open-add-item-modal");

    if (openModalBtn) {
        openModalBtn.addEventListener("click", () => {
            console.log("➕ Modal wird geöffnet");
            modal.show();
            setTimeout(addPredefinedEventListeners, 300);
        });
    }

    const addItemForm = document.getElementById("add-item-form");
    if (addItemForm) {
        addItemForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("📨 Formular wurde abgeschickt");

            const name = document.getElementById("item-name").value.trim();
            const quantity = document.getElementById("item-quantity").value.trim();
            const icon = document.getElementById("item-icon").value;
            const tagInput = document.getElementById("item-tags").value;
            const tags = tagInput.split(",").map(t => t.trim()).filter(t => t.length > 0);

            const currentListId = controller.currentListId;

            console.log("🧾 Eingaben:", { name, quantity, icon, tags });
            console.log("📌 Aktuelle Liste:", currentListId);

            if (!name || !quantity) {
                alert("⚠️ Bitte Name und Menge angeben.");
                return;
            }

            if (currentListId) {
                // Neuen Artikel global speichern
                controller.model.addArticle(name, tags, icon);

                // Artikel zur Liste hinzufügen
                controller.model.addItemToList(currentListId, name, quantity, icon);
                controller.showDetailView(currentListId);
                controller.updateOverview();
                controller.populateTagFilter();

                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();

                // 🧼 FINALER SCROLL-FIX: Der Zombie muss weg!
                setTimeout(() => {
                    document.querySelectorAll(".modal-backdrop").forEach(b => b.remove());
                    document.body.classList.remove("modal-open");
                    document.body.style.overflow = "";
                    document.body.style.paddingRight = "";
                }, 300);

                addItemForm.reset();
                console.log("✅ Artikel wurde hinzugefügt");
            } else {
                alert("⚠️ Bitte zuerst eine Liste auswählen!");
                console.warn("❌ Kein currentListId gesetzt – Artikel nicht hinzugefügt");
            }
        });
    } else {
        console.error("❌ add-item-form nicht gefunden!");
    }

    addListenerButton(controller);
});

function addPredefinedEventListeners() {
    const buttons = document.querySelectorAll(".add-predefined-btn");

    if (buttons.length === 0) return;

    buttons.forEach(button => {
        button.removeEventListener("click", handlePredefinedAdd);
        button.addEventListener("click", handlePredefinedAdd);
    });
}

function handlePredefinedAdd(event) {
    const itemDiv = event.target.closest(".predefined-item");
    if (!itemDiv) return;

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

function addListenerButton(controller) {
    const listContainer = document.getElementById("list-container");
    if (!listContainer) return;

    const existingButton = document.getElementById("add-listener");
    if (existingButton) return;

    button.addEventListener("click", () => {
        const listName = prompt("Name der neuen Liste:");
        if (listName) {
            controller.model.addList(listName);
            controller.updateOverview();
        }
    });

    listContainer.appendChild(button);
}
