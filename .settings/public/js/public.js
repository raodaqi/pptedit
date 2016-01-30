$(function() {
    $('.market a').bind('click', function(event) {
        var $market = $(this);
        var href = $market.attr('href');
        $(".type").hide();
        $(href).show();
        event.preventDefault();
    });
})

$(function() {
    $(".edit-passwd").bind("click",function(){
    	$(".edit-passwd").hide();
    	$(".edit-quit").show();
    	$(".passwd-form").show();
    	event.preventDefault();
    })
    $(".edit-quit").bind("click",function(){
    	$(".edit-quit").hide();
    	$(".passwd-form").hide();
    	$(".edit-passwd").show();
    	event.preventDefault();
    })
})

function val(){
    
}