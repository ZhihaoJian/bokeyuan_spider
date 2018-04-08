let { URL, IPS_LIST, SERVER_BASE_URL, USERNAME, PASSWORD } = require('../const/_variables');
const { getModel } = require('../db/db');
const color = require('colors');
const POST = getModel('post');
const opn = require('opn');
const rp = require('request-promise');
const fs = require('fs');
const url = require('url');

// 1、加载页面指定页面
async function toPage(page, url, timeout) {
    try {
        await delay(timeout);
        await page.goto(url);
        console.log(`PAGE LOG`.blue + ` Opening Chrome's new tab and going to ${url}`);
        return url;
    } catch (error) {
        console.log(error);
    }
}

//延时爬取
function delay(timeout = 1300) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    })

}

// 2、解析页面超链接(type:elementHandle)
async function parseElementHandle(page, url) {
    try {
        const linksHandle = await page.$$('.am-list-item-hd > a');
        console.log(`PAGE LOG`.blue + ` Getting Links from ${url}`);
        return linksHandle;
    } catch (error) {
        console.log(error);
    }
}

//获取博文列表地址
function getNextUrl(pageNum = 0) {
    return URL + `&page=${pageNum}`
}

// 3、调用getPostUrls方法获取超链接
async function getPostUrls(links) {
    const urlArray = [];
    for (const link of links) {
        try {
            const property = await link.getProperty('href');
            const url = await property.jsonValue();
            urlArray.push(url);
        } catch (error) {
            console.log(error);
        }
    }
    return urlArray;
}

/**  
 * 保存文章超链接到数据库
 * @param {*} docs 
 */
function saveToDB(docs) {
    let isAllSaved = true;
    docs.forEach(doc => {
        doc.forEach(href => {
            POST.findOne({ link: href }, (err, doc) => {
                if (err) {
                    console.log(`DB LOG`.red + ' Some error happened while saving to Mongodb.' + `\nReason:${err}`);
                }
                if (!doc) {
                    POST.create({ link: href }, (err) => {
                        if (err) {
                            isAllSaved = false;
                            console.log(`DB LOG`.red + ' Some error happened while saving to Mongodb.' + `\nReason:${err}`);
                        }
                    })
                }
            })
        });
    });
    isAllSaved ? console.log('DB LOG'.green + ' All links of page has been saved successfully!') : console.log('DB LOG'.red + ' MongoDB has some error.');;
}


/**
 * 根据URL将post文内容保存
 * @param {*} param0 
 */
function savePost({ post, link }) {
    post = getRidOfHTMLTag(post);
    POST.findOne({ link }, (err, doc) => {
        if (err) {
            console.log(`DB LOG`.red + ` Url ${link} saved error`);
        }
        if (doc) {
            doc.set({ post, link });
            doc.save((err, updatedDoc) => {
                if (err) {
                    console.log(`DB LOG`.red + ` Update ${link} occur an error`);
                }
                console.log(`DB LOG`.green + ` Post ${link} has been save.`);
            })
        } else {
            POST.create({ link, post }, (err, doc) => {
                if (err) {
                    console.log(`DB LOG`.red + ` Update ${link} occur an error`);
                }
                console.log(`DB LOG`.green + ` Post ${link} has been save.`);
            })
        }
    })
}

/**
 * 去除html标签，特殊字符，转义字符
 * @param {*} post 正文内容
 */
function getRidOfHTMLTag(post) {
    const regex = /(<([^>]+)>)/ig,
        escRegex = /[\'\"\\\/\b\f\n\r\t]/ig,
        spcRegex = /[&\|\\\*^%$#@\-]/g;
    post = post.replace(regex, '');
    post = post.replace(escRegex, '');
    post = post.replace(spcRegex, '');
    return post;
}

/**
 * 读取分词结果
 */
function readWordsFromFile() {
    return fs.readFileSync('word.txt', { encoding: 'utf-8' });
}
/**
 * 获取IP代理列表
 */
function getIPs() {
    return rp(IPS_LIST)
        .then(res => {
            if (JSON.parse(res).code === '3006') {
                throw new Error('代理IP数量不足')
            }
            const ips = (JSON.parse(res)).msg;
            const ipTable = ips.map((ipObj) => {
                return `${ipObj.ip}:${ipObj.port}`
            });
            return ipTable;
        })
        .catch(e => {
            console.log('ERROR'.red + ` ${e}`);
        })
}

/**
 * 
 * @param {string} REQUEST_URL 待爬取的URL
 * @param {string} proxy 代理IP
 * @param {fn} success 成功回调函数
 * @param {fn} fail 失败回调函数
 */
function rq(REQUEST_URL, proxy, callback) {
    return rp({ 'url': url.parse(REQUEST_URL), 'proxy': `http://${proxy}` })
        .then(res => callback(res))
}



module.exports = {
    getPostUrls,
    toPage,
    delay,
    getIPs,
    rq,
    getNextUrl,
    savePost,
    saveToDB,
    readWordsFromFile,
    crawPageContent,
    parseElementHandle,
}