export function Title({ row, col }) {
  return (
    <div className="text-2xl">
      <h1>
        {row}×{col}
      </h1>
    </div>
  );
}
