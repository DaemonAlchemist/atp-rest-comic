
import {Entity, sorting} from 'atp-active-record';

export default class Attribute extends Entity
{
    constructor() {
        super('comic', 'atpcomic_character_attributes');
    }

    sorting() {
        return sorting(this, 'characterId');
    }

    nextSortOrder(parentId) {
        return this.sorting().nextSortOrder(parentId);
    }

    removeFromParent(id) {
        return this.sorting().removeFromParent(id);
    }

    getSiblings(parentId, id) {
        return this.sorting().getSiblings(parentId, id);
    }

    getParents(id, level = 10) {
        return this.sorting().getParents(id, level);
    }

    insertInto(parentId, id) {
        return this.sorting().insertInto(parentId, id);
    }

    insertAfter(targetId, id) {
        return this.sorting().insertAfter(targetId, id);
    }
}
