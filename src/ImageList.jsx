export function ImageList({ imageList, handleDragStart }) {
  return (
    <div className="image-list">
      {imageList.map((imageUrl, index) => (
        <img
          key={index}
          src={imageUrl}
          alt=""
          draggable="true"
          onDragStart={(e) => handleDragStart(e, index)}
          className="m-2 w-24 h-24 cursor-pointer"
        />
      ))}
    </div>
  );
}
