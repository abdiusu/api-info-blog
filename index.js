/*
MIT License

Copyright (c) 2021 abdi syahputra harahap

My Website : https://www.maskoding.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var http = require('http');
var unirest = require('unirest');
var random_useragent = require('random-useragent');
const isUrl = require("is-valid-http-url");
var beautify = require("json-beautify");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var parseUrl = require('url-parse');

http.createServer(function (req, res) {
    let dbHost=req.headers["x-forwarded-proto"]+"://"+req.headers.host;
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
              senData["link-author"]=dbHost+"/?profil="+linkAuthorBlog;
            }else{
              linkAuthorBlog="Hidden";
              senData["link-author"]=linkAuthorBlog;
            };
            let idBlog=dbBlog.id["$t"].split("blog-")[1];
            let totalUrlPost=dbBlog["openSearch$totalResults"]["$t"];
            let updatePost=new Date(dbBlog.updated["$t"]).getTime();
            let totalCategory=dbBlog.category;
            senData["title-blog"]=titleBlog;
            senData["name-author-blog"]=nameAuthorBlog;
            senData["description-blog"]=descriptionBlog;
            senData["image-author"]=imgAuthorBlog;
            senData["id-blog"]=Number(idBlog);
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
            senData["total-post"]=Number(totalUrlPost);
            senData["update-post"]=updatePost;
            let fixDataPost=[];
            let startCountPost=150;
            let formatApiPost=dbHost+"/?feeds="+url+"/feeds/posts/default?alt=json&start-index=";
            for(var i=0;i<Number(senData["total-post"]);i++){
              if(i==1){
                fixDataPost.push(formatApiPost+i+"&max-results=150");
              }else if(i==startCountPost){
                startCountPost=startCountPost+150;
                fixDataPost.push(formatApiPost+(i+1)+"&max-results=150");
              };
            };
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
                senData["total-page"]=Number(totalUrlPage);
                senData["update-page"]=updatePage;
                let fixDataPage=[];
                let startCountPage=150;
                let formatApiPage=dbHost+"/?feeds="+url+"/feeds/pages/default?alt=json&start-index=";
                for(var i=0;i<Number(senData["total-page"]);i++){
                  if(i==1){
                    fixDataPage.push(formatApiPage+i+"&max-results=150");
                  }else if(i==startCountPage){
                    startCountPage=startCountPage+150;
                    fixDataPage.push(formatApiPage+(i+1)+"&max-results=150");
                  };
                };
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
                    senData["total-comment"]=Number(totalComment);
                    senData["update-comment"]=updateComment;
                    let fixDataComment=[];
                    let startCountComment=150;
                    let formatApiComment=dbHost+"/?feeds="+url+"/feeds/comments/default?alt=json&start-index=";
                    for(var i=0;i<Number(senData["total-comment"]);i++){
                      if(i==1){
                        fixDataComment.push(formatApiComment+i+"&max-results=150");
                      }else if(i==startCountComment){
                        startCountComment=startCountComment+150;
                        fixDataComment.push(formatApiComment+(i+1)+"&max-results=150");
                      };
                    };
                    senData["feeds"]={
                      "post":fixDataPost,
                      "pages":fixDataPage,
                      "comment":fixDataComment
                    };
                    senData["Other-Blogs-Owned"]=[];
                    if(linkAuthorBlog=="Hidden"){
                      res.end(beautify(senData, null, 2, 100));
                    }else{
                      unirest('GET',linkAuthorBlog)
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
                                "link":linkWeb,
                                "api-info":dbHost+"/?info="+linkWeb
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
    } else if (req.url.split("/?feeds=")[1] == undefined == false && isUrl(req.url.split("/?feeds=")[1]) == true && req.method === "GET") {
      let url=req.url.split("/?feeds=")[1];
      unirest('GET',url)
      .headers({
          'user-agent': random_useragent.getRandom()
      })
      .end(function(data) {
        try{
          let dbData=data.raw_body;
          dbData=JSON.parse(dbData).feed.entry;
          let dbSend=[];
          dbData.forEach(function(a){
            let dbInfo={};
            if(a.author[0]){
              dbInfo["author"]=a.author[0].name["$t"];
              if(a.author[0].uri){
                dbInfo["link-author"]=dbHost+"/?profil="+a.author[0].uri["$t"];
              }else{
                dbInfo["link-author"]="Hidden";
              };
              if(a.author[0]["gd$image"]){
                dbInfo["img-author"]=a.author[0]["gd$image"].src;
              }else{
                dbInfo["img-author"]="none";
              };
            };
            dbInfo["title"]=a.title["$t"];
            dbInfo["category"]=[];
            a.link.forEach(function(b){
              if(b.rel=="alternate"){
                dbInfo["link"]=b.href;
              };
            });
            if(a["media$thumbnail"]){
              dbInfo["thumbnail-content"]=a["media$thumbnail"].url;
            }else{
              dbInfo["thumbnail-content"]="none";
            };
            if(a.content){
              dbInfo["content"]=a.content["$t"];
            }else if(a.summary){
              dbInfo["content"]=a.summary["$t"];
            };
            if(a.category){
              a.category.forEach(function(b){
                dbInfo["category"].push(b.term);
              });
            };
            dbInfo["time-publish"]=new Date(a.published["$t"]).getTime();
            dbInfo["time-update"]=new Date(a.updated["$t"]).getTime();
            if(a.id["$t"].indexOf("post-")>0){
              dbInfo["id"]=Number(a.id["$t"].split("post-")[1]);
            }else if(a.id["$t"].indexOf("page-")>0){
              dbInfo["id"]=Number(a.id["$t"].split("page-")[1]);
            };
            if(a["thr$total"]){
              dbInfo["total-comment"]=Number(a["thr$total"]["$t"]);
            };
            dbSend.push(dbInfo);
          });
          res.end(beautify(dbSend, null, 2, 80));
        }catch(e){
          res.end("error");
        };
      });
    } else if (req.url.split("/?profil=")[1] == undefined == false && isUrl(req.url.split("/?profil=")[1]) == true && req.method === "GET") {
      let url=req.url.split("/?profil=")[1];
      unirest('GET',url)
      .headers({
          'user-agent': random_useragent.getRandom()
      })
      .end(function (data) {
        try{
          let senData={
            "name-author":"-",
            "data-blog":[]
          };
          let dataLink=[];
          const dom = new JSDOM(data.raw_body);
          let dbSc=dom.window.document.querySelectorAll(".sidebar-item");
          dbSc.forEach(function(a){
            let toHref=a.querySelector('a');
            if(toHref==null==false){
              let nameWeb=toHref.innerHTML;
              let linkWeb=toHref.getAttribute("href");
              dataLink.push(linkWeb);
              senData["data-blog"].push({
                "name":nameWeb,
                "link":linkWeb,
                "api-info":dbHost+"/?info="+linkWeb
              });
            };
          });
          senData["name-author"]=dom.window.document.querySelector("h1").innerHTML;
          res.end(beautify(senData, null, 2, 100));
        }catch(e){
          res.end("error");
        };
      });
    }else {
      res.end("error");
    };
}).listen(process.env.PORT);