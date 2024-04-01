const { crawlPage } = require("./crawl.js");
const { printReport } = require("./report.js");

async function main() {
  if (process.argv.length < 3) {
    console.log("no website provided");
    process.exit(1);
  }

  if (process.argv.length > 3) {
    console.log("too many arguments provided");
    process.exit(1);
  }

  const baseUrl = process.argv[2];

  console.log(`baseUrl: ${baseUrl}`);
  const pages = crawlPage(baseUrl, baseUrl, {});

  printReport(pages);
}

main();
