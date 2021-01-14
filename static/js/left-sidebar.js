$(document).ready(function(){
    var headers = $('.post').find("h1, h2, h3, h4, h5, h6");
    if (headers.length > 0) {
        headers.each(function(){
            var title = $(this).text();
            var id = $(this).attr('id');
            $('#headers-list').append('<li><a class="underline" href="#'+id+'">'+title+'</a></li>')
        })
        $('.left-sidebar').show();
    }
});
