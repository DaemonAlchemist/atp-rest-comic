
import {Entity, sorting} from 'atp-active-record';

export default class Character extends Entity
{
    constructor() {
        super('comic', 'atpcomic_character');
    }

    sorting() {
        return sorting(this);
    }

    nextSortOrder() {
        return this.sorting().nextSortOrder();
    }

    remove(id) {
        return this.sorting().remove(id);
    }

    getSiblings(id) {
        return this.sorting().getSiblings(id);
    }

    insertFirst(id) {
        return this.sorting().insertFirst(id);
    }

    insertAfter(targetId, id) {
        return this.sorting().insertAfter(targetId, id);
    }
}
