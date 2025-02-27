import { ShoppingModel } from "./ShoppingModel.js";
import { OverviewView } from "./OverviewView.js";
import { DetailView } from "./DetailView.js";

export class ShoppingController {
    constructor() {
        this.model = new ShoppingModel();
        this.overviewView = new OverviewView();
        this.detailView = new DetailView();
        this.currentListId = null;
    }

    init() {
        this.model.loadLists();
        this.model.loadItems().then(() => {
            this.populateTagFilter(); // 🔄 Tag-Filter nach Laden aktualisieren
        });
        this.updateOverview();
        this.updateArticleView();


        document.getElementById("tag-filter").addEventListener("change", () => {
            this.updateArticleView();
        });


        document.getElementById("add-article").addEventListener("click", () => {
            const name = document.getElementById("new-article-name").value.trim();
            const tags = document.getElementById("new-article-tags").value.split(",").map(t => t.trim());
            const icon = document.getElementById("new-article-icon").value;

            if (name) {
                this.model.addArticle(name, tags, icon);
                this.updateArticleView();
            }
        });

        // Event-Listener für das Modal
        const modalElement = document.getElementById("add-item-modal");
        const openModalBtn = document.getElementById("open-add-item-modal");

        if (!modalElement) {
            console.error("Fehler: Modal-Element nicht gefunden!");
        } else if (!openModalBtn) {
            console.error("Fehler: Button zum Öffnen des Modals nicht gefunden!");
        } else {
            this.addItemModal = new bootstrap.Modal(modalElement);
            openModalBtn.addEventListener("click", () => this.addItemModal.show());
        }
    }


    updateArticleView() {
        const tagFilter = document.getElementById("tag-filter").value;
        const articles = tagFilter && tagFilter !== ""
            ? this.model.getArticlesByTag(tagFilter)
            : this.model.articles; // ← Hier war das Problem!

        const list = document.getElementById("available-articles");
        if (!list) {
            console.error("❌ Fehler: `available-articles` wurde nicht gefunden!");
            return;
        }

        list.innerHTML = ""; // Vorherige Artikel löschen

        articles.forEach(article => {
            const li = document.createElement("li");
            li.textContent = `${article.icon} ${article.name}`;
            li.onclick = () => {
                if (this.currentListId) {
                    this.model.addItemToList(this.currentListId, article.name, 1, article.icon);
                    this.showDetailView(this.currentListId);
                } else {
                    alert("⚠️ Wähle zuerst eine Liste aus!");
                }
            };
            list.appendChild(li);
        });

        console.log("🔄 Artikel-Übersicht aktualisiert:", articles);
    }



    updateOverview() {
        const listContainer = document.getElementById("list-container");
        listContainer.innerHTML = ""; // Liste leeren

        const lists = this.model.getLists();
        this.overviewView.renderLists(lists, (listId) => {
            this.currentListId = listId;
            this.showDetailView(listId);
        });

        // 🎯 Sicherstellen, dass der "Neue Liste"-Button nur einmal existiert
        if (!document.getElementById("add-list-button")) {
            this.addNewListButton();
        }
    }

// ✅ Funktion zur Überprüfung, ob alle Artikel einer Liste erledigt sind
    isListCompleted(listId) {
        const list = this.model.getListById(listId);
        if (!list || list.items.length === 0) return false; // Falls die Liste leer ist, ist sie nicht "fertig"

        return list.items.every(item => item.archived); // Prüft, ob ALLE Artikel `archived: true` sind
    }



    addNewListButton() {
        const listContainer = document.getElementById("list-container");
        if (!listContainer) return;

        // 🔥 Entferne alte Buttons bevor ein neuer hinzugefügt wird
        const existingButtons = document.querySelectorAll("#add-list-button");
        existingButtons.forEach(button => button.remove());

        // Neuen Button erstellen
        const button = document.createElement("button");
        button.id = "add-list-button";
        button.classList.add("btn", "btn-primary", "mt-3");
        button.textContent = "Neue Liste";

        button.addEventListener("click", () => {
            const listName = prompt("Gib den Namen der neuen Liste ein:");
            if (listName) {
                this.model.addList(listName);
                this.updateOverview();
            }
        });

        listContainer.appendChild(button);
    }


