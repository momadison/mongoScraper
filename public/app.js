// Grab the articles as a json
$.getJSON("/articles", (data) => {

    // get all unsaved articles
    data = data.filter(()=> {
      return ({saved: false})
    })

    //shuffle the deck
    data = data.sort(() => {return 0.5 - Math.random()});

    //grab first 5 records
    data = data.slice(0,5);
    
    //display articles 
    for (var i = 0; i < data.length; i++) {
      $(".article-container").append(
          "<div data-_id='" + data[i]._id +
          "' class='card'>" + 
          "<div class='card-header'" +
              "<h3>" +
                  "<a class='article-link' target='_blank rel='noopener noreferrer' href='https://www.nytimes.com"+data[i].link+
                  "'>"+data[i].title+"</a>"+
                  "<a class='btn btn-warning text-white save' data-_id='" + data[i]._id + "'>Save Article</a>"+
              "</h3>"+
          "</div>"+
          "<div class='card-body'>"+data[i].description+"</div>"+
         "</div>" 
      )
    }
  
$(".save").on("click", (event) => {
    let myKey = $(event.target).attr("data-_id");

    $.ajax({
      method: "PUT",
      url: "/articles/" + myKey + "/true"
    }).then((data)=>{
      // console.log(data);
      location.reload()
    });

  })
});

function getSaved() {
  $.ajax({
    method: "GET",
    url: "/savedArticles"
   }).then((data) => {
    $('article-container').empty();
    //display articles 
    for (var i = 0; i < data.length; i++) {
      $(".article-container").append(
          "<div data-_id='" + data[i]._id +
          "' class='card'>" + 
          "<div class='card-header'" +
              "<h3>" +
                  "<a class='article-link' target='_blank rel='noopener noreferrer' href='https://www.nytimes.com"+data[i].link+
                  "'>"+data[i].title+"</a>"+
                  "<a class='btn btn-warning text-white unpin' data-_id='" + data[i]._id + "'>Unpin Article</a>"+
              "</h3>"+
          "</div>"+
          "<div class='card-body'>"+data[i].description+"</div>"+
         "</div>" 
      )
    }
    $(".unpin").on("click", (event) => {
      let myKey = $(event.target).attr("data-_id");
    
      $.ajax({
        method: "PUT",
        url: "/articles/" + myKey + "/false"
      }).then((data)=>{
        // console.log(data);
        $('.article-container').empty();
        getSaved();
      });
    })
   })
}


$("#saved").on("click", () => {
  $('.article-container').empty();
  getSaved();
  })

$("#scrapeNew").on("click", () => {
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).then((data) => {
    // console.log(data);
    location.reload();
  })
})

$(".clear").on("click", () => {
  $(".article-container").empty();
})
