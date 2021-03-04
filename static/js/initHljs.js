$(document).ready(function () {
    var pl = $('#pl').text();
    initHljs(pl);
});

function initHljs(pl) {
    console.log(hljs);
    hljs.configure({tabReplace: '    ', languages: [pl]});
    hljs.initHighlightingOnLoad();
}
