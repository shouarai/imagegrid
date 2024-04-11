export function Modal(props) {
  return (
    <div className="flex">
      {props.isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={props.closeModal} // モーダルの外側をクリックして閉じる
        >
          <div
            className="bg-white p-4 rounded-lg"
            style={{ width: "300px", height: "300px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={props.selectedImage}
              alt=""
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
