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
            this.model.loadTags();
            this.populateTagFilter();
        });

        this.updateOverview();
        this.updateArticleView();

        const tagFilter = document.getElementById("tag-filter");
        if (tagFilter) {
            tagFilter.addEventListener("change", () => {
                this.updateArticleView();
            });
        } else {
            console.warn("⚠️ Tag-Filter Dropdown nicht gefunden");
        }

        const tagButton = document.getElementById("add-tag-button");
        if (tagButton) {
            tagButton.addEventListener("click", () => {
                const input = document.getElementById("new-tag-input");
                if (input && input.value.trim() !== "") {
                    this.addTag(input.value);
                    input.value = "";
                }
            });
        }
    }

    updateArticleView() {
        const tagFilter = document.getElementById("tag-filter").value;
        const articles = tagFilter && tagFilter !== ""
            ? this.model.getArticlesByTag(tagFilter)
            : this.model.articles;

        const list = document.getElementById("available-articles");
        if (!list) {
            console.error("❌ Fehler: `available-articles` wurde nicht gefunden!");
            return;
        }

        list.innerHTML = "";

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
        listContainer.innerHTML = "";

        const lists = this.model.getLists();
        this.overviewView.renderLists(lists, (listId) => {
            this.currentListId = listId;
            this.showDetailView(listId);
        });

        if (!document.getElementById("add-list-button")) {
            this.addNewListButton();
        }
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
                    this.updateOverview();
                },
                (listId, itemId) => {
                    this.editItem(listId, itemId);
                },
                (listId, itemId) => {
                    this.deleteItem(listId, itemId);
                    this.updateOverview();
                },
                () => this.updateOverview()
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

    addNewListButton() {
        const listContainer = document.getElementById("list-container");
        if (!listContainer) return;

        const existingButtons = document.querySelectorAll("#add-list-button");
        existingButtons.forEach(button => button.remove());

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

    populateTagFilter() {
        const tagFilter = document.getElementById("tag-filter");
        if (!tagFilter) {
            console.error("❌ Fehler: `tag-filter` nicht gefunden!");
            return;
        }

        tagFilter.innerHTML = "<option value=''>Alle</option>";

        const allTags = new Set();
        this.model.articles.forEach(article => {
            if (article.tags && Array.isArray(article.tags)) {
                article.tags.forEach(tag => allTags.add(tag));
            }
        });

        this.model.tags.forEach(tag => allTags.add(tag));

        allTags.forEach(tag => {
            const option = document.createElement("option");
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });

        console.log("✅ Tag-Filter aktualisiert:", [...allTags]);
    }

    addTag(tagName) {
        if (!tagName || tagName.trim() === "") return;

        tagName = tagName.trim();

        if (this.model.tags.includes(tagName)) {
            alert("⚠️ Tag existiert bereits!");
            return;
        }

        this.model.tags.push(tagName);
        this.model.saveTags();

        this.populateTagFilter();
        alert(`✅ Neuer Tag hinzugefügt: ${tagName}`);
    }
}
