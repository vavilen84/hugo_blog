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

        var leftSidebar = $('.left-sidebar');
        var rightSidebar = $('.right-sidebar');

        if ((sideWidth > 215) && (scrollTop > 170)) {
            leftSidebar.css('position', 'fixed');
            leftSidebar.css('top', 30);
            leftSidebar.css('left', (sideWidth - 215) / 2);

            rightSidebar.css('position', 'fixed');
            rightSidebar.css('top', 30);
            rightSidebar.css('right', (sideWidth - 215) / 2);
        } else {
            leftSidebar.css('position', 'absolute');
            leftSidebar.css('top', 156);
            leftSidebar.css('left', -245);

            rightSidebar.css('position', 'absolute');
            rightSidebar.css('top', 156);
            rightSidebar.css('right', -245);
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
