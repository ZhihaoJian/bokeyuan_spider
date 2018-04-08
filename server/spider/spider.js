const puppeteer = require('puppeteer-cn');
let { URL } = require('../const/_variables');
const colors = require('colors');
const {
    getPostUrls,
    saveToDB,
    toPage,
    writeToFileSys,
    parseElementHandle,
    crawPageContent,
    savePost,
    getNextUrl } = require('./util');

/**
 * 使用PUPPETEER 爬取博客园列表页所有POST文链接
 * 
 */
(async () => {
    let broswer = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: false,
    }),
        page = await broswer.newPage(),
        currentPage = 1,
        totalPages = 0,
        linksHandle,
        url = '',
        postUrls = [];

    console.log('PAGE LOG: Starting task.'.blue);
    page.setDefaultNavigationTimeout();

    toPage(page, URL).then(async (url) => {
        console.log('PAGE LOG'.blue + ' Page has been loaded');

        //分页数量
        totalPages = await page.$eval('.last', el => Number.parseInt(el.textContent));
        // totalPages = 100;
        console.log(`PAGE LOG`.blue + ` site:${URL} has ${totalPages} pages`);

        //抓取post文超链接
        for (let i = 1; i <= totalPages; i++) {
            url = getNextUrl(i);
            await toPage(page, url, 1500);
            let links = await parseElementHandle(page, url);
            let result = await getPostUrls(links);
            postUrls.push(result);
        }

        saveToDB(postUrls);

        //根据post文链接抓取post文内容
        // for (let i = 0; i < postUrls.length; i++) {
        //     for (let j = 0; j < postUrls[i].length; j++) {
        //         const postUrl = postUrls[i][j];
        //         await toPage(page, postUrl, 10000);
        //         const post = await crawPageContent(page, postUrl);
        //         savePost({ post, link: postUrl })
        //     }
        // }

        console.log('PAGE LOG : All tasks have been finished.'.green);
        writeToFileSys();
        await broswer.close();
    });
})()