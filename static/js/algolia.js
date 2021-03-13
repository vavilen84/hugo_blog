$(document).ready(function () {
    initAlgoliaClient();

    //hideSearchResults();
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
        indexName: indexName + langPostfix,
        searchClient,
        searchFunction(helper) {
            if (helper.state.query) {
                helper.search();
            }
        },
    });

    search.addWidgets([
        instantsearch.widgets.configure({
            hitsPerPage: 8
        }),
        instantsearch.widgets.searchBox({
            container: '#searchbox',
            placeholder: "Algolia search ..."
        }),
        instantsearch.widgets.hits({
            container: '#hits',
            escapeHTML: false,
            templates: {
                item: `
<div class="hit-item">
    <a target="_blank" href="{{ uri }}" data-object_id="{{ objectID }}">
            <div class="title"><strong>{{title}}</strong></div>
<div class="description-wrap">{{#helpers.highlight}}{ "attribute": "description" }{{/helpers.highlight}}</div>
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