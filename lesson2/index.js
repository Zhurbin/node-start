'use strict';

const express = require('express');
const app = express();
const got = require('got');
const url = require('url');
const qs = require('querystring');

app.get('/', function(req, res) {
    const urlObj = url.parse(req.url);
    const query = qs.parse(urlObj.query);

    got('http://' + query.name)
        .then(response => {
            res.send(response.body);
        })
        .catch(error => {
            return error;
        });
});

app.listen(3000);
