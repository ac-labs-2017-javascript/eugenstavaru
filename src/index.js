console.log("Hello world");
var express = require("express");
var fetch = require("node-fetch");
var cheerio = require("cheerio");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database('./db');
var app = express();

function sqlData(pizzas) {
	db.serialize(function(){

		db.run("CREATE TABLE Pizzerie(title Text, ingrediente TEXT, pizzaPlace TEXT)");

	  var stmt = db.prepare("INSERT INTO Pizzerie(title, ingrediente, pizzaPlace) VALUES (?, ?, ?)");
	  for (var i = 0; i < pizzas.length; i++) {
	  	  var p = pizzas[i];
	      stmt.run(p.title, p.ingrediente, p.pizzaPlace);
	  }
	  stmt.finalize();

	  db.each("SELECT rowid AS id, title, ingrediente, pizzaPlace FROM Pizzerie", function(err, row) {
	  	if(err)
	  		throw err;
	  	console.log(row);
	      //console.log(row.id + ": " + row.info);
	  });
  });

}





function processText(text) {
	var $ = cheerio.load(text);
	var listItems = Array.from($("#tiles").children("li"));
	return listItems.map(function(li){

		return {
				 pizzaPlace: "Dopopoco",
				 title : $(li).find(".title").text(),
				 ingrediente: $(li).find(".ingrediente").text().trim(),
				 sursaImagine: "http://dopopoco.ro" + $(li).find("img").attr("src"),
				 pretPizzaMica: $(li).find(".pret").find("div:nth-child(1)").find(".pretVal").text(),
				 pretPizzaMare: $(li).find(".pret").find("div:nth-child(2)").find(".pretVal").text()
	};

	});
}

app.get("/hello", function(req, res) {
	var dopopocoSite = fetch("http://dopopoco.ro/meniu-individual-timisoara");
	var textResponse = dopopocoSite.then(function(response) {
		return response.text();
	});
	textResponse.then(function(text){
		res.send(processText(text));
		var pizzas = processText(text);
		sqlData(pizzas);
		res.send(pizzas);
	});
});

app.listen(3000, function() {
	console.log("Nu a crapat!");
});


//http://dopopoco.ro/meniu-individual-timisoara