$(document).ready(function(){
    var headers = $('.post').find("h1, h2, h3, h4, h5, h6");
    console.log(headers);
    headers.each(function(){
        var title = $(this).text();
        var id = $(this).attr('id');
        $('#headers-list').append('<li><a class="underline" href="#'+id+'">'+title+'</a></li>')
    });
});
