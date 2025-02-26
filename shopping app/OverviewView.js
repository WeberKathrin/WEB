export class OverviewView {
    constructor() {
        this.listContainer = document.getElementById("list-container");

        if (!this.listContainer) {
            console.error("Fehler: list-container wurde nicht gefunden!");
            return;
        }
    }

    renderLists(lists, onSelectList, onEditList, onDeleteList, onShareList) {
        this.listContainer.innerHTML = "";

        lists.forEach(list => {
            const li = document.createElement("li");
            li.classList.add("list-item");

            const button = document.createElement("button");
            button.textContent = list.name;
            button.classList.add("list-button");
            button.onclick = () => onSelectList(list.id);

            const menuButton = document.createElement("span");
            menuButton.classList.add("list-menu");
            menuButton.textContent = "⋮";
            menuButton.onclick = (event) => this.showListMenu(
                event,
                list.id,
                onEditList,
                onDeleteList,
                onShareList
            );

            li.appendChild(button);
            li.appendChild(menuButton);
            this.listContainer.appendChild(li);
        });
    }


}
