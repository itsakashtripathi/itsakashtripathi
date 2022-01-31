$(document).ready(function () {


    let $btns = $('.project-area .button-group button');


    $btns.click(function (e) {

        $('.project-area .button-group button').removeClass('active');
        e.target.classList.add('active');
        $(this).addClass('btn-grp-btn-active').siblings().removeClass('btn-grp-btn-active');

        let selector = $(e.target).attr('data-filter');
        $('.project-area .grid').isotope({
            filter: selector
        });

        return false;
    })

    $('.project-area .button-group #btn1').trigger('click');

    $('.project-area .grid .test-popup-link').magnificPopup({
        type: 'image',
        gallery: { enabled: true }
    });


    // Owl-carousel

    $('.site-main .about-area .owl-carousel').owlCarousel({
        loop: true,
        autoplay: true,
        dots: true,
        responsive: {
            0: {
                items: 1
            },
            560: {
                items: 2
            }
        }
    })

    // sticky navigation menu

    // let nav_offset_top = $('.header_area').height() + 50;

    // function navbarFixed() {
    //     if ($('.header_area').length) {
    //         $(window).scroll(function () {
    //             let scroll = $(window).scrollTop();
    //             if (scroll >= nav_offset_top) {
    //                 $('.header_area .main-menu').addClass('navbar_fixed');
    //             } else {
    //                 $('.header_area .main-menu').removeClass('navbar_fixed');
    //             }
    //         })
    //     }
    // }

    // navbarFixed();

});

// spinner start 
$(window).on("load",function(){
    preloaderFadeOutTime=50;
    function hidePreloader(){
        var preloader=$('.spinner-wrapper');
        preloader.fadeOut(preloaderFadeOutTime);
    }
hidePreloader();
});
// spinner end 

// disable shortcuts start
document.onkeydown = function(e) {
    if(event.keyCode == 123) {return false;}if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)){return false;}if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)){return false;}if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)){return false;}if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)){return false;}if(e.ctrlKey && e.keyCode == 'P'.charCodeAt(0)){return false;}if(e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)){return false;}if(e.ctrlKey && e.keyCode == 'F'.charCodeAt(0)){return false;}if(e.ctrlKey && e.keyCode == 'G'.charCodeAt(0)){return false;}if(e.ctrlKey && e.keyCode == 'C'.charCodeAt(0)){return false;}if(e.ctrlKey && e.keyCode == 'V'.charCodeAt(0)){return false;}}
// disable shortcuts end

// disable right click start
document.addEventListener('contextmenu',event=>event.preventDefault());
// disable right click end

// smooth scroll start
(function () {
    var speed = 1000;
    var moving_frequency = 1;
    var links = document.getElementsByClassName('nav-el');
    var href;
    for (var i = 0; i < links.length; i++) {
        href = (links[i].attributes.href === undefined) ? null : links[i].attributes.href.nodeValue.toString();
        if (href !== null && href.length > 1 && href.substr(0, 1) == '#') {
            links[i].onclick = function () {
                var element;
                var href = this.attributes.href.nodeValue.toString();
                if (element = document.getElementById(href.substr(1))) {
                    var hop_count = speed / moving_frequency;
                    var getScrollTopDocumentAtBegin = getScrollTopDocument();
                    var gap = (getScrollTopElement(element) - getScrollTopDocumentAtBegin) / hop_count;
                    for (var i = 1; i <= hop_count; i++) {
                        (function () {
                            var hop_top_position = gap * i;
                            setTimeout(function () {
                                window.scrollTo(0, hop_top_position + getScrollTopDocumentAtBegin);
                            }, moving_frequency * i);
                        })();
                    }
                }
                return false;
            };
        }
    }
    var getScrollTopElement = function (e) {
        var top = 0;
        while (e.offsetParent != undefined && e.offsetParent != null) {
            top += e.offsetTop + (e.clientTop != null ? e.clientTop : 0);
            e = e.offsetParent;
        }
        return top;
    };
    var getScrollTopDocument = function () {
        return document.documentElement.scrollTop + document.body.scrollTop;
    };
})();
// smooth scroll end

// activate clicked link start
$(document).ready(function() {
    $(document).on('click', '.nav-item a', function (e) {
        $(this).parent().addClass('active').siblings().removeClass('active');
        // $(this).parent().addClass('green').siblings().removeClass('green');
    });
    $(document).on('click', '.navbar-brand', function (e) {
        $(".nav-item").siblings().removeClass('active');
    });
});
// activate clicked link end

// scrollspy start
const progress_bar = document.querySelectorAll('.progress');
$(window).scroll(function() {
var wintop = $(window).scrollTop(), docheight = $(document).height(), winheight = $(window).height();
var percent_scrolled = (wintop/(docheight-winheight))*100;
progress_bar.forEach(bar => {
    // bar.dataset = 50;
    // const { size } = bar.dataset;
    // console.log(size)
    bar.style.width = `${percent_scrolled}%`
});
});
// scrollspy end

// animation start

    $('.cards').hover(function(){     
        var selector = this.querySelector('.swipeAnimate');
        selector.classList.remove('magictime', 'swap-back');
        selector.classList.add('magictime', 'swap');
        
    },     
    function(){    
        var selector = this.querySelector('.swipeAnimate');
        selector.classList.remove('magictime', 'swap');
        // selector.classList.add('magictime', 'swap-back');
    });
    

    //testing start
    // $(window).scroll(function() {
    //     var top_of_element = $(".brand-area").offset().top;
    //     var bottom_of_element = $(".brand-area").offset().top + $(".brand-area").outerHeight();
    //     var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
    //     var top_of_screen = $(window).scrollTop();
    
    //     if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
    //         // the element is visible, do something
    //         console.log('hi')
    //     } else {
    //         // the element is not visible, do something else
    //     }
    // });
    //testing end
// animation end