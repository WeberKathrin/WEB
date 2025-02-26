export class ArchiveView {
    constructor() {
        this.archiveList = document.getElementById("archive-list");
    }

    renderArchivedItems(archivedItems, onUnarchive) {
        this.archiveList.innerHTML = "";
        archivedItems.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.name} - ${item.quantity}`;
            const unarchiveBtn = document.createElement("button");
            unarchiveBtn.textContent = "Zurücksetzen";
            unarchiveBtn.onclick = () => onUnarchive(item.id);
            li.appendChild(unarchiveBtn);
            this.archiveList.appendChild(li);
        });
    }
}