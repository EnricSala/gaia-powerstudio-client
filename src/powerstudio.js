const axios = require('axios');
const rx = require('rxjs/Rx');
const xml2js = require('xml2js');

const config = require('./configuration.json');

const BASE_URL = config.powerstudio.baseUrl;
const VALUES_PATH = config.powerstudio.valuesPath;
const QUERY_TIMEOUT = config.powerstudio.timeout;
const BATCH_SIZE = config.powerstudio.batchSize;

const http = axios.create({
    baseURL: BASE_URL,
    timeout: QUERY_TIMEOUT,
    headers: {}
});

function query(ids) {
    return rx.Observable.from(ids)
        .windowCount(BATCH_SIZE)
        .flatMap(window => window.toArray())
        .map(batch => buildQuery(batch))
        .flatMap(query => runQuery(query))
        .flatMap(batch => batch)
        .map(point => format(point))
        .toArray()
        .toPromise();
}

function runQuery(query) {
    return http.get(query)
        .then(res => res.data)
        .then(data => parseXml(data))
        .then(data => data.values.variable);
}

function buildQuery(ids) {
    return `${VALUES_PATH}?var=${ids.join('&var=')}`;
}

function parseXml(str) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(str, (err, result) => {
            if (err)
                reject(err);
            else
                resolve(result);
        });
    });
}

function format(point) {
    return {
        id: point.id.shift(),
        value: point.value.shift()
    };
}

module.exports = { query };
