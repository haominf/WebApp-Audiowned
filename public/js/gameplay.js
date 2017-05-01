$(document).ready(function(){
    var bar = new ProgressBar.Line(progress, {
        strokeWidth: 4,
        duration: 30000,
        color: '#FFEA82',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '100%'},
        from: {color: '#5AFE32'},
        to: {color: '#FA483F'},
        step: (state, bar) => {
        bar.path.setAttribute('stroke', state.color);
        }
    });
    bar.animate(1.0);
});

function sendChoice(num) {
    $.ajax({
        type: "POST",
        url: "audiowned.herokuapp.com/submit",
        data: { data1: num},
        // contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(){
            console.log("success");
        },
        statusCode: {
            console.log("before 200");
            200: function(){
                console.log("hledkjalkd");
                window.location.href="/index";
            }
        },
        error: function() {
            console.log("error");
        }
    });
};

setTimeout(function() {
    $("#gamePage").addClass('animated slideOutRight');
    setTimeout(function() {
        window.location.href="/index";
    }, 800);
}, 30000);
