
import Page from "../model/page";
import {File} from "atp-rest-media";
import {merge} from 'atp-pointfree';

const feed = {
    title: process.env.COMIC_RSS_TITLE,
    url: process.env.COMIC_RSS_RUL_,
    ttl: process.env.COMIC_RSS_TTL,
    pageUrl: url => `${process.env.COMIC_PAGE_URL}/${url}`
};

export default {
    get: (req, res) => {
        const filters = {
            perPage: 10,
            sort: "postDate DESC"
        };
        new Page().filter(filters).list().then(resultsRaw => Promise.all(
            resultsRaw.map(page => new File()
                .getById(page.imageId)
                .then(image => merge({image}, page))
            ))
        )
        .then(results => {
            res.setHeader('Content-Type', 'text/xml');
            res.status(200);
            res.send(`<?xml version="1.0" encoding="UTF-8" ?>
                <rss version="2.0">
                    <channel>
                        <title>${feed.title} RSS Feed</title>
                        <description></description>
                        <link>${feed.url}</link>
                        <lastBuildDate>${new Date()}</lastBuildDate>
                        <pubDate>${new Date()}</pubDate>
                        <ttl>${feed.ttl}</ttl>
                        ${results.map(item => `
                            <item>
                                <title>${feed.title}: ${item.name}</title>
                                <description>&lt;img src="https://${process.env.MEDIA_AWS_STATIC_HOST}/${item.image.s3Prefix ? `${item.image.s3Prefix} - ` : ''}${item.image.fileName} - 512x512.${item.image.fileExtension}" /&gt;</description>
                                <link>${feed.pageUrl(item.url)}</link>
                                <pubDate>${item.postDate}</pubDate>
                            </item>
                        `).join("")}
                    </channel>
                </rss>
            `);
        });
    }
};
