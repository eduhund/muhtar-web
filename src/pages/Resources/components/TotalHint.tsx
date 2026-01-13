import { useMemo } from "react";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { Resource } from "../../../context/AppContext";
import { useProjects } from "../../../hooks/useProjects";
import { useUIMessages } from "../../../providers/UIMessageProvider";
import { useResources } from "../../../hooks/useResources";
import { useMembership } from "../../../hooks/useMembership";

type Props = {
  data: Resource[];
  filteredData: Resource[];
  filters: { [key: string]: unknown };
  selection: {
    selectedRowKeys: React.Key[];
    onChange: (selectedRowKeys: React.Key[]) => void;
  };
};

export default function TotalHint({ filteredData, filters, selection }: Props) {
  const { selectedRowKeys, onChange } = selection;
  const { updateResources } = useResources();
  const { projects, activeProjects } = useProjects();
  const { membership } = useMembership();
  const UIMessages = useUIMessages();

  const selectedEntries = useMemo(() => {
    return filteredData.filter((item: Resource) =>
      selectedRowKeys.includes(item.id)
    );
  }, [selectedRowKeys, filteredData]);

  const selectedProjectId = useMemo(() => {
    if (!selectedRowKeys.length) return null;
    const firstProjectId = selectedEntries.find(
      (item: Resource) => item.id === selectedRowKeys[0]
    )?.project?.id;
    const allSame = selectedRowKeys.every(
      (item) =>
        selectedEntries.find((d) => d.id === item)?.project?.id ===
        firstProjectId
    );
    return allSame ? firstProjectId : null;
  }, [selectedRowKeys, selectedEntries]);

  const selectedProject = useMemo(() => {
    if (!activeProjects || !selectedProjectId) return null;
    return activeProjects.find((project) => project.id === selectedProjectId);
  }, [activeProjects, selectedProjectId]);

  const canEditResources = useMemo(() => {
    if (membership?.accessRole === "admin") return true;
    let isAdmin = true;
    selectedEntries.forEach((entry) => {
      if (entry.membership.id !== membership?.id) {
        const project = projects?.find((proj) => proj.id === entry.project?.id);
        isAdmin =
          project?.memberships.find((m) => m.membershipId === membership?.id)
            ?.accessRole === "admin";
      }
      return true;
    });
    return isAdmin;
  }, [membership, selectedEntries, projects]);

  const total = useMemo(() => {
    if (
      Object.keys(filters).length === 0 &&
      Object.keys(selectedRowKeys).length === 0
    ) {
      return null;
    } else if (selectedRowKeys.length > 0) {
      return selectedRowKeys.reduce((prev: number, curr: React.Key) => {
        const selectedItem = selectedEntries.find(
          (item: Resource) => item.id === curr
        );
        return prev + (selectedItem?.consumed ?? 0) / 60;
      }, 0);
    } else {
      return filteredData.reduce(
        (prev: number, curr: Resource) => prev + curr.consumed / 60,
        0
      );
    }
  }, [selectedEntries, filteredData, filters, selectedRowKeys]);

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
              const entries = selectedRowKeys
                .map((key) => {
                  const item = selectedEntries.find((d) => d.id === key);
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
              const { success, failed } = await updateResources(entries);
              if (success.length === entries.length) {
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
    <div
      id="totalHint"
      className={
        "totalHint" +
        (hasSelected ? " totalHint-selected" : "") +
        (hasFiltered ? " totalHint-filtered" : "")
      }
    >
      {hasSelected ? (
        <>
          {`Selected ${selectedRowKeys.length} item${
            selectedRowKeys.length !== 1 ? "s" : ""
          }. Spent ${total} hour${total !== 1 ? "s" : ""}`}
          <div className="totalHint-actions">
            <Dropdown
              menu={{ items }}
              disabled={!canEditResources}
              placement="topLeft"
              overlayStyle={{ minWidth: 200 }}
            >
              <Button type="link" disabled={!canEditResources}>
                Actions
              </Button>
            </Dropdown>
            <Button type="link" onClick={resetSelectionHandler}>
              Reset
            </Button>
          </div>
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
