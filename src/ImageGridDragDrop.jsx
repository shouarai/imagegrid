import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal } from "./Modal";
// import { ImageUploader } from "./ImageUploader";
// import { ImageList } from "./ImageList";
import { Title } from "./Title";
import { GridControls } from "./GridControls";

export function ImageGridDragDrop() {
  //画像のURLリスト
  const [imageList, setImageList] = useState([]);
  const [gridData, setGridData] = useState(
    Array(4)
      .fill()
      .map(() => Array(4).fill(null))
  );
  const [gridSize, setGridSize] = useState({ rows: 4, cols: 4 }); //グリッドサイズの状態管理
  const [selectedImage, setSelectedImage] = useState(null); // 選択された画像のURL
  const [isModalOpen, setIsModalOpen] = useState(false); // モーダルの表示状態
  const [selectedGridImageIndex, setSelectedGridImageIndex] = useState(null); // 選択された画像のインデックス（グリッド内）を追跡する新しい状態
  const [draggedImages, setDraggedImages] = useState([]); // 複数の画像を保持する新しい状態

  useEffect(() => {
    const { rows, cols } = gridSize; // 現在のグリッドサイズを取得
    const positionJsonProperty = `positionJson_${rows}_${cols}`; // プロパティ名を動的に構築
    // URLからクエリパラメーターを取得
    const queryParams = new URLSearchParams(window.location.search);
    const nombre = queryParams.get("nombre"); // 'nombre' パラメーターの値を取得

    const fetchSavedGridData = async () => {
      try {
        const response = await fetch(
          `https://www.teraos.net/sptokyo/shaddy/saved_gridData.php?filename=台割作成&nombre=${nombre}`
        );
        const data = await response.json();
        const gridDataJson = JSON.parse(data[0][positionJsonProperty]);
        if (gridDataJson["images"] && gridDataJson["images"].length > 0) {
          // 新しい4x4のグリッドを初期化
          let newGridData = Array(rows)
            .fill()
            .map(() => Array(cols).fill(null));

          // 取得したデータを基にグリッドを構築
          gridDataJson["images"].forEach((item) => {
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
        alert("Failed to fetch saved grid data:");
        // 保存されたgridDataの取得に失敗した場合、既存のロジックを実行

        fetchImages();
      }
    };

    const fetchImages = async () => {
      try {
        const response = await fetch(
          // `https://www.teraos.net/sptokyo7/api/v2/shaddy/image_List.php?id=${nombre}`
          `https://www.teraos.net/sptokyo/shaddy/image_List_secound.php?filename=台割作成&nombre=${nombre}`
        );

        const data = await response.json();
        if (data) {
          fetchData(data)
            .then((results) => {
              console.log(results); // 全てのresponseDataを含む配列を表示
              // ここで取得したdataをgridDataの形式に合わせて加工
              // この例では、取得した画像リストの先頭から4x4のグリッドを埋めるものと仮定
              const newGridData = Array(rows)
                .fill()
                .map((_, rowIndex) =>
                  Array(cols)
                    .fill()
                    .map((_, colIndex) => {
                      // console.log(colIndex + ":" + rowIndex);
                      const imageIndex = rowIndex * cols + colIndex;
                      console.log(imageIndex);
                      return results[imageIndex]
                        ? `https://www.teraos.net/sptokyo7/api/v2/shaddy/image_preview.php?assetid=${results[imageIndex]}`
                        : null; // ここでは画像のURLをセットすると仮定
                    })
                );
              console.log(newGridData);
              setGridData(newGridData);
            })
            .catch((error) => {
              console.error("Error fetching data: ", error);
            });
        } else {
          return;
        }
      } catch (error) {
        console.error("Failed to fetch images:", error);
      }
    };

    const fetchData = async (data) => {
      const promises = data.map(async (item) => {
        const applicationNo = item; //申込番号　画像のファイル名

        const apiUrl = `https://www.teraos.net/sptokyo7/api/v2/shaddy/assetID_search.php?id=${applicationNo}`;
        console.log(apiUrl);
        const res = await fetch(apiUrl);
        const responseData = await res.json();
        return responseData; // この行が各プロミスが解決された値を返します
      });
      const results = await Promise.all(promises);
      return results; // 全てのresponseDataが含まれた配列を返します
    };

    if (nombre) {
      fetchSavedGridData();
    }
  }, [gridSize]); // 空の依存配列を指定して、コンポーネントのマウント時にのみ実行

  const initializeGridData = useCallback(
    (newRows, newCols) => {
      // 現在のgridDataから全ての画像URLを抽出し、一次元配列に平坦化する
      const allImages = gridData.flat().filter((image) => image !== null);

      // 新しいグリッドサイズに基づいて空のグリッドデータを作成
      let newGridData = Array(newRows)
        .fill()
        .map(() => Array(newCols).fill(null));
      let imageIndex = 0; // allImages内での現在の画像のインデックス

      // 新しいグリッドデータに画像を流し込む
      for (let rowIndex = 0; rowIndex < newRows; rowIndex++) {
        for (let colIndex = 0; colIndex < newCols; colIndex++) {
          if (imageIndex < allImages.length) {
            newGridData[rowIndex][colIndex] = allImages[imageIndex];
            imageIndex++;
          }
        }
      }

      // 新しいグリッドデータをセット
      setGridData(newGridData);

      // グリッドサイズを更新
      setGridSize({ rows: newRows, cols: newCols });
    },
    [gridData]
  );

  // const handleDragStart = (e, index) => {
  //   const dragData = JSON.stringify({
  //     index,
  //     fromList: true,
  //   });
  //   e.dataTransfer.setData("application/json", dragData);
  // };

  const handleGridDragStart = useCallback((e, rowIndex, cellIndex) => {
    const dragData = JSON.stringify({
      rowIndex,
      cellIndex,
      fromGrid: true,
    });
    e.dataTransfer.setData("application/json", dragData);
  }, []);

  const handleDrop = useCallback(
    (e, dropRowIndex, dropCellIndex) => {
      e.preventDefault();
      setSelectedGridImageIndex(null);
      const data = JSON.parse(e.dataTransfer.getData("application/json"));

      if (data.fromList) {
        const imageUrl = imageList[data.index];
        // 外部からのドロップ
        const newData = [...gridData];
        newData[dropRowIndex][dropCellIndex] = imageUrl;
        setGridData(newData);

        // 画像リストから削除
        setImageList((prevImages) =>
          prevImages.filter((_, idx) => idx !== data.index)
        );
      } else if (data.fromGrid) {
        // グリッド内でのドロップ、元の位置と新しい位置の画像を交換
        const newData = [...gridData]; //gridDataの展開
        const temp = newData[dropRowIndex][dropCellIndex];
        newData[dropRowIndex][dropCellIndex] =
          newData[data.rowIndex][data.cellIndex];
        newData[data.rowIndex][data.cellIndex] = temp;
        setGridData(newData);
      } else if (data.fromDragArea) {
        // ドロップエリアからのドラッグの場合
        const imageUrl = draggedImages[data.index];
        const newData = [...gridData];
        newData[dropRowIndex][dropCellIndex] = imageUrl; // 新しい位置に画像を設定
        setGridData(newData);

        // ドロップエリアから画像を削除
        setDraggedImages((prevImages) =>
          prevImages.filter((_, idx) => idx !== data.index)
        );
      }
    },
    [imageList, gridData, draggedImages]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault(); // ドロップを許可する
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // グリッドの画像をクリックしたときの処理（モーダルを開く + 選択状態を更新）
  const handleGridImageClick = useCallback((rowIndex, cellIndex, imageUrl) => {
    // モーダルを開く処理
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
    // 選択された画像のインデックスを更新
    setSelectedGridImageIndex(`${rowIndex}-${cellIndex}`);
  }, []);

  const handleDropOnDragArea = useCallback(
    (e) => {
      e.preventDefault();
      const { rowIndex, cellIndex, fromGrid } = JSON.parse(
        e.dataTransfer.getData("application/json")
      );

      if (fromGrid) {
        const imageUrl = gridData[rowIndex][cellIndex];
        setDraggedImages((prev) => [...prev, imageUrl]); // draggedImages に画像を追加

        // gridData から該当する画像を削除
        setGridData((prevGridData) => {
          const newGridData = [...prevGridData];
          newGridData[rowIndex][cellIndex] = null;
          return newGridData;
        });
      }
    },
    [gridData]
  );

  // レンダリングを効率化するために、gridTemplateColumns のスタイルを useMemo でメモ化
  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
    }),
    [gridSize.cols]
  );

  // const handleImagesSelected = (images) => {
  //   setImageList((prevImages) => [...prevImages, ...images]);
  // };

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

    const postData = {
      images: gridData.flatMap(
        (row, rowIndex) =>
          row
            .map((cell, cellIndex) => ({
              imageUrl: cell, // 画像のURL
              rowIndex, // 行インデックス
              cellIndex, // セルインデックス
            }))
            .filter((cell) => cell.imageUrl !== null) // nullでないセルのみを対象とする
      ),
      gridSize: gridSize, // グリッドサイズを追加
    };
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

  const handleDragStartOnDragArea = (e, index) => {
    const dragData = JSON.stringify({
      index,
      fromDragArea: true, // ドラッグエリアからのドラッグを示す
    });
    e.dataTransfer.setData("application/json", dragData);
  };

  return (
    <div>
      <Title row={gridSize.rows} col={gridSize.cols} />
      <div className="flex p-4">
        {/* <div>
        <ImageUploader handleImagesSelected={handleImagesSelected} />
        <ImageList imageList={imageList} handleDragStart={handleDragStart} />
      </div> */}
        <GridControls
          downloadGridDataAsCSV={downloadGridDataAsCSV}
          postGridData={postGridData}
          initializeGridData={initializeGridData}
        />

        <div className="grid gap-1 ml-4" style={gridStyle}>
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

        {/* ドラッグされた画像を表示するドロップエリア */}
        <div
          className="flex overflow-auto border-2 border-dashed border-gray-300 bg-white  ml-2"
          style={{ minHeight: "100px", minWidth: "300px" }} // ドロップエリアの最小高さを設定
          onDrop={handleDropOnDragArea}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="grid grid-cols-3 grid-rows-4 gap-1">
            {draggedImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Dragged-${index}`}
                draggable="true"
                onDragStart={(e) => handleDragStartOnDragArea(e, index)} // この関数を追加します
                className="w-32 h-32 mr-2 p-2"
              />
            ))}
          </div>
        </div>
        <Modal
          selectedImage={selectedImage}
          isModalOpen={isModalOpen}
          closeModal={closeModal}
        />
      </div>
    </div>
  );
}
