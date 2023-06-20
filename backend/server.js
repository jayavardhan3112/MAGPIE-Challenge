const express = require("express");
const axios = require("axios");
const fs = require("fs");
const { parse } = require("json2csv");
const excel = require("node-excel-export");
const cors = require("cors");

const app = express();
const port = 3001;
const url = "https://mocki.io/v1/70f45519-0232-463b-bd4f-88e9d7213d26";
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.static("public"));

app.get("/data", (req, res) => {
  axios
    .get(url)
    .then((response) => {
      const data = response.data;
      const transformedData = transformData(data);
      const metrics = calculateMetrics(transformedData);
      res.json({ transformedData, metrics });
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
      res.status(500).json({ error: "Error retrieving data" });
    });
});

app.get("/download", (req, res) => {
  axios
    .get(url)
    .then((response) => {
      const data = response.data;
      const transformedData = transformData(data);
      const format = req.query.format;
      if (format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=data.json");
        res.send(JSON.stringify(transformedData, null, 2));
      } else if (format === "csv") {
        const csv = parse(transformedData);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=data.csv");
        res.send(csv);
      } else if (format === "xlsx") {
        const styles = {
          headerDark: {
            font: {
              color: {
                rgb: "FF000000",
              },
              sz: 12,
              bold: true,
              underline: true,
            },
            fill: {
              fgColor: {
                rgb: "FFFF0000",
              },
            },
          },
          cellPink: {
            fill: {
              fgColor: {
                rgb: "FFFFCCFF",
              },
            },
          },
        };

        const specification = {
          cardName: {
            displayName: "Card Name",
            headerStyle: styles.headerDark,
            cellStyle: styles.cellPink,
            width: 200,
          },
          gradingCompany: {
            displayName: "Grading Company",
            headerStyle: styles.headerDark,
            cellStyle: styles.cellPink,
            width: 120,
          },
          grade: {
            displayName: "Grade",
            headerStyle: styles.headerDark,
            cellStyle: styles.cellPink,
            width: 80,
          },
          txnDate: {
            displayName: "Transaction Date",
            headerStyle: styles.headerDark,
            cellStyle: styles.cellPink,
            width: 100,
          },
          pricingSource: {
            displayName: "Pricing Source",
            headerStyle: styles.headerDark,
            cellStyle: styles.cellPink,
            width: 150,
          },
          price: {
            displayName: "Price",
            headerStyle: styles.headerDark,
            cellStyle: styles.cellPink,
            width: 80,
          },
        };

        const report = excel.buildExport([
          {
            name: "Sheet 1",
            specification: specification,
            data: transformedData,
          },
        ]);

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", "attachment; filename=data.xlsx");
        res.send(report);
      } else {
        res.status(400).json({ error: "Invalid format" });
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
      res.status(500).json({ error: "Error retrieving data" });
    });
});

function transformData(data) {
  return data;
}
function calculateMetrics(data) {
  // Calculate the average price
  const prices = data.map((item) => parseFloat(item.price.replace("$", "")));
  const averagePrice =
    prices.reduce((sum, price) => sum + price, 0) / prices.length;

  // Calculate the lower bound (average price - 10%)
  const lowerBound = averagePrice * 0.9;

  // Calculate the upper bound (average price + 10%)
  const upperBound = averagePrice * 1.1;

  // Calculate the standard deviation
  const sumOfSquares = prices.reduce(
    (sum, price) => sum + Math.pow(price - averagePrice, 2),
    0
  );
  const variance = sumOfSquares / prices.length;
  const standardDeviation = Math.sqrt(variance);

  // Find the peak price and day it occurred
  let peakPrice = 0;
  let peakDay = "";
  data.forEach((item) => {
    const price = parseFloat(item.price.replace("$", ""));
    if (price > peakPrice) {
      peakPrice = price;
      peakDay = item.txnDate;
    }
  });

  return {
    averagePrice: averagePrice.toFixed(2),
    lowerBound: lowerBound.toFixed(2),
    upperBound: upperBound.toFixed(2),
    standardDeviation: standardDeviation.toFixed(2),
    peakPrice: peakPrice.toFixed(2),
    peakDay: peakDay,
  };
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
