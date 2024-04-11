export function GridControls({
  downloadGridDataAsCSV,
  postGridData,
  initializeGridData,
}) {
  return (
    <div className="flex flex-col -mx-1 overflow-hidden">
      <button
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={downloadGridDataAsCSV}
      >
        CSVダウンロード
      </button>
      <button
        className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 mt-2 rounded"
        onClick={postGridData}
      >
        Grid DataをPOST
      </button>
      {[
        { size: [3, 4], label: "3×4 グリッドに変更" },
        { size: [3, 3], label: "3×3 グリッドに変更" },
        { size: [4, 4], label: "4×4 グリッドに変更" },
      ].map((item) => (
        <button
          key={item.label}
          className="w-full bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 mt-2 rounded"
          onClick={() => initializeGridData(...item.size)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
