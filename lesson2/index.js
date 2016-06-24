'use strict';

const express = require('express');
const app = express();
const needle = require('needle');
const cheerio = require('cheerio');
const async = require('async');
const urlLib = require('url');
const qs = require('querystring');
const fs = require('fs');
const config = require('./config.js');

app.get('/', function(req, response) {
    const urlObj = urlLib.parse(req.url);
    const query = qs.parse(urlObj.query);
    const queryUrlObj = urlLib.parse('http://' + query.name);
    const URL = queryUrlObj.href;
    const deep = config.deep; // глубина просмотра
    const selector = query.selector;

    let results = [];
    let level = 1;

    let q = async.queue(function(url, callback) {
        needle.get(url, function(err, res) {
            if (err) {
                throw err;
            }

            const $ = cheerio.load(res.body);
            const links = $('a:not([href^="mailto:"])');
            let content = [];

            $(selector).each(function(i, text) {
                content.push($(text).text());
            });

            results.push({
                source: url,
                content: content.length > 0 ? content : 'Нет запрашиваемых блоков'
            });


            if(level < deep) {
                $(links).each(function(i, link) {
                    let href = $(link).attr('href');
                    if (typeof href == 'string') {
                        q.push(urlLib.resolve(URL, href));
                    }
                });
            }
            level++;

            callback();
        });
    }, 10);

    q.drain = function() {
        fs.writeFileSync('./data.json', JSON.stringify(results, null, 4));
        response.send(results);
    };

    q.push(URL);
});

app.listen(3001);
