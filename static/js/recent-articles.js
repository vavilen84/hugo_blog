$(document).ready(async function () {
    var data = await getIndex();
    console.log(data);
    var counter = 0;
    for (i in data) {
        if (counter >= 10) {
            break;
        }
        if ((data[i].title !== "") && (data[i].content !== "") && (data[i].tags.length > 0)) {
            var link = $('<a></a>')
                .html(data[i].category[0].toUpperCase() + ": " + data[i].title)
                .attr('href', data[i].uri);
            $('<li></li>')
                .html(link)
                .appendTo($('#recent-articles-list'));
            counter++;
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