import { useMemo } from "react";

import { Button } from "antd";

export function TotalHint({ data, filteredData, filters, selection }: any) {
  const { selectedRowKeys, onChange } = selection;
  const total = useMemo(() => {
    if (
      Object.keys(filters).length === 0 &&
      Object.keys(selectedRowKeys).length === 0
    ) {
      return null;
    } else if (selectedRowKeys.length > 0) {
      return selectedRowKeys.reduce((prev: any, curr: any) => {
        return prev + data[curr]?.duration || 0;
      }, 0);
    } else {
      return filteredData.reduce(
        (prev: any, curr: any) => prev + curr.duration,
        0
      );
    }
  }, [filters, selectedRowKeys]);

  const hasSelected = selectedRowKeys.length > 0;
  const hasFiltered = Object.keys(filters).length > 0;

  if (!(hasSelected || hasFiltered)) return null;

  function resetSelectionHandler() {
    onChange([]);
  }

  return (
    <div id="totalHint">
      {hasSelected ? (
        <>
          {`Выбрано ${selectedRowKeys.length} записей. Затрачено ${total} часов`}
          <Button type="link" onClick={resetSelectionHandler}>
            Сбросить выделение
          </Button>
        </>
      ) : (
        hasFiltered &&
        `Отфильтровано ${filteredData.length} записей. Затрачено ${total} часов`
      )}
    </div>
  );
}
