import React, { useState } from "react";
import Papa from "papaparse";

export function CSVReader() {
  const [gridData, setGridData] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      complete: (result) => {
        console.log(result.data);
        setGridData(result.data);
      },
      header: false,
    });
  };

  const handleDragStart = (e, rowIndex, cellIndex) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ rowIndex, cellIndex })
    );
  };

  const handleDrop = (e, dropRowIndex, dropCellIndex) => {
    //ドラッグされたセルの情報を取得
    const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
    const dragRowIndex = dragData.rowIndex;
    const dragCellIndex = dragData.cellIndex;

    if (dragRowIndex === dropRowIndex && dragCellIndex === dropCellIndex) {
      return; // 同じセルにドロップした場合は何もしない
    }

    // データの交換
    const newData = [...gridData]; //表の現在のデータをコピー
    const temp = newData[dragRowIndex][dragCellIndex]; //ドラッグされたデータを変数に入れる
    newData[dragRowIndex][dragCellIndex] = newData[dropRowIndex][dropCellIndex]; //ドロップ先のデータをドラッグしたデータへ
    newData[dropRowIndex][dropCellIndex] = temp; //ドラッグされたデータをドロップ先へ

    setGridData(newData); //現在の表のデータを更新
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // デフォルトの処理を無効にして、ドロップを許可する
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      {gridData.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, cellIndex) => (
            <div
              className="w-48 h-48 mr-[-2px] mb-[-2px] border-2 border-black flex items-center justify-center"
              key={cellIndex}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, rowIndex, cellIndex)}
              onDrop={(e) => handleDrop(e, rowIndex, cellIndex)}
              onDragOver={handleDragOver}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
