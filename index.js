var http = require('http');
var unirest = require('unirest');
var random_useragent = require('random-useragent');
const isUrl = require("is-valid-http-url");
var beautify = require("json-beautify");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var parseUrl = require('url-parse');

http.createServer(function (req, res) {
    res.writeHead(200, {
        "Access-Control-Allow-Origin": "https://www.maskoding.com",
        "content-type": "text/plain"
    });
    if (req.url.split("/?info=")[1] == undefined == false && isUrl(req.url.split("/?info=")[1]) == true && req.method === "GET") {
        let url=req.url.split("/?info=")[1];
        url=parseUrl(url).origin;
        unirest('GET',url+"/feeds/posts/default?alt=json&start-index=1&max-results=1")
        .headers({
            'user-agent': random_useragent.getRandom()
        })
        .end(function (resku) {
          try{
            let dbBlog=resku.raw_body;
            let senData={};
            dbBlog=JSON.parse(dbBlog);
            dbBlog=dbBlog.feed;
            let titleBlog=dbBlog.title["$t"];
            let nameAuthorBlog=dbBlog.author[0].name["$t"];
            let descriptionBlog=dbBlog.subtitle["$t"];
            let imgAuthorBlog=dbBlog.author[0]["gd$image"].src;
            let linkAuthorBlog=dbBlog.author[0].uri;
            if(linkAuthorBlog){
              linkAuthorBlog=dbBlog.author[0].uri["$t"];
            }else{
              linkAuthorBlog="Hidden";
            };
            let idBlog=dbBlog.id["$t"].split("blog-")[1];
            let totalUrlPost=dbBlog["openSearch$totalResults"]["$t"];
            let updatePost=new Date(dbBlog.updated["$t"]).getTime();
            let totalCategory=dbBlog.category;
            senData["title-blog"]=titleBlog;
            senData["name-author-blog"]=nameAuthorBlog;
            senData["description-blog"]=descriptionBlog;
            senData["image-author"]=imgAuthorBlog;
            senData["link-author"]=linkAuthorBlog;
            senData["id-blog"]=idBlog;
            if(totalCategory){
              senData["category"]={
                "total":totalCategory.length,
                "data":[]
              };
              totalCategory.forEach(function(a){
                senData["category"].data.push(a.term);
              });
            }else{
              senData["category"]={
                "total":"0",
                "data":[]
              };
            };
            senData["total-post"]=totalUrlPost;
            senData["update-post"]=updatePost;
            unirest('GET',url+"/feeds/pages/default?alt=json&start-index=1&max-results=1")
            .headers({
                'user-agent': random_useragent.getRandom()
            })
            .end(function (resku2) {
              try{
                let dbBlog2=resku2.raw_body;
                dbBlog2=JSON.parse(dbBlog2);
                dbBlog2=dbBlog2.feed;
                let totalUrlPage=dbBlog2["openSearch$totalResults"]["$t"];
                let updatePage=new Date(dbBlog2.updated["$t"]).getTime();
                senData["total-page"]=totalUrlPage;
                senData["update-page"]=updatePage;
                unirest('GET',url+"/feeds/comments/default?alt=json&start-index=1&max-results=1")
                .headers({
                    'user-agent': random_useragent.getRandom()
                })
                .end(function (resku3) {
                  try{
                    let dbBlog3=resku3.raw_body;
                    dbBlog3=JSON.parse(dbBlog3);
                    dbBlog3=dbBlog3.feed;
                    let totalComment=dbBlog3["openSearch$totalResults"]["$t"];
                    let updateComment=new Date(dbBlog3.updated["$t"]).getTime();
                    senData["total-comment"]=totalComment;
                    senData["update-comment"]=updateComment;
                    senData["Other-Blogs-Owned"]=[];
                    if(senData["link-author"]=="Hidden"){
                      res.end(beautify(senData, null, 2, 100));
                    }else{
                      unirest('GET',senData["link-author"])
                      .headers({
                          'user-agent': random_useragent.getRandom()
                      })
                      .end(function (resku4) {
                        const dom = new JSDOM(resku4.raw_body);
                        let dbSc=dom.window.document.querySelectorAll(".sidebar-item");
                        dbSc.forEach(function(a){
                          let toHref=a.querySelector('a');
                          if(toHref==null==false){
                            let nameWeb=toHref.innerHTML;
                            let linkWeb=toHref.getAttribute("href");
                            if(parseUrl(linkWeb).hostname==parseUrl(url).hostname==false){
                              senData["Other-Blogs-Owned"].push({
                                "name":nameWeb,
                                "link":linkWeb
                              });
                            };
                          };
                        });
                        res.end(beautify(senData, null, 2, 100));
                      });
                    };
                  }catch(e){
                    res.end("error");
                  };
                });
              }catch(e){
                res.end("error");
              };
            });
          }catch(e){
            res.end("error");
          };
        });
    } else {
        res.end("error")
    };
}).listen(process.env.PORT);