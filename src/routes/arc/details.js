/**
 * Created by Andy on 8/25/2017.
 */

import {basicController, respondWith} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import Arc from "../../model/arc";
import Page from "../../model/page";
import {File} from "atp-rest-media";
import {User} from 'atp-rest-uac';
import validator from 'atp-validator';
import {prop, createIndex, flatten, partitionOn} from 'atp-pointfree';
import marked from "marked";
import Promise from 'bluebird';

const arcPermissions = createCrudPermissions('comic', 'arc');
const pagePermissions = createCrudPermissions('comic', 'page');

export default {
    get: basicController.rest({
        getValidator: req => validator()
            .hasPermission(pagePermissions.view, req)
            .hasPermission(arcPermissions.view, req),
        loadResource: req => new Promise((resolve, reject) => {
            const arcId = req.params.arcId;
            Promise.all([
                new Arc().getById(arcId),
                new Arc().where({parentId: arcId}).orderBy('sortOrder ASC').list(),
                new Arc().select(['id', 'parentId']).list(),
                new Page().where({arcId, enabled: true}).orderBy('sortOrder ASC').list(),
            ]).then(([arc, subArcs, arcHierarchy, pages]) => {
                //Create indexes for the arcs
                const getArc = createIndex(prop('id'))(arcHierarchy);

                //Get the list of parent ids
                let parentIds = [arcId];
                let parentId = arc.parentId;
                while(parentId) {
                    parentIds.push(parentId);
                    parentId = getArc(parentId).parentId;
                }
                parentIds.reverse();

                //Get the media ids of the arcs and pages
                const mediaIds = flatten([
                    arc.bannerFileId,
                    subArcs.map(prop('thumbnailFileId')),
                    pages.map(prop('imageId'))
                ]);

                Promise.all(
                    [
                        new File().where({id: mediaIds}).list(),
                        new Arc().select(['name', 'url']).where({id: parentIds}).list(),
                    ]
                ).then(([files, parents]) => {
                    const getFile = createIndex(prop('id'))(files);

                    arc.banner = arc.bannerFileId ? getFile(arc.bannerFileId) : null;
                    arc.summaryHtml = marked(arc.summary || "");
                    subArcs.forEach(subArc => {
                        subArc.thumbnail = subArc.thumbnailFileId ? getFile(subArc.thumbnailFileId) : null;
                        subArc.summaryHtml = marked(subArc.summary || "");
                    });
                    pages.forEach(page => {
                        page.image = page.imageId ? getFile(page.imageId) : null;
                    })

                    arc.parents = parents;
                    arc.subArcs = subArcs;
                    arc.pages = pages;

                    resolve(arc);
                });
            }).catch(reject);
        })
    })
};
