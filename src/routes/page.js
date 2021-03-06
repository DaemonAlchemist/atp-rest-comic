/**
 * Created by Andy on 8/25/2017.
 */

import {basicController} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import Page from "../model/page";
import PageCharacter, {PageCharacterBase} from '../model/page-character';
import {o} from 'atp-sugar';
import details from "./page/details";

import commentaryController from './commentary';

const permissions = createCrudPermissions('comic', 'page');
const commentaryPermissions = createCrudPermissions('comic', 'commentary');
const model = Page;
const idField = 'pageId';

export default o(basicController.entity.crud({model, permissions, idField})).as(crud => o(crud).merge({
    post: new model().sorting().create(crud.post),
    move: {
        post: new model().sorting().move(permissions)
    },
    [":" + idField]: {
        details,
        commentary: {
            get: (req, res) => {
                validator()
                    .loggedIn(req)
                    .hasPermission(commentaryPermissions.view, req)
                    .isInteger(req.params[idField], idField)
                    .then(() => {
                        req.query[idField] = req.params[idField];
                        req.query.columns = "id,version";
                        commentaryController.get(req, res);
                    });
            }
        },
        character: basicController.entity.many2many(
            'page', createCrudPermissions('comic', 'page'),
            'character', createCrudPermissions('comic', 'character'),
            PageCharacter, PageCharacterBase
        )
    }
}).raw);
