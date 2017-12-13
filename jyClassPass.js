var http = require("http");
var cheerio = require("cheerio");
var querystring = require("querystring");
var host = "0732.hngbjy.com";
var courseBaseURL = "/api/Page/CourseContent";
var nodeReqURL = "/api/CourseProcess/JYProcess";
var refgetPage = "/api/Home/PlayJY";
var playApiURL = "/api/Home/Play";
var webPath = "/api/Page/CourseList";
var noNodePath = "/api/CourseProcess/ScormProcess?m=cmi.core.session_time&v=";
var cookies = "longguid=28e9c7a8-2359-4722-aca9-51af94351b74; tempguid=ceb50b80-1eed-4631-aa3e-1b530fa024ad; .ASPXAUTH=654C408BDFC6A8374E44FB4ED27910625D064C55B90332D91A7DFBC85B5A7F4983FA031CDE470978D32B0E187B9D24E9CC9D1D0CA79228D9BD6A43FD8A23954527DCF91D3109061C1F032C06143F9307E8DB42A1A3932F514C7A7E01409A66D4691127770331A0528C92AF4CA2F1F981EB3DF140D71EF8BEEB3C20E796ADA32DFCA8ECD98F09DF6F603229A4; VnsE=F4AZj6eXHeE=; Rm=me%3DQ0kxNjA3MnxBMTIzNDU2N3x0cnVl; Hm_lvt_327640bfb35d2e4c1add31bb26c51249=1512134379,1512184800,1512726769; Hm_lpvt_327640bfb35d2e4c1add31bb26c51249=1512726811; __RequestVerificationToken_L2FwaQ2=XdubF_lIUSJeGlklNL-bkFZdOZL5HTPI7uCufry41ewhKP7KkBMDoUbJiY3oS3ITMbyO5Q2";
//TODO:用户id暂时写死，后续调用api来查询
var userId = "173311";
function callPlayAction(courseId,position) {
    let body = querystring.stringify({
        'id':courseId
    });
    let option = {
        hostname: host,
        method: "POST",
        path: playApiURL,
        port: 80,
        headers: {
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language':'zh-CN,zh;q=0.9',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Content-Length': Buffer.byteLength(body),
            'Referer': 'http://0732.hngbjy.com/Content/commonPages/Play.html?id=' + courseId,
            'X-Requested-With':'XMLHttpRequest',
            'Cookie': cookies
        }
    };

    let req = http.request(option, res => {
        let ret = '';
        res.on('data', chunk => {
            ret += chunk;
        });
        res.on('end', () => {
            console.log(ret);
            submitCompleteCourseWithoutNode(courseId, position);
        });
    });
    req.write(body);
    req.end();

}
function submitCompleteCourseWithoutNode(courseId,position) {
    // 处理没有课程节点的课程，只需要直接发送完成报文即可。
    let body = querystring.stringify({
        'PortalId': '4',
        'userid':userId,
        'courseid':courseId,
        'position':position
    });
    let option = {
        hostname: host,
        method: "POST",
        path: noNodePath+position,
        port: 80,
        headers: {
            'Accept-Encoding': 'gzip, deflate',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Content-Length': Buffer.byteLength(body),
            'Referer': 'http://0732.hngbjy.com/Content/commonPages/PlayScorm.html?courseid=' + courseId,
            'Cookie': cookies
        }
    };

    let req = http.request(option, res => {
        let ret = '';
        res.on('data', chunk => {
            ret += chunk;
        });
        res.on('end', () => {
            console.log(ret);
        });
    });
    req.write(body);
    req.end();
}

function dealRefPageAndSendCourseComplete(nodeId, courseId) {
    // 由于系统限制，必须要referer引用页，所以需要调用服务取得引用信息
    let body = querystring.stringify({
        'courseId': courseId
    });
    let option = {
        hostname: host,
        method: "POST",
        path: refgetPage,
        port: 80,
        headers: {
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Content-Length': Buffer.byteLength(body),
            'Referer': 'http://0732.hngbjy.com/Content/commonPages/PlayJy.html?courseid=' + courseId,
            'Cookie': cookies
        }
    };

    let req = http.request(option, res => {
        let refUrlData = '';
        res.on('data', chunk => {
            refUrlData += chunk;
        });
        res.on('end',() =>{
            var data = JSON.parse(refUrlData);
            let reg = /gc\/(.*)\/index.html/m;

            var url = reg.exec(data.Data.Url)[1];
            if (url) {
                var refurl = `http://0732.hngbjy.com/lession/gc/${url}/SCO.html?url=0732.hngbjy.com/api/CourseProcess/JYProcess?batchId=2&portalId=4&UserId=${userId}&courseId=${courseId}&mediaurl=http://kc.hngbjy.com/lession/gc/${url.toLowerCase()}/&go=1`;
                console.log(refurl);
                submitDataByNode(nodeId, courseId, refurl);
            }
        })
    });

    req.write(body);
    req.end();
}

function submitDataByNode(nodeId, courseId, refPage) {

    let body = querystring.stringify({
        'id':courseId
    });
    let option = {
        hostname: host,
        method: "POST",
        path: playApiURL,
        port: 80,
        headers: {
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language':'zh-CN,zh;q=0.9',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Content-Length': Buffer.byteLength(body),
            'Referer': 'http://0732.hngbjy.com/Content/commonPages/Play.html?id=' + courseId,
            'X-Requested-With':'XMLHttpRequest',
            'Cookie': cookies
        }
    };

    let req = http.request(option, res => {
        let ret = '';
        res.on('data', chunk => {
            ret += chunk;
        });
        res.on('end', () => {
            // console.log(ret);
            sendCompleteData(nodeId, courseId, refPage);
        });
    });
    req.write(body);
    req.end();
}

