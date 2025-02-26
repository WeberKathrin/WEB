export class DetailView {
    constructor() {
        this.itemDetailList = document.getElementById("item-detail-list");
        this.addItemCard = document.getElementById("add-item-card");
        this.addItemBtn = document.getElementById("add-item-btn");
        this.predefinedItems = [
            { name: "Milch", icon: "🥛" },
            { name: "Brot", icon: "🍞" },
            { name: "Äpfel", icon: "🍎" },
            { name: "Eier", icon: "🥚" },
            { name: "Käse", icon: "🧀" }
        ];

        if (this.addItemBtn) {
            this.addItemBtn.addEventListener("click", () => {
                this.addItemCard.style.display = "block";
            });
        }
    }

    renderDetail(list, onAddItem, onToggleItemStatus, onEditItem, onDeleteItem, updateOverview) {
        this.onAddItem = onAddItem;
        this.itemDetailList.innerHTML = "";

        const sortedItems = [...list.items].sort((a, b) => {
            if (a.archived !== b.archived) {
                return a.archived - b.archived;
            }
            return b.id - a.id;
        });

        sortedItems.forEach(item => {
            item.listId = list.id;

            const li = document.createElement("li");
            li.classList.add("article-item");

            const iconSpan = document.createElement("span");
            iconSpan.classList.add("article-icon");
            iconSpan.textContent = item.icon || "❓";

            const textSpan = document.createElement("span");
            textSpan.classList.add("article-text");
            textSpan.textContent = item.name;
            if (item.archived) textSpan.classList.add("strikethrough");

            const menuButton = document.createElement("span");
            menuButton.classList.add("article-menu");
            menuButton.textContent = "⋮";
            menuButton.onclick = (event) => this.showArticleMenu(item, event, onEditItem, onDeleteItem);

            textSpan.onclick = () => {
                onToggleItemStatus(list.id, item.id);
                this.renderDetail(list, onAddItem, onToggleItemStatus, onEditItem, onDeleteItem, updateOverview);
                updateOverview();
            };

            li.appendChild(iconSpan);
            li.appendChild(textSpan);
            li.appendChild(menuButton);

            if (item.imageUrl) {
                const img = document.createElement("img");
                img.src = item.imageUrl;
                img.style.width = "50px";
                img.style.marginLeft = "10px";
                li.appendChild(img);
            }

            this.itemDetailList.appendChild(li);
        });
    }

    showArticleMenu(item, event, onEditItem, onDeleteItem) {
        console.log(`Menü wird geöffnet für: ${item.name}, ID: ${item.id}`);

        // Vorherige Menüs entfernen
        document.querySelectorAll(".dropdown-menu").forEach(menu => menu.remove());

        if (!event?.currentTarget) {
            console.error("Fehler: Event-Target nicht gefunden.");
            return;
        }

        // Menü erstellen
        let menu = document.createElement("div");
        menu.classList.add("dropdown-menu");
        menu.style.position = "absolute";
        menu.style.background = "#fff";
        menu.style.boxShadow = "0px 2px 5px rgba(0, 0, 0, 0.2)";
        menu.style.borderRadius = "5px";
        menu.style.padding = "10px";
        menu.style.zIndex = "1000";
        menu.style.display = "block";

        const editOption = document.createElement("div");
        editOption.classList.add("menu-item");
        editOption.textContent = "Bearbeiten";
        editOption.style.padding = "5px";
        editOption.style.cursor = "pointer";
        editOption.onclick = () => {
            console.log(`Bearbeiten angeklickt: itemId=${item.id}`);
            onEditItem(item.listId, item.id);
            menu.remove();
        };

        const deleteOption = document.createElement("div");
        deleteOption.classList.add("menu-item");
        deleteOption.textContent = "Löschen";
        deleteOption.style.padding = "5px";
        deleteOption.style.cursor = "pointer";
        deleteOption.onclick = () => {
            console.log(`Löschen angeklickt: itemId=${item.id}`);
            onDeleteItem(item.listId, item.id);
            menu.remove();
        };

        // Optionen ins Menü einfügen
        menu.appendChild(editOption);
        menu.appendChild(deleteOption);

        // Menü-Position setzen
        const rect = event.currentTarget.getBoundingClientRect();
        menu.style.left = `${rect.left + window.scrollX}px`;
        menu.style.top = `${rect.bottom + window.scrollY}px`;

        document.body.appendChild(menu);

        console.log("✅ Dropdown-Menü wurde hinzugefügt:", menu);

        // Menü schließen, wenn außerhalb geklickt wird
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                console.log("Menü wird geschlossen");
                menu.remove();
                document.removeEventListener("click", closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener("click", closeMenu);
        }, 100);
    }
    showListMenu(event, listId, onEditList, onDeleteList, onShareList) {
        console.log(`📌 Menü für Liste mit ID ${listId} wird geöffnet`);

        // Vorherige Menüs entfernen
        document.querySelectorAll(".dropdown-menu").forEach(menu => menu.remove());

        if (!event?.currentTarget) {
            console.error("❌ Fehler: Kein gültiges Event-Target.");
            return;
        }

        // Menü-Container erstellen
        let menu = document.createElement("div");
        menu.classList.add("dropdown-menu");
        menu.style.display = "block"; // Sichtbar machen
        menu.style.position = "absolute";

        const editOption = document.createElement("div");
        editOption.classList.add("menu-item");
        editOption.textContent = "Bearbeiten";
        editOption.onclick = () => {
            console.log(`✏️ Bearbeiten: listId=${listId}`);
            onEditList(listId);
            menu.remove();
        };

        const deleteOption = document.createElement("div");
        deleteOption.classList.add("menu-item");
        deleteOption.textContent = "Löschen";
        deleteOption.onclick = () => {
            console.log(`🗑️ Löschen: listId=${listId}`);
            onDeleteList(listId);
            menu.remove();
        };

        const shareOption = document.createElement("div");
        shareOption.classList.add("menu-item");
        shareOption.textContent = "Teilen";
        shareOption.onclick = () => {
            console.log(`📤 Teilen: listId=${listId}`);
            onShareList(listId);
            menu.remove();
        };

        // Optionen ins Menü einfügen
        menu.appendChild(editOption);
        menu.appendChild(deleteOption);
        menu.appendChild(shareOption);

        // Position berechnen
        const rect = event.currentTarget.getBoundingClientRect();
        menu.style.left = `${rect.left + window.scrollX}px`;
        menu.style.top = `${rect.bottom + window.scrollY}px`;

        // Menü zum Dokument hinzufügen
        document.body.appendChild(menu);

        console.log("✅ Dropdown-Menü wurde angezeigt:", menu);

        // Menü schließen, wenn außerhalb geklickt wird
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                console.log("❌ Menü wird geschlossen");
                menu.remove();
                document.removeEventListener("click", closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener("click", closeMenu);
        }, 100);
    }

}
