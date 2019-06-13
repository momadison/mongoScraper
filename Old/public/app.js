//Grab the articles as JSON
$.getJSON("/articles", (data) => {
    
    let displayTotal = 5;
    data = data.sort(() => {return 0.5 - Math.random()});
    for (var i = 0; i < displayTotal; i++) {
        $(".article-container").append(
            "<div data-_id='" + data[i]._id +
            "' class='card'>" + 
            "<div class='card-header'" +
                "<h3>" +
                    "<a class='article-link' target='_blank rel='noopener noreferrer' href='"+data[i].link+
                    "'>"+data[i].title+"</a>"+
                    "<a class='btn btn-success save'>Save Article</a>"+
                "</h3>"+
            "</div>"+
            "<div class='card-body'>"+data[i].description+"</div>"+
           "</div>" 
        )
    }
});


$(".save").click("on", ()=>{console.log("save")});


$(".scrape-new").on("click", ()=>{
    console.log("scraping");
    console.log(e.target);
    $.ajax({
        method: "GET",
        url: "/scrape"
    })
    

})