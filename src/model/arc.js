/**
 * Created by Andrea on 8/27/2017.
 */

import {Entity, sorting} from 'atp-active-record';

const tableName = 'atpcomic_arcs';

export default class Arc extends Entity
{
    constructor() {
        super('comic', tableName);
    }

    sorting() {
        return sorting(this, 'parentId');
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
