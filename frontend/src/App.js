import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const App = () => {
  const [transformedData, setTransformedData] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };
  const fetchData = () => {
    axios
      .get("http://localhost:3001/data")
      .then((response) => {
        console.log(response.data);
        setTransformedData(response.data.transformedData);
        setMetrics(response.data.metrics);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error retrieving data:", error);
      });
  };

  const handleDownload = (format) => {
    window.location.href = `http://localhost:3001/download?format=${format}`;
  };

  return (
    <div className="container mx-auto p-4">
      <div ref={scrollRef} />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Transformed Data:</h2>
          <p className="text-lg font-mono mb-4">
            Please scroll to the bottom to see the Metrics and to download Data
            in the format you want - or{" "}
            <button
              className="scroll-button px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={scrollToBottom}
            >
              Scroll to Bottom
            </button>
          </p>

          <table className="border border-gray-300 w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Card Name</th>
                <th className="py-2 px-4 border-b">Grading Company</th>
                <th className="py-2 px-4 border-b">Grade</th>
                <th className="py-2 px-4 border-b">Transaction Date</th>
                <th className="py-2 px-4 border-b">Pricing Source</th>
                <th className="py-2 px-4 border-b">Price</th>
              </tr>
            </thead>
            <tbody>
              {transformedData.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-2 px-4 border-b">{item.cardName}</td>
                  <td className="py-2 px-4 border-b">{item.gradingCompany}</td>
                  <td className="py-2 px-4 border-b">{item.grade}</td>
                  <td className="py-2 px-4 border-b">{item.txnDate}</td>
                  <td className="py-2 px-4 border-b">{item.pricingSource}</td>
                  <td className="py-2 px-4 border-b">{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="text-2xl font-bold mt-4">Metrics:</h2>
          <p>Average Price: {metrics.averagePrice}</p>
          <p>Lower Bound: {metrics.lowerBound}</p>
          <p>Upper Bound: {metrics.upperBound}</p>
          <p>Standard Deviation: {metrics.standardDeviation}</p>
          <p>Peak Price: {metrics.peakPrice}</p>
          <p>Peak Day: {metrics.peakDay}</p>

          <h2 className="text-2xl font-bold mt-4">
            Download Transformed Data:
          </h2>
          <div className="space-x-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleDownload("json")}
            >
              Download as JSON
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleDownload("csv")}
            >
              Download as CSV
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleDownload("xlsx")}
            >
              Download as XLSX
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
