export class Item {
    constructor(id, name, quantity, archived = false) {
        this.id = id;
        this.name = name;
        this.quantity = quantity;
        this.archived = archived;
    }
}