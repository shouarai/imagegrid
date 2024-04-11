import React from "react";
import "./App.css";
// import { CSVReader } from "./CSVReader";
import { ImageGridDragDrop } from "./ImageGridDragDrop";

function App() {
  return (
    <div className="App">
      <h1>CSV to 4x4 Grid</h1>
      {/* <CSVReader /> */}
      <ImageGridDragDrop />
    </div>
  );
}

export default App;
