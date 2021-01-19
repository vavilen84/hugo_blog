$(document).ready(function () {
    initAlgoliaClient();

    hideSearchResults();
    onSearchInputKeyup();

    $('.search-result-wrap').css('left', $('.ais-SearchBox-input').offset().left);
});

function hideSearchResults() {
    $('#hits > div').hide();
    $('.search-result-wrap').hide();
}

function showSearchResults() {
    $('#hits > div').show();
    $('.search-result-wrap').show();
}

function onSearchInputKeyup() {
    $('.ais-SearchBox-input').on('keyup', function () {
        hideSearchResults();
        var val = $(this).val().trim();
        if (val !== "") {
            showSearchResults();
        }
    });
}

function initAlgoliaClient() {
    const searchClient = algoliasearch('TE5FKRAT68', '5717987de53a614c2beeb60c1c9a988b');
    var url = new URL(window.location.href);
    var langPostfix = (url.pathname.indexOf('/ru') !== -1) ? 'ru' : 'en';
    const search = instantsearch({
        indexName: 'blog_local_' + langPostfix,
        searchClient,
    });

    search.addWidgets([
        instantsearch.widgets.configure({
            hitsPerPage: 8
        }),
        instantsearch.widgets.searchBox({
            container: '#searchbox',
        }),
        instantsearch.widgets.hits({
            container: '#hits',
            escapeHTML: false,
            transformItems(items) {
                return items.map(function (item) {
                    // item._highlightResult.tags.value = prepareField(item._highlightResult.tags.value);
                    // item._highlightResult.description.value = prepareField(item._highlightResult.description.value);
                    // item._highlightResult.content.value = prepareField(item._highlightResult.content.value);
                    return item;
                });
            },
            templates: {
                item: `
<div class="hit-item">
    <a target="_blank" href="{{ uri }}" data-object_id="{{ objectID }}">
            <div class="title"><strong>{{title}}</strong></div>
<!--<div class="tags-wrap">{{#helpers.highlight}}{ "attribute": "tags" }{{/helpers.highlight}}</div>-->
<div class="description-wrap">{{#helpers.highlight}}{ "attribute": "description" }{{/helpers.highlight}}</div>
<!--<div class="content-wrap">{{#helpers.highlight}}{ "attribute": "content" }{{/helpers.highlight}}</div>-->
    </a>
</div>
`,
            },
        }),
        instantsearch.widgets.pagination({
            container: '#pagination',
        }),
    ]);

    search.start();
}

function prepareField(value) {
    if (value.length) {
        var result = /(.{0,20})<em>(.*?)<\/em>(.{0,20})/g.exec(value);
        if (result && result[0]) {
            if (result[0] > 200) {
                if (result[0]) {
                    result = result[0].replace(/^(.*)>((.*)<em(.*)<\/em>(.*))<\/(.*)$/g, "$2");
                    return "..." + result + "...";
                }
            } else {
                return result[0];
            }
        } else {
            return "";
        }
    }
    return "";
}
