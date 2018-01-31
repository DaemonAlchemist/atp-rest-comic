/**
 * Created by Andy on 8/25/2017.
 */

import {basicController, respondWith} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import Arc from "../model/arc";
import {o} from 'atp-sugar';
import validator from 'atp-validator';
import details from "./arc/details";

import pageController from "./page";

const permissions = createCrudPermissions('comic', 'arc');
const pagePermissions = createCrudPermissions('comic', 'page');
const model = Arc;
const idField = 'arcId';

export default o(basicController.entity.crud({model, permissions, idField})).as(crud => o(crud).merge({
    post: new model().sorting().create(crud.post),
    move: {
        post: new model().sorting().move(permissions)
    },
    [":" + idField]: {
        details,
        page: {
            get: (req, res) => {
                validator()
                    .loggedIn(req)
                    .hasPermission(pagePermissions.view, req)
                    .isInteger(req.params[idField], idField)
                    .then(() => {
                        req.query[idField] = req.params[idField];
                        req.query.columns="id,version";
                        pageController.get(req, res);
                    });
            },
            post: (req, res) => {
                validator()
                    .loggedIn(req)
                    .hasPermission(permissions.update, req)
                    .isInteger(req.body.pageId, "pageId")
                    .then(() => {
                        const pageId = req.body.pageId;
                        const arcId = req.params.arcId;
                        req.body={arcId};
                        req.params={pageId};
                        pageController[":pageId"].patch(req, res);
                    });
            }
        }
    }
}).raw);
