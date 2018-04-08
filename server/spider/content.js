const { getModel } = require('../db/db');
const { savePost, delay } = require('./util');
const POST = getModel('post');
const colors = require('colors');
const cheerio = require('cheerio');
const { getIPs, rq } = require('./util');


/**
 * 根据post链接，爬取post文内容
 */
(() => {

    let totalPages = 0, //总页数
        postLinks = [], //文章链接
        proxyIndex = 0,
        currentPage = 0;

    //获取尚未爬取到内容的链接
    POST.find({ post: '' }, async (err, docs) => {
        if (err) {
            console.log('DB LOG'.red + ' Error while saving post content to mongodb');
        }
        docs = docs.map(v => v.link);
        postLen = docs.length;

        //根据post文链接抓取post文内容
        getIPs().then(async ipTable => {
            for (let i = 0; i < postLen; i++) {
                let postUrl = docs[i];
                proxyIndex < ipTable.length ? proxyIndex : proxyIndex = 0;
                rq(postUrl, ipTable[proxyIndex++], (body) => parseBody(body, postUrl))
                    .catch(async e => {
                        console.log('LOG'.red + ': Request ' + postUrl + ' failed. Retrying...');
                        ipTable.splice(proxyIndex, 1);
                        await delay(3000);
                        getIPs().then(ips => ipTable = ipTable.concat(ips));
                        await rq(postUrl, ipTable[++proxyIndex], (body) => parseBody(body, postUrl));
                    })
            }
        })
    });


    function parseBody(body, postUrl) {
        if (body) {
            const $ = cheerio.load(body, { decodeEntities: false });
            let post = $('#post_detail').html();
            savePost({
                post, link: postUrl
            })

        }
    }

})()
