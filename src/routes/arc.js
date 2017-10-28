/**
 * Created by Andy on 8/25/2017.
 */

import {basicController} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import Arc from "../model/arc";
import {o} from 'atp-sugar';
import {respondWith} from 'atp-rest';

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
                            respondWith.Success(req, res)(oldSiblings.concat(newSiblings, sourceArc))
                        });
                });
            })
        }
    }
}).raw);
