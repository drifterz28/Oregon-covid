const https = require("https");
const http = require("http");
const cheerio = require("cheerio");
const port = process.env.PORT || 5000;
const server = http.createServer((_, response) => {
  https
    .get("https://govstatus.egov.com/OR-OHA-COVID-19", (res) => {
      let str;
      res.on("data", (d) => {
        str += d;
      });
      res.on("end", function () {
        const $ = cheerio.load(str);
        const $table = $("#collapseCases table");
        const lastUpdate = $table
          .find("th")
          .text()
          .replace(/(Data current as of | Updated daily.)/g, "");
        const $tableColums = $table.find("td");
        const positive = $tableColums.eq(1).text();
        const negative = $tableColums.eq(3).text();
        const totalTested = $tableColums.eq(5).text();
        const deaths = $tableColums.eq(7).text();
        response.writeHead(200, { 'Content-Type': 'application/json'});
        response.end(JSON.stringify({
          lastUpdate,
          positive,
          negative,
          totalTested,
          deaths,
        }));

      });
    })
    .on("error", (e) => {
      console.error(e);
    });
});
server.on("clientError", (err, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});
server.listen(port);
console.log(`server running on port ${port}`);
