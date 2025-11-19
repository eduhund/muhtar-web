import { useMemo } from "react";
import { Button } from "antd";
import { TimetableItem } from "../../../context/AppContext";

type Props = {
  data: TimetableItem[];
  filteredData: TimetableItem[];
  filters: { [key: string]: unknown };
  selection: {
    selectedRowKeys: React.Key[];
    onChange: (selectedRowKeys: React.Key[]) => void;
  };
};

export default function TotalHint({
  data,
  filteredData,
  filters,
  selection,
}: Props) {
  const { selectedRowKeys, onChange } = selection;
  const total = useMemo(() => {
    if (
      Object.keys(filters).length === 0 &&
      Object.keys(selectedRowKeys).length === 0
    ) {
      return null;
    } else if (selectedRowKeys.length > 0) {
      return selectedRowKeys.reduce((prev: number, curr: React.Key) => {
        const selectedItem = data.find(
          (item: TimetableItem) => item.id === curr
        );
        return prev + (selectedItem?.duration ?? 0) / 60;
      }, 0);
    } else {
      return filteredData.reduce(
        (prev: number, curr: TimetableItem) => prev + curr.duration / 60,
        0
      );
    }
  }, [data, filteredData, filters, selectedRowKeys]);

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
          {`Selected ${selectedRowKeys.length} item${
            selectedRowKeys.length !== 1 ? "s" : ""
          }. Spent ${total} hour${total !== 1 ? "s" : ""}`}
          <Button type="link" onClick={resetSelectionHandler}>
            Reset
          </Button>
        </>
      ) : (
        hasFiltered &&
        `Filtered ${filteredData.length} item${
          filteredData.length !== 1 ? "s" : ""
        }. Spent ${total} hour${total !== 1 ? "s" : ""}`
      )}
    </div>
  );
}
