$(document).ready(function(){
    var topBtn = document.getElementById("topBtn");
    var downBtn = document.getElementById("downBtn");
    window.onscroll = function () {
        scrollFunction();
    };
    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            topBtn.style.display = "block";
            downBtn.style.display = "none";
        } else {
            topBtn.style.display = "none";
            downBtn.style.display = "block";
        }
    }
});

var scrollingElement = (document.documentElement || document.body);

function topFunction () {
    $(scrollingElement).animate({
        scrollTop: 0
    }, 500);

}
function downFunction () {
    $(scrollingElement).animate({
        scrollTop: document.body.scrollHeight
    }, 500);
}
