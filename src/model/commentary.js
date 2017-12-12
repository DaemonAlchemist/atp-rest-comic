
import {Entity, sorting} from 'atp-active-record';

export default class Commentary extends Entity
{
    constructor() {
        super('comic', 'atpcomic_commentary');
    }

    sorting() {
        return sorting(this, 'pageId');
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
