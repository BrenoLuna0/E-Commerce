var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

$('.picZoomer').picZoomer();

$('.piclist li').on('click', function (event) {
    2
    var $pic = $(this).find('img');
    3
    $('.picZoomer-pic').attr('src', $pic.attr('src'));
    4
});
