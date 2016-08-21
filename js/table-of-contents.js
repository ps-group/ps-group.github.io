---
---

$(document).ready(function(){
    $(".table-of-contents.hidden").removeClass("hidden");
    $("h2:not(.footer-heading):not(.not-in-toc),h3,h4,h5,h6").each(function(i,item){
        var tag = $(item).get(0).localName;
        $(item).attr("id","wow"+i);
        $(".table-of-contents-rows").append('<a class="new'+tag+'" href="#wow'+i+'">&#8226;&nbsp;'+$(this).text()+'</a></br>');
        $(".newh2").css("margin-left",0);
        $(".newh3").css("margin-left",15);
        $(".newh4").css("margin-left",30);
        $(".newh5").css("margin-left",45);
        $(".newh6").css("margin-left",60);
    });
});
