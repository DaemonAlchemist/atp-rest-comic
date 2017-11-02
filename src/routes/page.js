/**
 * Created by Andy on 8/25/2017.
 */

import {basicController} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import Page from "../model/page";
import {o} from 'atp-sugar';

const permissions = createCrudPermissions('comic', 'page');
const model = Page;
const idField = 'pageId';

export default o(basicController.entity.crud({model, permissions, idField})).as(crud => o(crud).merge({
    post: new model().sorting().create(crud.post),
    move: {
        post: new model().sorting().move(permissions)
    }
}).raw);
