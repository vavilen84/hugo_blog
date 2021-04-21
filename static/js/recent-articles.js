$(document).ready(async function () {
    var data = await getIndex();
    for (i in data) {
        if ((data[i].title !== "") && (data[i].content !== "") && (data[i].tags.length > 0)) {
            var link = $('<a></a>')
                .html(data[i].title)
                .attr('href', data[i].uri);
            var options = { year: 'numeric', month: 'long', day: 'numeric' };
            var locale = currentLang === "en" ? "en-US" : "ru-RU";
            var posted = $('<span class="posted-on"></span>')
                .html(new Date(data[i].created).toLocaleDateString(locale, options));
            var html = $('<div></div>')
                .add(link)
                .add('<br>')
                .add(posted)
                .add('<hr>');
            $('<li></li>')
                .html(html)
                .appendTo($('#recent-articles-list'));
        }
    }
});

async function getIndex() {
    try {
        var res = await fetch(window.location.href + "/index.json");
        var data = await res.json();
    } catch (err) {
        console.log(err);
    }
    return data;
}