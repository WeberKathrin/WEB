export class OverviewView {
    constructor() {
        this.listContainer = document.getElementById("list-container");

        if (!this.listContainer) {
            return;
        }
    }

    renderLists(lists, onSelectList) {
        this.listContainer.innerHTML = "";

        lists.forEach(list => {
            const li = document.createElement("li");
            li.classList.add("list-item");

            // Anzahl der Artikel berechnen
            const itemCount = list.items ? list.items.length : 0;

            // Erstellt einen Button mit dem Listennamen + Anzahl der Artikel
            const button = document.createElement("button");
            button.textContent = `${list.name} (${itemCount})`; // Fügt die Anzahl hinzu
            button.classList.add("list-button");
            button.onclick = () => onSelectList(list.id);

            li.appendChild(button);
            this.listContainer.appendChild(li);
        });
    }
}
