/**
 * Created by Andy on 8/25/2017.
 */

import {basicController} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import Character from "../model/character";
import {o} from 'atp-sugar';

import attributeController from "./attribute";

const permissions = createCrudPermissions('comic', 'character');
const attributePermissions = createCrudPermissions('comic', 'attribute');

const model = Character;
const idField = 'characterId';

export default o(basicController.entity.crud({model, permissions, idField})).as(crud => o(crud).merge({
    post: new model().sorting().create(crud.post),
    move: {
        post: new model().sorting().move(permissions)
    },
    [":" + idField]: {
        attribute: {
            get: (req, res) => {
                validator()
                    .loggedIn(req)
                    .hasPermission(attributePermissions.view, req)
                    .isInteger(req.params[idField], idField)
                    .then(() => {
                        req.query[idField] = req.params[idField];
                        req.query.columns = "id,version";
                        attributeController.get(req, res);
                    });
            }
        }
    }
}).raw);
