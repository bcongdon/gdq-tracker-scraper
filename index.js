var scraperjs = require('scraperjs');
var Promise = require('promise');

var exports = module.exports;

function parseAmount(amt) {
  if(!amt) return 0
  return parseFloat(amt.slice(1).replace(",",""));
}

exports.getBidIndex = function(event) {
  return new Promise(function(resolve, reject) {
    scraperjs.StaticScraper.create('https://gamesdonequick.com/tracker/bids/' + event)
      .scrape(function($) {
        return $("table").first().children('tr:not([style^="display"])').map(function() {
          var data = $(this).children().map(function() {
            return $(this).text().replace(/\r?\n|\r/g, "");
          }).get();
          return {
            name: data[0],
            run:  data[1],
            description: data[2],
            amount: parseAmount(data[3]),
            goal: data[4],
            link: $(this).find('a').attr('href').split('/').slice(1).join('/')
          }
        }).get();
      })
      .then(function(data) {
        resolve(data);
      })
      .catch(function(err){
        reject(err);
      });
  });
}

exports.getBidDetail = function(ref) {
  return new Promise(function(resolve, reject) {
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
        var type = exports.BID_TYPE.UNKNOWN;
        if(data[0][0] == 'Description' || data[0][0] == 'Owners') data = data.slice(2)
        if(data[0][0] == 'Name') type = exports.BID_TYPE.CHOICE;
        if(data[0][0] == 'NameAscDsc') type = exports.BID_TYPE.GOAL;
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
        resolve(data);
      })
      .catch(function(err){
        reject(err);
      });
  });
}

exports.BID_TYPE = {
  UNKNOWN: 'UNKNOWN',
  GOAL: 'GOAL',
  CHOICE: 'CHOICE',
}

