var https = require("https");
var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");
var baseURL = "https://www.crackhex.com/";
var url = "https://www.crackhex.com/forums/software-updates.4/";
var pageNum = "300";
var privPage = 1;

function saveListInfo(data) {
/*    if (privPage <= pageNum) {
        return;
    }
    fs.unlink('./data/softList.txt', err => {
        if (err) {
            console.error(err);
        }
    });*/

    fs.appendFile('./data/softList.txt', data, 'UTF-8', err => {
        if (err) {
            console.error(err);
        }
    });
}

function dealPageInfo(url) {
    // 用get取得数据
    https.get(url, function (res) {
        // Exception deal
        const {statusCode} = res;
        let error;
        let html = '';
        if (statusCode != 200) {
            error = new Error('请求失败！\n' + `状态码：${statusCode}`)
        }

        if (error) {
            console.error(error);
            //释放资源
            res.resume();
            return;
        }

        res.setEncoding("UTF-8");
        // 接收数据
        res.on('data', (chunk) => {
            html += chunk;
        });

        // 接收完数据后处理数据
        res.on('end', () => {
            var fileContent = '';
            var $ = cheerio.load(html);
            //取得本页面的列表数据
            var listInfos = $(".discussionListItems a.PreviewTooltip");
            for (let i = 0; i < listInfos.length; i++) {
                var softName = listInfos[i].children[0].data.trim();
                var softurl = baseURL + listInfos[i].attribs.href;
                console.log(`第${privPage}页 软件名：${softName}\t\t\t\t链接地址：${softurl}\r\n`);
                fileContent += `软件名：${softName}\t\t\t\t链接地址：${softurl}\r\n`;
            }

            var hasNext = $("a:contains('Next >')");
            privPage++;
            if (hasNext && hasNext.length > 0 && pageNum >= privPage) {
                url = baseURL + `forums/software-updates.4/page-${privPage}`;
                dealPageInfo(url);
            }

            //写入本地文件
            saveListInfo(fileContent);
        })

    })
}

function doDataDownload(url) {
    // 1、删除老数据
    fs.unlink('./data/softList.txt', err => {
        if (err) {
            console.error(err);
        }
    });
    // 2、处理当前页面的url
    dealPageInfo(url);
}

doDataDownload(url);