const algoliasearch = require("algoliasearch");
const fetch = require("node-fetch");
require('dotenv').config({path:process.cwd()+'/updateIdx/.env'});

function indexData(data) {
    data = prepareData(data);
    const client = algoliasearch(process.env.APP_ID, process.env.ADMIN_API_KEY);
    const index = client.initIndex(process.env.IDX_NAME + process.env.LANG);
    index
        .replaceAllObjects(data, {autoGenerateObjectIDIfNotExist:true})
        .catch(err => {
            console.log(err);
        });
}

function prepareData(data) {
    let result = [];
    for (let i in data) {
        if (data[i].content === "" || data[i].title === "") {
            continue;
        }
        data[i].tags = data[i].tags.join();
        data[i].content = data[i].content.replace(/\s+/g, ' ').trim();
        result.push(data[i]);
    }
    return result;
}

let langUrlPrefix = process.env.LANG === 'en' ? '/' : '/ru/';
let url = process.env.BASE_URL + langUrlPrefix + 'index.json';

fetch(url)
    .then(res => res.json()) // expecting a json response
    .then(json => indexData(json));
