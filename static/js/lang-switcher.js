$(document).ready(function () {
    var url = new URL(window.location.href);

    disableCurrentLangLink();
    setActiveLanguageClass();

    function setActiveLanguageClass(){
        if (url.pathname.indexOf('/ru') !== -1) {
            $('#en-link').removeClass('active');
            $('#ru-link').addClass('active');
        } else {
            $('#en-link').addClass('active');
            $('#ru-link').removeClass('active');
        }
    }

    function disableCurrentLangLink(){
        if (url.pathname.indexOf('/ru') !== -1) {
            var enLink = url.origin + url.pathname.substring(3);
            $('#en-link').attr('href', enLink);
            $('#ru-link').attr('href', '');
        } else {
            var ruLink = url.origin + '/ru' + url.pathname;
            $('#en-link').attr('href', '');
            $('#ru-link').attr('href', ruLink);
        }
        $('.lang-link').click(function (e) {
            var curEl = e.currentTarget;
            if ($(curEl).attr('href') === '') {
                return false;
            }
        });
    }
});
