import { Item } from "./Item.js";

export class ShoppingModel {
    constructor() {
        this.lists = [];
        this.articles = [];
        this.loadLists(); // Listen aus dem Speicher laden
        this.loadItems(); // Artikel aus JSON laden
    }

    getArticlesByTag(tag) {
        return this.articles.filter(article => article.tags && article.tags.includes(tag));
    }

    addArticle(name, tags = [], icon = "❓") {
        const newArticle = { id: Date.now(), name, tags, icon };
        this.articles.push(newArticle);
        this.saveArticles();
        console.log(`✅ Neuer Artikel hinzugefügt: ${name}`);
    }

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

            // Items auch in die richtigen Listen einfügen
            data.items.forEach(item => {
                const list = this.getListById(item.listId);
                if (list) {
                    list.items.push({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        archived: item.archived || false,
                        icon: item.icon || "❓",
                        listId: item.listId
                    });
                }
            });

            this.saveLists();
            console.log("✅ Artikel den Listen zugewiesen.");
        } catch (error) {
            console.error("❌ Fehler beim Laden der Einkaufsliste:", error);
        }
    }

    getLists() {
        return this.lists;
    }

    getListById(listId) {
        const numericId = Number(listId);
        if (isNaN(numericId)) {
            console.error(`❌ Fehler: Ungültige Listen-ID (${listId})`);
            return null;
        }

        const foundList = this.lists.find(list => list.id === numericId);
        return foundList || null;
    }

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

    loadLists() {
        const savedLists = localStorage.getItem("shoppingLists");
        this.lists = savedLists ? JSON.parse(savedLists) : [
            { id: 1, name: "Lebensmittel", items: [] },
            { id: 2, name: "Haushalt", items: [] }
        ];
    }

    saveLists() {
        localStorage.setItem("shoppingLists", JSON.stringify(this.lists));
        console.log("💾 Listen gespeichert:", this.lists);
    }

    saveArticles() {
        localStorage.setItem("shoppingArticles", JSON.stringify(this.articles));
        console.log("💾 Artikel gespeichert:", this.articles);
    }

    toggleItemStatus(listId, itemId) {
        const list = this.getListById(listId);
        if (list) {
            const item = list.items.find(item => item.id === itemId);
            if (item) {
                item.archived = !item.archived;
                this.saveLists();
                console.log(`Artikel "${item.name}" ist jetzt ${item.archived ? "erledigt" : "offen"}.`);
            }
        }
    }

    deleteItem(listId, itemId) {
        const list = this.getListById(listId);
        if (!list) return;

        list.items = list.items.filter(item => item.id !== itemId);
        this.saveLists();
        console.log(`🗑️ Artikel mit ID ${itemId} aus Liste ${list.name} gelöscht.`);
    }

    saveTags() {
        localStorage.setItem("shoppingTags", JSON.stringify(this.tags));
    }

    loadTags() {
        const savedTags = localStorage.getItem("shoppingTags");
        this.tags = savedTags ? JSON.parse(savedTags) : [];
    }
    editItem(listId, itemId, newName, newQuantity) {
        const list = this.getListById(listId);
        if (!list) return;

        const item = list.items.find(item => item.id === itemId);
        if (item) {
            item.name = newName;
            item.quantity = newQuantity;
            this.saveLists();
            console.log(`✏️ Artikel ${itemId} bearbeitet: ${newName} (${newQuantity})`);
        }
    }

}
