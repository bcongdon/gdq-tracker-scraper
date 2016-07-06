var scraperjs = require('scraperjs');

function getBidIndex(cb) {
  scraperjs.StaticScraper.create('https://gamesdonequick.com/tracker/bids/sgdq2016')
    .scrape(function($) {
      return $("table").first().children('tr:not([style^="display"])').map(function() {
        var data = $(this).children().map(function() {
          return $(this).text().replace(/\r?\n|\r/g, "");
        }).get();
        return {
          name: data[0],
          run:  data[1],
          description: data[2],
          amount: data[3],
          goal: data[4],
          bid_ref: $(this).find('a').attr('href').split('/').pop()
        }
      }).get();
    })
    .then(function(data) {
      cb(data)
    });
}

getBidIndex(console.log)