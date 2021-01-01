$(document).ready(function () {

    var topBtn = document.getElementById("topBtn");
    var downBtn = document.getElementById("downBtn");

    if ($('.wrapper').outerHeight() > window.outerHeight) {
        $(downBtn).show();
    }

    window.onscroll = function () {
        scrollFunction();
    };

    function scrollFunction() {
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

        if (scrollTop > 20) {
            topBtn.style.display = "block";
            downBtn.style.display = "none";
        } else {
            topBtn.style.display = "none";
            downBtn.style.display = "block";
        }

        var sideWidth = (window.innerWidth - 1000) / 2;
        if ((sideWidth > 215) && (scrollTop > 170)) {
            $('.left-sidebar').css('position', 'fixed');
            $('.left-sidebar').css('top', 30);
            $('.left-sidebar').css('left', (sideWidth - 215) / 2);

            $('.right-sidebar').css('position', 'fixed');
            $('.right-sidebar').css('top', 30);
            $('.right-sidebar').css('right', (sideWidth - 215) / 2);
        } else {
            $('.left-sidebar').css('position', 'absolute');
            $('.left-sidebar').css('top', 156);
            $('.left-sidebar').css('left', -245);

            $('.right-sidebar').css('position', 'absolute');
            $('.right-sidebar').css('top', 156);
            $('.right-sidebar').css('right', -245);
        }
    }
});

var scrollingElement = (document.documentElement || document.body);

function topFunction() {
    $(scrollingElement).animate({
        scrollTop: 0
    }, 500);

}

function downFunction() {
    $(scrollingElement).animate({
        scrollTop: document.body.scrollHeight
    }, 500);
}
