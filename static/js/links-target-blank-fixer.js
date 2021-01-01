$(document).ready(function () {
    var links = $('.post').find('a');
    links.each(function () {
        var targetBlank = $(this).attr('target');
        if (targetBlank !== '_blank') {
            $(this).attr('target', '_blank');
        }
    });
});