function sendCompleteData(nodeId, courseId, refPage) {
    let sysTime = new Date().toLocaleString();

    let data = querystring.stringify({
        'method': 'setParam',
        'lastLocation': '0',
        'SID': nodeId,
        'curtime': sysTime,
        'STime': '269',
        'state': 'C',
        'courseID': courseId,
        'userID': userId
    });

    let option = {
        hostname: host,
        method: "POST",
        path: nodeReqURL,
        port: 80,
        headers: {
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data),
            'Referer': refPage,
            'Cookie': cookies
        }
    };

    var req = http.request(option, res => {
        let retData = '';
        let error = dealErr(res);
        if (error) {
            console.error(error);
            //释放资源
            res.resume();
            return;
        }
        // 接收数据
        res.on('data', (chunk) => {
            retData += chunk;
        });

        // 接收完数据后处理数据
        res.on('end', () => {
            console.log(retData);
        });

    });
    req.write(data);
    req.end();
}

function dealCourseDetail(courseId) {
    // 1.用get方法取得html数据
    // 1.1 准备option
    let courseData = querystring.stringify({
        'Id': courseId,
        'titleNav': '课程详情'
    });

    let option = {
        hostname: host,
        method: "POST",
        path: courseBaseURL,
        port: 80,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Content-Length': Buffer.byteLength(courseData),
            'Cookie': cookies
        }
    };

    const req = http.request(option, res => {
        let courseDetailInfos = '';
        let error = dealErr(res);
        if (error) {
            console.error(error);
            //释放资源
            res.resume();
            return;
        }


        res.setEncoding('UTF-8');
        // 接收数据
        res.on('data', (chunk) => {
            courseDetailInfos += chunk;
        });

        // 接收完数据后处理数据
        res.on('end', () => {
            let courseDetail = JSON.parse(courseDetailInfos).Data;
            //已经完成
            if (courseDetail.CourseModel.BrowseScore == 100) {
                return;
            }
            // 判断是否有课程节点
            // 有节点，走节点提交方法
            if (courseDetail.ListData && courseDetail.ListData.length > 0) {
                for (let i = 0; i < courseDetail.ListData.length; i++) {
                    dealRefPageAndSendCourseComplete(courseDetail.ListData[i].Code, courseId);
                }
            }
            else{
                let timeLength =courseDetail.CourseModel.Duration;
                let regex = /([0-9]*)分([0-9]*)秒/;
                let result = regex.exec(timeLength);
                let min = result?result[1]:"00";
                let sec = result?result[2]:"00";
                regex =/([0-9]*)小时/;
                result = regex.exec(timeLength);
                let hour =result?result[1]:"00";
                if (hour.length<2) {
                    hour = "0" +hour;
                }
                if (min.length<2) {
                    min = "0" +min;
                }
                if (sec.length<2) {
                    sec = "0" +sec;
                }
                let time = hour+":"+min+":"+sec;
                callPlayAction(courseId, time);
            }
        });
    });
    req.write(courseData);
    req.end();
}

function dealErr(res) {
// Exception deal
    const {statusCode} = res;
    let error;
    if (statusCode != 200) {
        error = new Error('请求失败！\n' + `状态码：${statusCode}`)
    }
    return error;
}

function getCourseLink(url) {
    // 1.用get方法取得html数据
    // 1.1 准备option
    let postData = querystring.stringify({
        'page': '1',
        'rows': '20',
        'sort': 'Sort',
        'order': 'desc',
        'title': '',
        'courseType': 'All',
        'channelId': 'null',
        'flag': 'All',
        'titleNav': '课程超市',
        'wordLimt': '35',
    });

    let option = {
        hostname: url,
        method: "POST",
        path: webPath,
        port: 80,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Content-Length': Buffer.byteLength(postData),
            'Referer': 'http://0732.hngbjy.com/Do/Course.html',
            'Accept-Encoding': 'gzip, deflate', /*
            Cookie: cookies*/
        }
    };
    const req = http.request(option, res => {
        let classDataInfos = '';
        let error = dealErr(res);

        if (error) {
            console.error(error);
            //释放资源
            res.resume();
            return;
        }


        res.setEncoding('UTF-8');
        // 接收数据
        res.on('data', (chunk) => {
            classDataInfos += chunk;
        });

        // 接收完数据后处理数据
        res.on('end', () => {
            var dataObj = JSON.parse(classDataInfos).Data;
            console.log(`总共${dataObj.Count}个课程`);
            var courseList = dataObj.ListData;
            for (let i = 0; i < courseList.length; i++) {
                let courseId = courseList[i].Id;
                //查询课程详细信息，需要cookies
                dealCourseDetail(courseId);
            }
        });

    });

    req.on('error', (e) => {
        console.error(`请求遇到问题: ${e.message}`);
    });

    // 写入数据到请求主体
    req.write(postData);
    req.end();
}

// getCourseLink(host);
// dealCourseDetail('3802');
dealCourseDetail('4191');