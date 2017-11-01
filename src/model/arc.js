/**
 * Created by Andrea on 8/27/2017.
 */

import {Entity} from 'atp-active-record';
import config from 'atp-config';
import {o} from 'atp-sugar';

const tableName = 'atpcomic_arcs';

export default class Arc extends Entity
{
    constructor() {
        super('comic', tableName);
    }

    nextSortOrder(parentId) {
        return new Promise((resolve, reject) => {
            this.select("MAX(sortOrder) + 1 as nextSortOrder")
                .groupBy("parentId")
                .where({parentId})
                .limit(1)
                .list(false)
                .then(result => {
                    resolve(result.length > 0 ? result[0].nextSortOrder : 0);
                })
                .catch(reject);
        });
    }

    removeFromParent(id) {
        return new Promise((resolve, reject) => {
            //Get the existing arc to get its parentId
            this.getById(id)
                .then(arc => {
                    const parentId = arc.parentId;
                    //Remove the arc from its parent
                    this.where({id}).limit(1).update({parentId: null})
                        .then(() => {
                            //Decrement sortOrder for all higher siblings
                            this.query(
                                "update " + tableName +
                                " set sortOrder = sortOrder - 1" +
                                " where parentId=" + parentId +
                                " and sortOrder>" + arc.sortOrder +
                                " and id<>" + id
                            ).then(() => {
                                this.getSiblings(parentId, id)
                                    .then(siblings => {
                                        resolve(siblings);
                                    }).catch(reject);
                            }).catch(reject);
                        }).catch(reject);
                }).catch(reject);
        });
    }

    getSiblings(parentId, id) {
        return this.select(['id', 'sortOrder'])
            .where({parentId}).where("id <> " + id)
            .list()
    }

    getParents(id, level = 10) {
        return new Promise((resolve, reject) => {
            const sql = "select "
                + [...Array(level+1).keys()].map(i => "p" + i + ".id as parent" + i).join(',')
                + " from " + tableName + " p0 "
                + [...Array(level).keys()].map(i =>
                    "left join " + tableName + " p" + (i+1) + " on p" + (i+1) + ".id=p" + i + ".parentId"
                ).join(" ")
                + " where p0.id=" + id;
            console.log(sql);
            this.query(sql).then(
                results => {
                    const parents = o(results[0]).filter(v => v).values();
                    console.log(parents);
                    resolve(parents);
                },
                reject
            );
        });
    }

    insertInto(parentId, id) {
        return new Promise((resolve, reject) => {
            this.where({id})
                .limit(1)
                .update({parentId, sortOrder: 0})
                .then(() => {
                    this.query(
                        "update " + tableName +
                        " set sortOrder = sortOrder + 1" +
                        " where parentId=" + parentId +
                        " and id<>" + id
                    ).then(() => {
                        this.getSiblings(parentId, id)
                            .then(siblings => {
                                resolve(siblings);
                            }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
        });
    }

    insertAfter(targetId, id) {
        return new Promise((resolve, reject) => {
            this.getById(targetId)
                .then(targetArc => {
                    const parentId = targetArc.parentId;
                    const sortOrder = targetArc.sortOrder + 1;
                    this.query(
                        "update " + tableName +
                        " set sortOrder = sortOrder + 1" +
                        " where parentId=" + parentId +
                        " and sortOrder>=" + sortOrder +
                        " and id<>" + id
                    ).then(() => {
                        this.where({id}).limit(1).update({parentId, sortOrder})
                            .then(() => {
                                this.getSiblings(parentId, id)
                                    .then(resolve).catch(reject);
                            }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
        })
    }
}
