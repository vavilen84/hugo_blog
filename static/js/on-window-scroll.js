$(document).ready(function () {

    var leftSidebar = $('.left-sidebar');
    var rightSidebar = $('.right-sidebar');

    var sideWidth = (window.innerWidth - 1000) / 2;

    centerSidebarsAbsolute(sideWidth, leftSidebar, rightSidebar);

    var topBtn = document.getElementById("topBtn");
    var downBtn = document.getElementById("downBtn");

    window.onscroll = function () {
        scrollFunction();
    };

    function centerSidebarsAbsolute(sideWidth, leftSidebar, rightSidebar) {
        leftSidebar.css('left', -(((sideWidth - 300) / 2) + 300)); // middle of the left side
        rightSidebar.css('right', -(((sideWidth - 215) / 2) + 215));
    }

    function centerSidebarsFixed(sideWidth, leftSidebar, rightSidebar) {
        leftSidebar.css('left', (sideWidth - 300) / 2);
        rightSidebar.css('right', (sideWidth - 215) / 2);
    }

    function scrollFunction() {
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

        if (scrollTop > 20) {
            topBtn.style.display = "block";
            downBtn.style.display = "block";
        } else {
            topBtn.style.display = "none";
            downBtn.style.display = "none";
        }

        sideWidth = (window.innerWidth - 1000) / 2;
        if ((sideWidth > 215) && (scrollTop > 170)) {
            leftSidebar.css('position', 'fixed');
            leftSidebar.css('top', 30);

            rightSidebar.css('position', 'fixed');
            rightSidebar.css('top', 30);

            centerSidebarsFixed(sideWidth, leftSidebar, rightSidebar);

        } else {
            leftSidebar.css('position', 'absolute');
            leftSidebar.css('top', 156);

            rightSidebar.css('position', 'absolute');
            rightSidebar.css('top', 156);

            centerSidebarsAbsolute(sideWidth, leftSidebar, rightSidebar);
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
