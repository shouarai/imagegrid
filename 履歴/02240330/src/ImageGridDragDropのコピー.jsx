import React, { useState } from "react";
import { Modal } from "./Modal";
import { ImageUploader } from "./ImageUploader";
import { ImageList } from "./ImageList";

export function ImageGridDragDrop() {
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
      const newData = [...gridData];
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

  return (
    <div className="flex">
      <div>
        <ImageUploader handleImagesSelected={handleImagesSelected} />
        <ImageList imageList={imageList} handleDragStart={handleDragStart} />
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
