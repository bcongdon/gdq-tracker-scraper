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
          bid_ref: $(this).find('a').attr('href').split('/').slice(1).join('/')
        }
      }).get();
    })
    .then(function(data) {
      cb(data)
    });
}

function parseAmount(amt) {
  if(!amt) return 0
  return parseFloat(amt.slice(1));
}

function getBidDetail(ref, cb) {
  scraperjs.StaticScraper.create('https://gamesdonequick.com/tracker/bid/' + ref)
    .scrape(function($) {
      var data =  $('tr').map(function() {
        var data = $(this).children().map(function() {
          return $(this).text().replace(/\r?\n|\r/g, "");
        }).get();
        var link = $(this).find('a').attr('href')
        if(link) {
          data.push(link.split('/').slice(1).join('/'))
        }
        return [data]
      }).get()
      var type = BID_TYPE.UNKNOWN;
      if(data[0][0] == 'Description' || data[0][0] == 'Owners') data = data.slice(2)
      if(data[0][0] == 'Name') type = BID_TYPE.CHOICE;
      if(data[0][0] == 'NameAscDsc') type = BID_TYPE.GOAL;
      data = data.slice(1)
      data = data.map(function(d){
        var payload = {
          name: d[0],
          amount: parseAmount(d[2])
        }
        if(d[1]) payload.date = Date.parse(d[1]);
        if(d.length > 3) payload.link = d.pop()
        return payload
      });
      var info = $('h2 > small').text().split("\n").slice(1,-1);
      var payload = {
        type: type,
        data: data,
        bid: info[1],
        total: parseAmount(info[3])
      }
      if(info.length > 5) payload.goal = parseAmount(info[5]);
      return payload;
    })
    .then(function(data) {
      cb(data)
    });
}

var BID_TYPE = {
  UNKNOWN: 'UNKNOWN',
  GOAL: 'GOAL',
  CHOICE: 'CHOICE',
}

// getBidDetail(4539, function(d){});
// getBidDetail(4540, function(d){});
// getBidDetail(4826, function(d){});
// getBidDetail(4792, function(d){});
getBidDetail(4539, console.log);
getBidDetail(4540, console.log);
getBidDetail(4826, console.log);
getBidDetail(4792, console.log);