import { useMemo } from "react";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { TimetableItem } from "../../../context/AppContext";
import { UpOutlined } from "@ant-design/icons";
import { useProjects } from "../../../hooks/useProjects";
import { useUIMessages } from "../../../providers/UIMessageProvider";
import { useTimetable } from "../../../hooks/useTimetable";

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
  const { updateResources } = useTimetable();
  const { activeProjects } = useProjects();
  const UIMessages = useUIMessages();

  const selectedProjectId = useMemo(() => {
    if (!selectedRowKeys.length) return null;
    const firstProjectId = data.find(
      (item: TimetableItem) => item.id === selectedRowKeys[0]
    )?.project?.id;
    const allSame = selectedRowKeys.every(
      (item) => data.find((d) => d.id === item)?.project?.id === firstProjectId
    );
    return allSame ? firstProjectId : null;
  }, [selectedRowKeys, data]);

  const selectedProject = useMemo(() => {
    if (!activeProjects || !selectedProjectId) return null;
    return activeProjects.find((project) => project.id === selectedProjectId);
  }, [activeProjects, selectedProjectId]);

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

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Set a job",
      disabled: !selectedProjectId,
      children: selectedProject?.activePlan?.jobs?.length
        ? selectedProject?.activePlan?.jobs.map((job) => ({
            key: job.id,
            label: job.name,
            onClick: async () => {
              const entires = selectedRowKeys
                .map((key) => {
                  const item = filteredData.find((d) => d.id === key);
                  if (item) {
                    return {
                      id: item.id,
                      date: item.date,
                      target: { type: "job", id: job.id },
                    };
                  }
                })
                .filter((item) => item !== undefined) as {
                id: string;
                date: string;
                target: { type: "job"; id: string };
              }[];
              const { success, failed } = await updateResources(entires);
              if (success.length === entires.length) {
                UIMessages?.updateTime.success();
              }
              if (failed.length > 0) {
                UIMessages?.updateTime.error();
              }
            },
          }))
        : [{ key: "no-jobs", label: "No jobs available", disabled: true }],
    },
  ];

  return (
    <div id="totalHint">
      {hasSelected ? (
        <>
          {`Selected ${selectedRowKeys.length} item${
            selectedRowKeys.length !== 1 ? "s" : ""
          }. Spent ${total} hour${total !== 1 ? "s" : ""}`}
          <Dropdown
            menu={{ items }}
            placement="topLeft"
            overlayStyle={{ minWidth: 200 }}
          >
            <Button type="link" icon={<UpOutlined />} iconPosition="end">
              Actions
            </Button>
          </Dropdown>
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
