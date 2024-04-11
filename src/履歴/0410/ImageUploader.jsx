export function ImageUploader(props) {
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.match("image.*")
    );

    // ファイル読み込みの非同期処理を定義
    const readFile = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });
    };

    // 各ファイルに対してreadFileを呼び出し、Promiseの配列を作成
    const readers = files.map((file) => readFile(file));

    // Promise.allを使って、全てのファイル読み込みが完了するのを待つ
    const images = await Promise.all(readers);

    // 画像リストの状態を更新
    props.handleImagesSelected(images);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
}
