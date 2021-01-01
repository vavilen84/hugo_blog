var currentLang = "{{.Site.Language.Lang}}";

function getLocalizedURL(url){
    var lang = currentLang === 'en' ? '' : '/ru';
    return url.origin +  lang + url.pathname;
}
$(document).ready(function(){
    $('.localized').each(function(){
        var url = new URL($(this).attr('href'));
        console.log(url);
        console.log(getLocalizedURL(url));
        $(this).attr('href', getLocalizedURL(url));
    });
});
