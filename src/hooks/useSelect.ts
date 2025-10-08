import { useState, useEffect } from "react";

export function useSelect(data: any) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const rowSelection: any = {
    type: "checkbox",
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const onRowClick = (record: any, index: any) => ({
    onClick: (e: any) => handleRowClick(record, index, e),
    onMouseDown: handleRowMouseDown(index),
    onMouseEnter: handleRowMouseEnter(index),
  });

  const handleRowClick = (record: any, index: number, e: React.MouseEvent) => {
    if (e.shiftKey) {
      if (lastClickedIndex !== null) {
        const start = Math.min(lastClickedIndex, index);
        const end = Math.max(lastClickedIndex, index);
        const newKeys = data.slice(start, end + 1).map((item: any) => item.key);
        setSelectedRowKeys([...new Set([...selectedRowKeys, ...newKeys])]);
      } else {
        setSelectedRowKeys([record.key]);
      }
    } else {
      if (selectedRowKeys.includes(record.key)) {
        setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.key));
      } else {
        setSelectedRowKeys([...selectedRowKeys, record.key]);
      }
      setLastClickedIndex(index);
    }
  };

  const handleRowMouseDown = (index: number) => (e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      setDragStartIndex(index);
      setIsDragging(true);
    }
  };

  const handleRowMouseEnter = (index: number) => () => {
    if (isDragging && dragStartIndex !== null) {
      const start = Math.min(dragStartIndex, index);
      const end = Math.max(dragStartIndex, index);
      const newKeys = data.slice(start, end + 1).map((item: any) => item.key);
      setSelectedRowKeys([...new Set([...selectedRowKeys, ...newKeys])]);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartIndex(null);
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return { rowSelection, onRowClick };
}
