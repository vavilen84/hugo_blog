$(document).ready(function () {

    setActiveCategoryClass();

    function setActiveCategoryClass() {
        $('.nav a').removeClass('active');
        if (currentCategory) {
            var link = $('[data-category="'+currentCategory+'"]');
            if (link[0]) {
                link.addClass('active');
            }
        }
    }
});