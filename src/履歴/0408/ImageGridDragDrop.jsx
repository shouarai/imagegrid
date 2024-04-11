import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { ImageUploader } from "./ImageUploader";
import { ImageList } from "./ImageList";

export function ImageGridDragDrop() {
  //画像のURLリスト
  const [imageList, setImageList] = useState([]);
  const [gridData, setGridData] = useState(
    Array(4)
      .fill()
      .map(() => Array(4).fill(null))
  );
  const [selectedImage, setSelectedImage] = useState(null); // 選択された画像のURL
  const [isModalOpen, setIsModalOpen] = useState(false); // モーダルの表示状態
  // 選択された画像のインデックス（グリッド内）を追跡する新しい状態
  const [selectedGridImageIndex, setSelectedGridImageIndex] = useState(null);

  useEffect(() => {
    // URLからクエリパラメーターを取得
    const queryParams = new URLSearchParams(window.location.search);
    const nombre = queryParams.get("nombre"); // 'nombre' パラメーターの値を取得

    const fetchSavedGridData = async () => {
      try {
        const response = await fetch(
          `https://www.teraos.net/sptokyo/shaddy/saved_gridData.php?filename=台割作成&nombre=${nombre}`
        );
        const data = await response.json();
        // console.log("json", JSON.parse(data[0].positionJson));
        const dataJson = JSON.parse(data[0].positionJson);
        if (dataJson && dataJson.length > 0) {
          // 新しい4x4のグリッドを初期化
          let newGridData = Array(4)
            .fill()
            .map(() => Array(4).fill(null));

          // 取得したデータを基にグリッドを構築
          dataJson.forEach((item) => {
            if (
              item.imageUrl &&
              item.rowIndex !== undefined &&
              item.cellIndex !== undefined
            ) {
              newGridData[item.rowIndex][item.cellIndex] = item.imageUrl;
            }
          });

          setGridData(newGridData);
          return; // 早期リターン
        }
        // 保存されたgridDataがない場合、既存のロジックを実行
        fetchImages();
      } catch (error) {
        console.error("Failed to fetch saved grid data:", error);
        // alert("Failed to fetch saved grid data:");
        // 保存されたgridDataの取得に失敗した場合、既存のロジックを実行
        fetchImages();
      }
    };

    const fetchImages = async () => {
      try {
        const response = await fetch(
          `https://www.teraos.net/sptokyo7/api/v2/shaddy/image_List.php?id=${nombre}`
        );
        const data = await response.json(); // 画像のリストを含む想定のレスポンス
        if (data) {
          // console.log(data);
        } else {
          return;
        }
        // ここで取得したdataをgridDataの形式に合わせて加工
        // この例では、取得した画像リストの先頭から4x4のグリッドを埋めるものと仮定
        const newGridData = Array(4)
          .fill()
          .map((_, rowIndex) =>
            Array(4)
              .fill()
              .map((_, colIndex) => {
                // console.log(colIndex + ":" + rowIndex);
                const imageIndex = rowIndex * 4 + colIndex;
                console.log(imageIndex);
                return data["content"] && data["content"][imageIndex]
                  ? `https://www.teraos.net/sptokyo7/api/v2/shaddy/image_preview.php?assetid=${data["content"][imageIndex]["id"]}`
                  : null; // ここでは画像のURLをセットすると仮定
              })
          );
        console.log(newGridData);
        setGridData(newGridData);
      } catch (error) {
        console.error("Failed to fetch images:", error);
      }
    };

    if (nombre) {
      fetchSavedGridData();
    }
  }, []); // 空の依存配列を指定して、コンポーネントのマウント時にのみ実行

  const handleDragStart = (e, index) => {
    const dragData = JSON.stringify({
      index,
      fromList: true,
    });
    e.dataTransfer.setData("application/json", dragData);
  };

  const handleGridDragStart = (e, rowIndex, cellIndex) => {
    const dragData = JSON.stringify({
      rowIndex,
      cellIndex,
      fromList: false,
    });
    e.dataTransfer.setData("application/json", dragData);
  };

  const handleDrop = (e, dropRowIndex, dropCellIndex) => {
    e.preventDefault();
    setSelectedGridImageIndex(null);
    const { index, rowIndex, cellIndex, fromList } = JSON.parse(
      e.dataTransfer.getData("application/json")
    );

    if (fromList) {
      const imageUrl = imageList[index];
      // 外部からのドロップ
      const newData = [...gridData];
      newData[dropRowIndex][dropCellIndex] = imageUrl;
      setGridData(newData);

      // 画像リストから削除
      setImageList((prevImages) =>
        prevImages.filter((_, idx) => idx !== index)
      );
    } else {
      // グリッド内でのドロップ、元の位置と新しい位置の画像を交換
      const newData = [...gridData]; //gridDataの展開
      const temp = newData[dropRowIndex][dropCellIndex];
      newData[dropRowIndex][dropCellIndex] = newData[rowIndex][cellIndex];
      newData[rowIndex][cellIndex] = temp;
      setGridData(newData);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // ドロップを許可する
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // グリッドの画像をクリックしたときの処理（モーダルを開く + 選択状態を更新）
  const handleGridImageClick = (rowIndex, cellIndex, imageUrl) => {
    // モーダルを開く処理
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
    // 選択された画像のインデックスを更新
    setSelectedGridImageIndex(`${rowIndex}-${cellIndex}`);
  };

  const handleImagesSelected = (images) => {
    setImageList((prevImages) => [...prevImages, ...images]);
  };

  // CSVを生成してダウンロードする関数
  const downloadGridDataAsCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ImageURL,RowIndex,CellIndex\n"; // ヘッダー行
    gridData.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (cell) {
          // URLのファイル名部分を抽出（例として）
          const imageName = cell.substring(cell.lastIndexOf("/") + 1);
          console.log(cell);
          csvContent += `${imageName},${rowIndex},${cellIndex}\n`;
        }
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gridData.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 新しい関数：gridDataをサーバーにPOSTする
  const postGridData = async () => {
    // URLからクエリパラメーターを取得
    const queryParamPostGrid = new URLSearchParams(window.location.search);
    const nombreObj = queryParamPostGrid.get("nombre"); // 'nombre' パラメーターの値を取得

    const postData = gridData.flatMap(
      (row, rowIndex) =>
        row
          .map((cell, cellIndex) => ({
            imageUrl: cell, // 画像のURL
            rowIndex, // 行インデックス
            cellIndex, // セルインデックス
          }))
          .filter((cell) => cell.imageUrl !== null) // nullでないセルのみを対象とする
    );
    try {
      const response = await fetch(
        `https://www.teraos.net/sptokyo/shaddy/positionChange.php?filename=台割作成&nombre=${nombreObj}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to post grid data");
      }

      const result = await response.json();
      console.log(result); // 応答の確認
      alert("Grid data posted successfully");
    } catch (error) {
      console.error("Error posting grid data:", error);
      alert("Failed to post grid data");
    }
  };

  return (
    <div className="flex">
      <div>
        <ImageUploader handleImagesSelected={handleImagesSelected} />
        <ImageList imageList={imageList} handleDragStart={handleDragStart} />
      </div>

      <div>
        <button
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={downloadGridDataAsCSV}
        >
          CSVダウンロード
        </button>

        <button
          className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4  mt-2 rounded"
          onClick={postGridData}
        >
          Grid DataをPOST
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 ml-4">
        {gridData.map((row, rowIndex) =>
          row.map((cell, cellIndex) => (
            <div
              key={`${rowIndex}-${cellIndex}`}
              className="w-36 h-36 border-2 border-gray-300  bg-white flex justify-center items-center"
              onDrop={(e) => handleDrop(e, rowIndex, cellIndex)}
              onDragOver={handleDragOver}
            >
              {cell && (
                <div
                  className={`${
                    selectedGridImageIndex === `${rowIndex}-${cellIndex}`
                      ? "w-36 h-36 opacity-75 bg-pink-500" // 選択された画像に適用するスタイル
                      : ""
                  }`}
                >
                  <img
                    src={cell}
                    alt=""
                    draggable="true"
                    onClick={() =>
                      handleGridImageClick(rowIndex, cellIndex, cell)
                    } // 画像クリックイベントを追加
                    onDragStart={(e) =>
                      handleGridDragStart(e, rowIndex, cellIndex)
                    }
                    className={`w-32 h-32  cursor-pointer ${
                      selectedGridImageIndex === `${rowIndex}-${cellIndex}`
                        ? "opacity-75 bg-pink-500" // 選択された画像に適用するスタイル
                        : ""
                    }`}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <Modal
        selectedImage={selectedImage}
        isModalOpen={isModalOpen}
        closeModal={closeModal}
      />
    </div>
  );
}