    showDetailView(listId) {
        const list = this.model.getListById(listId);
        if (list) {
            document.getElementById("list-name").textContent = list.name;

            this.detailView.renderDetail(
                list,
                (name, quantity, icon) => {
                    this.model.addItemToList(listId, name, quantity, icon);
                    this.showDetailView(listId);
                },
                (listId, itemId) => {
                    this.model.toggleItemStatus(listId, itemId);
                    this.showDetailView(listId);
                    this.updateOverview();  // Listenübersicht aktualisieren
                },
                (listId, itemId) => {
                    this.editItem(listId, itemId);
                },
                (listId, itemId) => {
                    this.deleteItem(listId, itemId);
                    this.updateOverview();  // Listenübersicht aktualisieren
                },
                () => this.updateOverview()  // Hier `updateOverview` als Funktion übergeben
            );


            document.getElementById("detail-view").style.display = "block";
        }
    }


    editItem(listId, itemId) {
        const item = this.model.getListById(listId).items.find(item => item.id === itemId);
        if (!item) return;

        const newName = prompt("Neuer Name für den Artikel:", item.name);
        const newQuantity = prompt("Neue Menge:", item.quantity);

        if (newName && newQuantity) {
            this.model.editItem(listId, itemId, newName, newQuantity);
            this.showDetailView(listId);
        }
    }

    deleteItem(listId, itemId) {
        if (confirm("Möchtest du diesen Artikel wirklich löschen?")) {
            this.model.deleteItem(listId, itemId);
            this.showDetailView(listId);
        }
    }

