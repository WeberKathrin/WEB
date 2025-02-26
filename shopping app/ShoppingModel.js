import { Item } from "./Item.js";

export class ShoppingModel {
    constructor() {
        this.lists = [];
        this.articles = [];
        this.loadLists(); // Listen aus dem Speicher laden
        this.loadItems(); // Artikel aus JSON laden
        console.log("📦 Initialisierte Artikel:", this.articles);
    }

    // 🔎 Artikel nach Tags filtern
    getArticlesByTag(tag) {
        return this.articles.filter(article => article.tags && article.tags.includes(tag));
    }

    // ➕ Artikel hinzufügen und speichern
    addArticle(name, tags = [], icon = "❓") {
        const newArticle = { id: Date.now(), name, tags, icon };
        this.articles.push(newArticle);
        this.saveArticles();
        console.log(`✅ Neuer Artikel hinzugefügt: ${name}`);
    }

    // 🗑️ Artikel löschen (nur wenn er nicht in einer Liste ist)
    deleteArticle(articleId) {
        const isUsed = this.lists.some(list => list.items.some(item => item.id === articleId));
        if (!isUsed) {
            this.articles = this.articles.filter(article => article.id !== articleId);
            this.saveArticles();
            console.log(`🗑️ Artikel mit ID ${articleId} wurde gelöscht.`);
        } else {
            alert("⚠️ Dieser Artikel ist noch in einer Liste und kann nicht gelöscht werden!");
        }
    }

    // 🔄 Artikel aus `shoppinglist.json` laden
    async loadItems() {
        try {
            const response = await fetch("./shoppinglist.json");
            if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`);

            const data = await response.json();
            console.log("📥 Daten aus shoppinglist.json geladen:", data);

            this.articles = data.items.map(item => ({
                id: item.id,
                name: item.name,
                tags: item.tags || [],
                icon: item.icon || "❓"
            }));

            console.log("✅ Artikel erfolgreich gespeichert:", this.articles);
            this.populateTagFilter();
        } catch (error) {
            console.error("❌ Fehler beim Laden der Einkaufsliste:", error);
        }
    }

    // 📋 Alle Listen zurückgeben
    getLists() {
        return this.lists;
    }

    // 🔎 Liste anhand der ID finden
    getListById(listId) {
        const numericId = Number(listId);
        if (isNaN(numericId)) {
            console.error(`❌ Fehler: Ungültige Listen-ID (${listId})`);
            return null;
        }

        const foundList = this.lists.find(list => list.id === numericId);
        console.log("📌 Gefundene Liste:", foundList);
        return foundList || null;
    }

    // ➕ Item zur Liste hinzufügen
    addItemToList(listId, name, quantity, icon) {
        const list = this.getListById(listId);
        if (list) {
            const newItem = {
                id: Date.now(),
                name,
                quantity,
                icon: icon || "❓",
                archived: false,
                listId: listId
            };
            list.items.push(newItem);
            this.saveLists();
            console.log(`✅ Artikel "${name}" wurde zu Liste ${list.name} hinzugefügt.`);
        } else {
            console.error(`❌ Fehler: Liste mit ID ${listId} nicht gefunden.`);
        }
    }

    // ➕ Neue Liste erstellen
    addList(name) {
        const newList = {
            id: Date.now(),
            name: name,
            items: []
        };
        this.lists.push(newList);
        this.saveLists();
        console.log(`✅ Neue Liste erstellt: ${name}`);
    }

    // 🔄 Listen aus LocalStorage laden
    loadLists() {
        const savedLists = localStorage.getItem("shoppingLists");
        this.lists = savedLists ? JSON.parse(savedLists) : [
            { id: 1, name: "Lebensmittel", items: [] },
            { id: 2, name: "Haushalt", items: [] }
        ];
    }

    // 💾 Listen speichern
    saveLists() {
        localStorage.setItem("shoppingLists", JSON.stringify(this.lists));
        console.log("💾 Listen gespeichert:", this.lists);
    }

    // 💾 Artikel speichern
    saveArticles() {
        localStorage.setItem("shoppingArticles", JSON.stringify(this.articles));
        console.log("💾 Artikel gespeichert:", this.articles);
    }

    // ✅ Status eines Artikels umschalten (gekauft/nicht gekauft)
    toggleItemStatus(listId, itemId) {
        const list = this.getListById(listId);
        if (list) {
            const item = list.items.find(item => item.id === itemId);
            if (item) {
                item.archived = !item.archived;
                this.saveLists();
                console.log(`🔄 Artikel "${item.name}" ist jetzt ${item.archived ? "erledigt" : "offen"}.`);
            }
        }
    }

    // 🗑️ Artikel aus einer Liste löschen
    deleteItem(listId, itemId) {
        const list = this.getListById(listId);
        if (list) {
            list.items = list.items.filter(item => item.id !== itemId);
            this.saveLists();
            console.log(`🗑️ Artikel mit ID ${itemId} wurde aus Liste ${list.name} entfernt.`);
        }
    }

    // ✏️ Artikel bearbeiten
    editItem(listId, itemId, newName, newQuantity) {
        console.log(`✏️ Bearbeiten: listId=${listId}, itemId=${itemId}`);

        const list = this.getListById(listId);
        if (!list) {
            console.error(`❌ Fehler: Liste mit ID ${listId} nicht gefunden.`);
            return;
        }

        const item = list.items.find(item => item.id === itemId);
        if (!item) {
            console.error(`❌ Fehler: Artikel mit ID ${itemId} nicht gefunden.`);
            return;
        }

        item.name = newName;
        item.quantity = newQuantity;
        this.saveLists();
        console.log(`✅ Artikel bearbeitet: ${newName} (${newQuantity})`);
    }
    saveTags() {
        localStorage.setItem("shoppingTags", JSON.stringify(this.tags));
    }
    loadTags() {
        const savedTags = localStorage.getItem("shoppingTags");
        this.tags = savedTags ? JSON.parse(savedTags) : [];
    }

}
