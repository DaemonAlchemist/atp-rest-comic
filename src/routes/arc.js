/**
 * Created by Andy on 8/25/2017.
 */

import {basicController, respondWith} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import Arc from "../model/arc";
import {o} from 'atp-sugar';
import validator from 'atp-validator';
import {validate} from 'atp-validator';

const permissions = createCrudPermissions('comic', 'arc');
const model = Arc;
const idField = 'arcId';

export default o(basicController.entity.crud({model, permissions, idField})).as(crud => o(crud).merge({
    post: (req, res) => {
        new Arc().nextSortOrder(req.body.parentId).then(sortOrder => {
            req.body.sortOrder = sortOrder;
            crud.post(req, res);
        });
    },
    move: {
        post: (req, res) => {
            //TODO:  Test validation
            console.log("Move endpoint");
            console.log(req.body);
            validator()
                .loggedIn(req)
                .hasPermission(permissions.update, req)
                .required(req.body.action, "Action")
                .required(req.body.targetId, "Target id")
                .required(req.body.sourceId, "Source id")
                .isOneOf(req.body.action, ["into", "after"], "Action")
                .isInteger(req.body.targetId, "Target id")
                .isInteger(req.body.sourceId, "Source id")
                .custom(validate(
                    req.body.targetId !== req.body.sourceId,
                    "Cannot move an arc relative to itself (targetId cannot equal sourceId)",
                    400
                ))
                .then(
                    () => {
                        console.log("Validation passed");
                        const action = req.body.action;
                        const targetId = req.body.targetId;
                        const sourceId = req.body.sourceId;
                        //TODO:  Add validation so that an arc can't be moved into one of its descendants (no loops)
                        new Arc().removeFromParent(sourceId).then(oldSiblings => {
                            o(action).switch({
                                into: () => new Arc().insertInto(targetId, sourceId),
                                after: () => new Arc().insertAfter(targetId, sourceId),
                                default: () => {throw "Invalid move mode " + mode;}
                            }).then(newSiblings => {
                                new Arc()
                                    .select(['id', 'parentId', 'sortOrder'])
                                    .getById(sourceId)
                                    .then(sourceArc => {
                                        const results = oldSiblings.concat(newSiblings, sourceArc);
                                        console.log(results);
                                        respondWith.Success(req, res)(results);
                                    }).catch(respondWith.InternalServerError(req, res));
                            }).catch(respondWith.InternalServerError(req, res));
                        }).catch(respondWith.InternalServerError(req, res));
                    },
                    respondWith.Error(req, res)
                );
        }
    }
}).raw);
