const { exec } = require('child_process');
const Jieba = require('node-jieba');
const { SERVER_BASE_URL } = require('../const/_variables');
const { getModel } = require('../db/db');
const POST = getModel('post');
const fs = require('fs');
const opn = require('opn');
const analyzer = Jieba();
const wordMap = new Map();

//分词完成打开浏览器展示结果
function openBrowser() {
    opn(`${SERVER_BASE_URL}`, { app: 'chrome' });
}

//分词结果，写入文件系统
function writeToFileSys() {
    fs.writeFile('./word.txt', JSON.stringify([...wordMap]), (err) => {
        if (err) {
            console.log('LOG'.red + ' Saving data to file system got some error');
        }
        console.log('LOG Saving data to file system success!'.green);
        openBrowser();
    })
}

//jieba分词
function jieba(post) {
    return new Promise(resolve => {
        analyzer.tags(post, {
            top: 20,
            withWeight: false,
            textRank: false,
            allowPOS: ['ns', 'n', 'vn', 'v']
        }, (err, results) => {
            if (err) {
                console.log(err);
            }
            if (results) {
                results.forEach(word => {
                    if (wordMap.has(word)) {
                        let count = wordMap.get(word);
                        wordMap.set(word, ++count);
                    } else {
                        wordMap.set(word, 0);
                    }
                })
            }
            resolve(wordMap);
        })
    })

}

/**
 * 分词，以txt形式保存到文件系统
 */
(() => {
    const jiebaResult = [];
    POST.find({}, async (err, docs) => {
        if (err) {
            throw new Error(err)
        }
        docs.forEach((v) => {
            jiebaResult.push(jieba(v.post));
        });
        await Promise.all(jiebaResult).then(() => {
            writeToFileSys();
        })
        console.log('end');
    })
})()