    showListMenu(event, listId) {
        console.log(`📌 Menü wird geöffnet für Listen-ID: ${listId}`);

        // Vorherige Menüs entfernen
        document.querySelectorAll(".dropdown-menu").forEach(menu => menu.remove());

        if (!event?.currentTarget) {
            console.error("❌ Fehler: Event-Target nicht gefunden.");
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
        menu.style.minWidth = "120px";

        // 📌 Bearbeiten
        const editOption = document.createElement("div");
        editOption.classList.add("menu-item");
        editOption.textContent = "Bearbeiten ✏️";
        editOption.style.padding = "5px";
        editOption.style.cursor = "pointer";
        editOption.onclick = () => {
            console.log(`✏️ Bearbeiten angeklickt: listId=${listId}`);
            this.editList(listId);
            menu.remove();
        };

        // 📌 Löschen
        const deleteOption = document.createElement("div");
        deleteOption.classList.add("menu-item");
        deleteOption.textContent = "Löschen 🗑️";
        deleteOption.style.padding = "5px";
        deleteOption.style.cursor = "pointer";
        deleteOption.onclick = () => {
            console.log(`🗑️ Löschen angeklickt: listId=${listId}`);
            this.deleteList(listId);
            menu.remove();
        };

        // 📌 Teilen
        const shareOption = document.createElement("div");
        shareOption.classList.add("menu-item");
        shareOption.textContent = "Teilen 📤";
        shareOption.style.padding = "5px";
        shareOption.style.cursor = "pointer";
        shareOption.onclick = () => {
            console.log(`📤 Teilen angeklickt: listId=${listId}`);
            this.shareList(listId);
            menu.remove();
        };

        // Optionen ins Menü einfügen
        menu.appendChild(editOption);
        menu.appendChild(deleteOption);
        menu.appendChild(shareOption);

        // Position des Menüs berechnen und verhindern, dass es aus dem Bildschirm rutscht
        const rect = event.currentTarget.getBoundingClientRect();
        const menuWidth = 150;
        menu.style.left = `${rect.left + window.scrollX}px`;
        menu.style.top = `${rect.bottom + window.scrollY}px`;

        if (rect.left + menuWidth > window.innerWidth) {
            menu.style.left = `${window.innerWidth - menuWidth - 10}px`; // Falls zu weit rechts, nach links verschieben
        }

        document.body.appendChild(menu);
        console.log("✅ Dropdown-Menü für Listen wurde hinzugefügt:", menu);

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

// ✏️ Bearbeiten-Funktion für Listen
    editList(listId) {
        const list = this.model.getListById(listId);
        if (!list) {
            console.error(`❌ Fehler: Liste mit ID ${listId} nicht gefunden.`);
            return;
        }

        const newName = prompt("Neuer Name für die Liste:", list.name);
        if (newName && newName.trim() !== "") {
            list.name = newName;
            this.model.saveLists(); // Speichert die Änderungen
            this.updateOverview(); // Aktualisiert die Listenübersicht
            console.log(`✅ Liste umbenannt in: ${newName}`);
        }
    }

// 🗑️ Löschen-Funktion für Listen
    deleteList(listId) {
        if (!confirm("Möchtest du diese Liste wirklich löschen?")) return;
        this.model.deleteList(listId);
        this.updateOverview(); // Aktualisiert die Übersicht nach dem Löschen
        console.log(`🗑️ Liste mit ID ${listId} wurde gelöscht.`);
    }

// 📤 Teilen-Funktion für Listen
    shareList(listId) {
        const list = this.model.getListById(listId);
        if (!list) {
            console.error(`❌ Fehler: Liste mit ID ${listId} nicht gefunden.`);
            return;
        }

        const userEmail = prompt("Gib die E-Mail-Adresse ein, mit der du die Liste teilen möchtest:");
        if (userEmail && userEmail.includes("@")) {
            console.log(`📤 Liste "${list.name}" wurde mit ${userEmail} geteilt.`);
            alert(`📧 Liste "${list.name}" wurde erfolgreich mit ${userEmail} geteilt!`);
        } else {
            alert("⚠️ Bitte gib eine gültige E-Mail-Adresse ein.");
        }
    }

    populateTagFilter() {
        const tagFilter = document.getElementById("tag-filter");
        if (!tagFilter) {
            console.error("❌ Fehler: `tag-filter` nicht gefunden!");
            return;
        }

        // Entferne alte Einträge
        tagFilter.innerHTML = "<option value=''>Alle</option>";

        // Erstelle eine Liste aller Tags
        const allTags = new Set();
        this.model.articles.forEach(article => {
            console.log("🔍 Artikel geladen:", article.name, "Tags:", article.tags);
            if (article.tags && Array.isArray(article.tags)) {
                article.tags.forEach(tag => allTags.add(tag));
            }
        });

        console.log("📌 Alle gefundenen Tags:", [...allTags]);

        // Falls keine Tags existieren
        if (allTags.size === 0) {
            console.warn("⚠️ Keine Tags gefunden! Stelle sicher, dass `shoppinglist.json` Tags enthält.");
            return;
        }

        // Füge Tags ins Dropdown ein
        allTags.forEach(tag => {
            const option = document.createElement("option");
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });

        console.log("✅ Tag-Filter aktualisiert:", [...allTags]);
    }
    addTag(tagName) {
        if (!tagName || tagName.trim() === "") return; // Leere Eingaben ignorieren

        tagName = tagName.trim();

        // Stelle sicher, dass der Tag nicht doppelt hinzugefügt wird
        if (this.model.tags.includes(tagName)) {
            alert("⚠️ Tag existiert bereits!");
            return;
        }

        this.model.tags.push(tagName); // Füge den neuen Tag hinzu
        this.model.saveTags(); // Speichere die aktualisierte Tag-Liste

        this.populateTagFilter(); // Aktualisiere das Dropdown
        console.log(`✅ Neuer Tag hinzugefügt: ${tagName}`);
    }
    updateTagDropdown() {
        const tagFilter = document.getElementById("tag-filter");
        if (!tagFilter) {
            console.error("❌ Fehler: Tag-Filter Dropdown nicht gefunden!");
            return;
        }

        // 🗑️ Bestehende Optionen entfernen (bis auf "Alle")
        tagFilter.innerHTML = '<option value="">Alle</option>';

        // 🎯 Alle Tags aus dem Model holen und ins Dropdown einfügen
        this.model.tags.forEach(tag => {
            const option = document.createElement("option");
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });

        console.log("🔄 Tag-Dropdown aktualisiert:", this.model.tags);
    }


}
