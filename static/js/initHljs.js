document.addEventListener("DOMContentLoaded", function(event) {
    var pl = document.getElementById('pl').textContent;
    hljs.configure({tabReplace: '    ', languages: [pl]});
    hljs.initHighlightingOnLoad();
});



