/**
 * Created by Andy on 8/25/2017.
 */

import {basicController, respondWith} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import Arc from "../../model/arc";
import Page from "../../model/page";
import Commentary from "../../model/commentary";
import {File} from "atp-rest-media";
import {User} from 'atp-rest-uac';
import validator from 'atp-validator';
import {_, prop, equal, notEqual, sortBy, createIndex, first, last, flatten, partitionOn} from 'atp-pointfree';
import marked from "marked";

const arcPermissions = createCrudPermissions('comic', 'arc');
const pagePermissions = createCrudPermissions('comic', 'page');

export default {
    get: basicController.rest({
        getValidator: req => validator()
            .hasPermission(pagePermissions.view, req)
            .hasPermission(arcPermissions.view, req),
        loadResource: req => new Promise((resolve, reject) => {
            Promise.all([
                new Arc().select(['id', 'parentId', 'url', 'sortOrder']).list(),
                new Page().select(['id', 'arcId', 'sortOrder', 'imageId']).where({enabled: true}).list()
            ]).then(([arcs, pages]) => {
                //Create indexes for the arcs and pages
                const getArc = createIndex(prop('id'))(arcs);
                const getPage = createIndex(prop('id'))(pages);

                //Get all of the pages for this arc, in order, and including pages in sub-arcs
                const allPages = arcId =>
                    (getArc(arcId).pages || []).concat(
                        flatten(getArc(arcId).subArcs.map(_(allPages, prop('id'))))
                    );

                //Get the first page in this arc or its sub-arcs
                const getFirstArcPage = arcId =>
                    getArc(arcId).pages.length > 0   ? first(getArc(arcId).pages).id                    :
                    getArc(arcId).subArcs.length > 0 ? getFirstArcPage(first(getArc(arcId).subArcs).id) :
                                                       null;

                //Get the last page in this arc or its sub-arcs
                const getLastArcPage = arcId =>
                    getArc(arcId).subArcs.length > 0 ? getLastArcPage(last(getArc(arcId).subArcs).id) :
                    getArc(arcId).pages.length > 0   ? last(getArc(arcId).pages).id                   :
                                                       null;

                //Get the root arc
                const rootArc = first(arcs.filter(_(equal(null), prop('parentId'))));

                //Partition the arcs and pages by their parents
                const arcsByParent = partitionOn('parentId')(arcs);
                const pagesByArc = partitionOn('arcId')(pages);

                //Assign sub-arcs and pages to the appropriate arcs
                arcs.forEach(arc => {
                    arc.subArcs = arcsByParent(arc.id).sort(sortBy('sortOrder'));
                    arc.pages = pagesByArc(arc.id).sort(sortBy('sortOrder'));
                });

                //Get the list of all pages for the root arc
                rootArc.allPages = allPages(rootArc.id);

                //Calculate related arcs and pages for this page
                const pageId = req.params.pageId;
                const arcId = getPage(pageId).arcId;
                const page = getPage(pageId);
                const index = rootArc.allPages.indexOf(page);
                const firstPageId = first(rootArc.allPages).id;
                const firstArcPageId = getFirstArcPage(arcId);
                const prevPageId = index > 0 ? rootArc.allPages[index-1].id : null;
                const nextPageId = index < rootArc.allPages.length - 1 ? rootArc.allPages[index+1].id : null;
                const lastArcPageId = getLastArcPage(arcId);
                const lastPageId = last(rootArc.allPages).id;
                const prevArcId = (last(rootArc.allPages.slice(0, index).filter(_(notEqual(arcId), prop('arcId')))) || {arcId: null}).arcId;
                const nextArcId = (first(rootArc.allPages.slice(index+1).filter(_(notEqual(arcId), prop('arcId')))) || {arcId: null}).arcId;;
                const prevArcLastPageId = prevArcId ? getLastArcPage(prevArcId) : null;
                const nextArcFirstPageId = nextArcId ? getFirstArcPage(nextArcId) : null;

                const loadPage = id => id ? new Page().select(['id', 'name', 'url']).getById(id) : null;

                Promise.all(
                    [
                        new Page().getById(pageId),
                        new Commentary().where({pageId}).list(),
                        new File().getById(page.imageId),
                        new User().select(['id', 'userName']).list(),
                    ].concat(
                        [firstPageId, firstArcPageId, prevPageId, nextPageId, lastArcPageId, lastPageId, prevArcLastPageId, nextArcFirstPageId].map(loadPage)
                    )
                ).then(([
                    thisPage, commentary, image, users,
                    firstPage, firstArcPage, prevPage, nextPage, lastArcPage, lastPage, prevArcLastPage, nextArcFirstPage
                ]) => {
                    const getUser = createIndex(prop('id'))(users);
                    thisPage.transcriptHtml = marked(thisPage.transcript || "");
                    commentary.forEach(comment => {
                        comment.html = marked(comment.text || "");
                        comment.user = getUser(comment.userId);
                    });
                    resolve(Object.assign(
                        {}, thisPage,
                        {
                            arc: {url: getArc(arcId).url},
                            pageNumber: index+1,
                            image, commentary, firstPage, firstArcPage, prevPage, nextPage, lastArcPage, lastPage, prevArcLastPage, nextArcFirstPage}
                    ));
                });
            });
        })
    })
};
