import React, { useState, useMemo, useCallback } from "react";
import { Button, Form, Radio, Select } from "antd";
import { GanttItem, Role, ProjectAssignment } from "./types";
import {
  calculateMetrics,
  formatDuration,
  getWeekNumber,
  formatWeekRange,
} from "./utils";

import "./ResourcePlanner.scss";
import { CheckboxGroupProps } from "antd/lib/checkbox/Group";
import { useProjects } from "../../hooks/useProjects";

interface ProjectData {
  id: string;
  name: string;
  companyName: string; // Add company name
  startDate: Date;
  dueDate: Date;
  roles: Role[]; // Resource plan by role
  assignments: ProjectAssignment[]; // People assigned to roles
}

interface WeekData {
  weekStart: Date;
  weekEnd: Date;
  weekNumber: number;
  year: number;
}

type UnitToShow = "workers" | "roles";
type ResourceType = "time" | string;

// Weekly capacity for each worker (in hours)
const WORKERS_WEEKLY_CAPACITY: { [worker: string]: number } = {
  "Sarah Johnson": 40,
  "Emily Davis": 40,
  "Alex Rodriguez": 40,
  "Lisa Wang": 40,
  "Tom Zhang": 40,
  "David Kim": 40,
  "Mike Chen": 40,
};

// Store for resource overrides
interface ResourceOverride {
  [projectId: string]: {
    roles?: {
      [roleKey: string]: {
        [resourceType: string]: number;
      };
    };
    workers?: {
      [workerName: string]: {
        role: string; // Track which role this worker has in this project
        [resourceType: string]: number;
      };
    };
  };
}

const options: CheckboxGroupProps<string>["options"] = [
  { label: "Workers", value: "workers" },
  { label: "Roles", value: "roles" },
];

// Helper to get all unique workers/roles from projectsData
const extractWorkersAndRoles = (
  projectsData: ProjectData[]
): { workers: Set<string>; roles: Set<string> } => {
  const workers = new Set<string>();
  const roles = new Set<string>();

  projectsData.forEach((project) => {
    project.roles.forEach((role) => {
      roles.add(role.key);
    });
    project.assignments.forEach((assignment) => {
      workers.add(assignment.worker);
    });
  });

  return { workers, roles };
};

// Helper to get resource types from projectsData
const extractResourceTypes = (projectsData: ProjectData[]): string[] => {
  const types = new Set<string>();

  projectsData.forEach((project) => {
    project.roles.forEach((role) => {
      role.resources.forEach((resource) => {
        types.add(resource.type);
      });
    });
  });

  return Array.from(types);
};

// Helper to calculate resource allocation for a worker/role in a project for a specific week
const getResourceForWeek = (
  project: ProjectData,
  workerOrRole: string,
  weekStart: Date,
  weekEnd: Date,
  resourceType: string,
  unitToShow: UnitToShow,
  resourceOverrides: ResourceOverride
): number => {
  // Check if project overlaps with the week
  if (project.dueDate < weekStart || project.startDate > weekEnd) {
    return 0;
  }

  let totalResource = 0;

  if (unitToShow === "roles") {
    // Roles view: just sum up the role's resources
    const role = project.roles.find((r) => r.key === workerOrRole);
    if (role) {
      const resource = role.resources.find((r) => r.type === resourceType);
      if (resource) {
        // Calculate overlap days
        const projectStart =
          project.startDate > weekStart ? project.startDate : weekStart;
        const projectEnd =
          project.dueDate < weekEnd ? project.dueDate : weekEnd;

        const overlapDays =
          Math.ceil(
            (projectEnd.getTime() - projectStart.getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1;
        const projectDays =
          Math.ceil(
            (project.dueDate.getTime() - project.startDate.getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1;

        // Distribute resource proportionally across the week
        if (projectDays > 0) {
          const weeklyResource = (resource.value / projectDays) * overlapDays;
          totalResource += weeklyResource;
        }
      }
    }
  } else {
    // People view: distribute role resources among assigned workers
    // Note: Each worker can only have one role per project
    // For each role, check if this worker is assigned to it
    project.roles.forEach((role) => {
      // Find all workers assigned to this role on this project
      const workersInRole = project.assignments.filter(
        (a) => a.role === role.key
      );
      const workerCount = workersInRole.length;

      // Check if the worker we're looking for is in this role
      const isPersonInRole = workersInRole.some(
        (a) => a.worker === workerOrRole
      );

      if (isPersonInRole && workerCount > 0) {
        const resource = role.resources.find((r) => r.type === resourceType);
        if (resource) {
          // Calculate overlap days
          const projectStart =
            project.startDate > weekStart ? project.startDate : weekStart;
          const projectEnd =
            project.dueDate < weekEnd ? project.dueDate : weekEnd;

          const overlapDays =
            Math.ceil(
              (projectEnd.getTime() - projectStart.getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1;
          const projectDays =
            Math.ceil(
              (project.dueDate.getTime() - project.startDate.getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1;

          // Distribute resource proportionally across the week, then divide by number of workers in role
          if (projectDays > 0) {
            const weeklyResource = (resource.value / projectDays) * overlapDays;
            const workerShare = weeklyResource / workerCount;
            totalResource += workerShare;
          }
        }
      }
    });
  }

  // Apply resource overrides
  if (resourceOverrides[project.id]) {
    if (
      unitToShow === "roles" &&
      resourceOverrides[project.id].roles &&
      resourceOverrides[project.id].roles[workerOrRole]
    ) {
      const override =
        resourceOverrides[project.id].roles[workerOrRole][resourceType];
      if (override !== undefined) {
        totalResource = override;
      }
    } else if (
      unitToShow === "workers" &&
      resourceOverrides[project.id].workers &&
      resourceOverrides[project.id].workers[workerOrRole]
    ) {
      const override =
        resourceOverrides[project.id].workers[workerOrRole][resourceType];
      if (override !== undefined) {
        totalResource = override;
      }
    }
  }

  return totalResource;
};

// Generate weeks around current date
const generateWeeks = (
  centerDate: Date,
  weeksBefore: number = 4,
  weeksAfter: number = 4
): WeekData[] => {
  const weeks: WeekData[] = [];

  // Find the Monday of the week containing centerDate
  const centerWeekStart = new Date(centerDate);
  const dayOfWeek = centerWeekStart.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  centerWeekStart.setDate(centerWeekStart.getDate() + daysToMonday);
  centerWeekStart.setHours(0, 0, 0, 0);

  // Generate weeks
  for (let i = -weeksBefore; i <= weeksAfter; i++) {
    const weekStart = new Date(centerWeekStart);
    weekStart.setDate(weekStart.getDate() + i * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    weeks.push({
      weekStart,
      weekEnd,
      weekNumber: getWeekNumber(weekStart),
      year: weekStart.getFullYear(),
    });
  }

  return weeks;
};

export function ResourcesPlanner() {
  const [unitToShow, setUnitToShow] = useState<UnitToShow>("workers");

  const { activeProjects } = useProjects();

  const projectsData = useMemo(() => {
    return (activeProjects || []).map((proj) => {
      return {
        id: proj.id,
        name: proj.customer ? `${proj.customer} - ${proj.name}` : proj.name,
      };
    });
  }, [activeProjects]);

  console.log("Projects Data:", projectsData);

  const currentDate = useMemo(() => new Date(), []);

  // Generate all weeks
  const allWeeks = useMemo(
    () => generateWeeks(currentDate, 8, 8),
    [currentDate]
  );

  // State
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(8); // Center week
  const [selectedResourceType, setSelectedResourceType] =
    useState<ResourceType>("time");
  const [resourceOverrides, setResourceOverrides] = useState<ResourceOverride>(
    {}
  );
  const [editingCell, setEditingCell] = useState<{
    projectId: string;
    column: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Get current week - MUST be before callbacks that use it
  const selectedWeek = allWeeks[selectedWeekIndex];

  // Rounding helper
  const roundValue = useCallback(
    (value: number, resourceType: string): number => {
      if (resourceType === "time") {
        // Round to nearest 0.5 (30 minutes)
        return Math.round(value * 2) / 2;
      }
      // Round to nearest 1
      return Math.round(value);
    },
    []
  );

  // Handle cell value change
  const handleCellChange = useCallback(
    (projectId: string, column: string, newValue: number) => {
      const project = projectsData.find((p) => p.id === projectId);
      if (!project) return;

      const rounded = roundValue(newValue, selectedResourceType);

      setResourceOverrides((prev) => {
        const updated = { ...prev };

        if (!updated[projectId]) {
          updated[projectId] = {};
        }

        if (unitToShow === "workers") {
          // Editing a worker's value
          const worker = column;

          // Find which role this worker has in this project
          const assignment = project.assignments.find(
            (a) => a.worker === worker
          );
          if (!assignment) return prev;

          const roleKey = assignment.role;

          // Initialize workers overrides if needed
          if (!updated[projectId].workers) {
            updated[projectId].workers = {};
          }
          if (!updated[projectId].workers[worker]) {
            updated[projectId].workers[worker] = { role: roleKey };
          }

          // Set the new value for this worker
          updated[projectId].workers[worker][selectedResourceType] = rounded;

          // Recalculate role total as sum of all workers in this role
          const workersInRole = project.assignments.filter(
            (a) => a.role === roleKey
          );
          let roleTotal = 0;

          workersInRole.forEach((a) => {
            const workerName = a.worker;
            if (
              updated[projectId].workers &&
              updated[projectId].workers[workerName] &&
              updated[projectId].workers[workerName][selectedResourceType] !==
                undefined
            ) {
              roleTotal +=
                updated[projectId].workers[workerName][selectedResourceType];
            } else {
              // Use original value
              const originalValue = getResourceForWeek(
                project,
                workerName,
                selectedWeek.weekStart,
                selectedWeek.weekEnd,
                selectedResourceType,
                "workers",
                {}
              );
              roleTotal += originalValue;
            }
          });

          // Update role total
          if (!updated[projectId].roles) {
            updated[projectId].roles = {};
          }
          if (!updated[projectId].roles[roleKey]) {
            updated[projectId].roles[roleKey] = {};
          }
          updated[projectId].roles[roleKey][selectedResourceType] = roundValue(
            roleTotal,
            selectedResourceType
          );
        } else {
          // Editing a role's value
          const roleKey = column;

          // Initialize roles overrides if needed
          if (!updated[projectId].roles) {
            updated[projectId].roles = {};
          }
          if (!updated[projectId].roles[roleKey]) {
            updated[projectId].roles[roleKey] = {};
          }

          // Get the original role total
          const originalRoleTotal = getResourceForWeek(
            project,
            roleKey,
            selectedWeek.weekStart,
            selectedWeek.weekEnd,
            selectedResourceType,
            "roles",
            {}
          );

          // Calculate the difference
          const difference = rounded - originalRoleTotal;

          // Get all workers in this role
          const workersInRole = project.assignments.filter(
            (a) => a.role === roleKey
          );

          if (workersInRole.length > 0) {
            // Calculate current total for these workers
            let currentWorkersTotal = 0;
            const currentWorkersValues: { [worker: string]: number } = {};

            workersInRole.forEach((a) => {
              const workerName = a.worker;
              let workerValue = 0;
              if (
                updated[projectId].workers &&
                updated[projectId].workers[workerName] &&
                updated[projectId].workers[workerName][selectedResourceType] !==
                  undefined
              ) {
                workerValue =
                  updated[projectId].workers[workerName][selectedResourceType];
              } else {
                workerValue = getResourceForWeek(
                  project,
                  workerName,
                  selectedWeek.weekStart,
                  selectedWeek.weekEnd,
                  selectedResourceType,
                  "workers",
                  {}
                );
              }
              currentWorkersValues[workerName] = workerValue;
              currentWorkersTotal += workerValue;
            });

            // Distribute the difference proportionally
            if (!updated[projectId].workers) {
              updated[projectId].workers = {};
            }

            workersInRole.forEach((a) => {
              const workerName = a.worker;
              const currentValue = currentWorkersValues[workerName];

              if (!updated[projectId].workers[workerName]) {
                updated[projectId].workers[workerName] = { role: roleKey };
              }

              let newWorkerValue = currentValue;

              if (currentWorkersTotal > 0) {
                // Distribute proportionally
                const proportion = currentValue / currentWorkersTotal;
                newWorkerValue = currentValue + difference * proportion;
              } else {
                // Equal distribution
                newWorkerValue = rounded / workersInRole.length;
              }

              updated[projectId].workers[workerName][selectedResourceType] =
                roundValue(newWorkerValue, selectedResourceType);
            });
          }

          // Set the new role value
          updated[projectId].roles[roleKey][selectedResourceType] = rounded;
        }

        return updated;
      });
    },
    [projectsData, unitToShow, selectedResourceType, selectedWeek, roundValue]
  );

  // Start editing a cell
  const startEditing = useCallback(
    (projectId: string, column: string, currentValue: number) => {
      setEditingCell({ projectId, column });
      if (selectedResourceType === "time") {
        // Show hours for editing
        setEditValue((currentValue / 60).toFixed(1));
      } else {
        setEditValue(
          currentValue.toFixed(selectedResourceType === "budget" ? 0 : 1)
        );
      }
    },
    [selectedResourceType]
  );

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingCell(null);
    setEditValue("");
  }, []);

  // Commit the edit
  const commitEdit = useCallback(() => {
    if (!editingCell) return;

    const parsed = parseFloat(editValue);
    if (isNaN(parsed)) {
      cancelEditing();
      return;
    }

    let finalValue = parsed;
    if (selectedResourceType === "time") {
      // Convert hours back to minutes
      finalValue = parsed * 60;
    }

    // Save values before closing edit mode
    const projectId = editingCell.projectId;
    const column = editingCell.column;

    // Close editing FIRST to prevent re-render issues
    cancelEditing();

    // Then update the data
    handleCellChange(projectId, column, finalValue);
  }, [
    editingCell,
    editValue,
    selectedResourceType,
    handleCellChange,
    cancelEditing,
  ]);

  // Handle key press in edit input
  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        commitEdit();
      } else if (e.key === "Escape") {
        cancelEditing();
      }
    },
    [commitEdit, cancelEditing]
  );

  // Check if selected week is the current week
  const isCurrentWeek = useMemo(() => {
    return (
      currentDate >= selectedWeek.weekStart &&
      currentDate <= selectedWeek.weekEnd
    );
  }, [currentDate, selectedWeek]);

  // Extract workers, roles, and resource types
  const { workers, roles } = useMemo(
    () => extractWorkersAndRoles(projectsData),
    [projectsData]
  );
  const resourceTypes = useMemo(
    () => extractResourceTypes(projectsData),
    [projectsData]
  );

  // Get list of workers or roles based on view type
  const columns = useMemo(() => {
    const list =
      unitToShow === "workers" ? Array.from(workers) : Array.from(roles);
    return list.sort();
  }, [unitToShow, workers, roles]);

  // Calculate cell values
  const getCellValue = useCallback(
    (project: ProjectData, column: string): number => {
      return getResourceForWeek(
        project,
        column,
        selectedWeek.weekStart,
        selectedWeek.weekEnd,
        selectedResourceType,
        unitToShow,
        resourceOverrides
      );
    },
    [selectedWeek, selectedResourceType, unitToShow, resourceOverrides]
  );

  // Calculate column totals
  const columnTotals = useMemo(() => {
    const totals = new Map<string, number>();
    columns.forEach((column) => {
      const total = projectsData.reduce(
        (sum, project) => sum + getCellValue(project, column),
        0
      );
      totals.set(column, total);
    });
    return totals;
  }, [columns, projectsData, getCellValue]);

  // Calculate original planned values (without overrides) for roles
  const columnPlannedValues = useMemo(() => {
    const planned = new Map<string, number>();
    if (unitToShow === "roles") {
      columns.forEach((column) => {
        const total = projectsData.reduce((sum, project) => {
          // Get original value without overrides
          return (
            sum +
            getResourceForWeek(
              project,
              column,
              selectedWeek.weekStart,
              selectedWeek.weekEnd,
              selectedResourceType,
              unitToShow,
              {}
            )
          );
        }, 0);
        planned.set(column, total);
      });
    }
    return planned;
  }, [columns, projectsData, unitToShow, selectedWeek, selectedResourceType]);

  // Week navigation
  const goToPreviousWeek = () => {
    if (selectedWeekIndex > 0) {
      setSelectedWeekIndex(selectedWeekIndex - 1);
    }
  };

  const goToNextWeek = () => {
    if (selectedWeekIndex < allWeeks.length - 1) {
      setSelectedWeekIndex(selectedWeekIndex + 1);
    }
  };

  const goToCurrentWeek = () => {
    const currentWeekIndex = allWeeks.findIndex(
      (week) => currentDate >= week.weekStart && currentDate <= week.weekEnd
    );
    if (currentWeekIndex !== -1) {
      setSelectedWeekIndex(currentWeekIndex);
    }
  };

  // Format cell value for display
  const formatCellValue = (value: number): string => {
    if (value === 0) return "—";
    if (selectedResourceType === "time") {
      return formatDuration(value);
    }
    if (selectedResourceType === "budget") {
      return `$${value.toFixed(0)}`;
    }
    return value.toFixed(1);
  };

  // Get cell color intensity based on value
  const getCellStyle = (
    value: number,
    maxValue: number
  ): React.CSSProperties => {
    if (value === 0) return {};
    const intensity = Math.min(value / maxValue, 1);
    const alpha = 0.1 + intensity * 0.4; // Range from 0.1 to 0.5
    return {
      backgroundColor: `rgba(59, 130, 246, ${alpha})`,
      fontWeight: intensity > 0.7 ? 500 : 400,
    };
  };

  // Get capacity status for a worker (only applies to workers view + time resource)
  const getCapacityStatus = useCallback(
    (
      worker: string,
      totalMinutes: number
    ): "overloaded" | "underutilized" | "normal" => {
      // Only check capacity for workers view and time resource
      if (unitToShow !== "workers" || selectedResourceType !== "time") {
        return "normal";
      }

      const capacity = WORKERS_WEEKLY_CAPACITY[worker];
      if (!capacity) return "normal";

      const capacityMinutes = capacity * 60;
      const totalHours = totalMinutes / 60;

      // Overloaded: more than 100% of capacity
      if (totalMinutes > capacityMinutes) {
        return "overloaded";
      }

      // Underutilized: less than 50% of capacity
      if (totalMinutes < capacityMinutes * 0.5) {
        return "underutilized";
      }

      return "normal";
    },
    [unitToShow, selectedResourceType]
  );

  // Get header style based on capacity status
  const getHeaderStyle = useCallback(
    (column: string): React.CSSProperties => {
      if (unitToShow !== "workers" || selectedResourceType !== "time") {
        return {};
      }

      const total = columnTotals.get(column) || 0;
      const status = getCapacityStatus(column, total);

      if (status === "overloaded") {
        return {
          backgroundColor: "rgba(239, 68, 68, 0.15)", // red-500 with opacity
          color: "#991b1b", // red-800
        };
      }

      if (status === "underutilized") {
        return {
          backgroundColor: "rgba(234, 179, 8, 0.15)", // yellow-500 with opacity
          color: "#713f12", // yellow-900
        };
      }

      return {};
    },
    [unitToShow, selectedResourceType, columnTotals, getCapacityStatus]
  );

  // Get total cell style based on capacity status
  const getTotalCellStyle = useCallback(
    (column: string): React.CSSProperties => {
      if (unitToShow !== "workers" || selectedResourceType !== "time") {
        return {};
      }

      const total = columnTotals.get(column) || 0;
      const status = getCapacityStatus(column, total);

      if (status === "overloaded") {
        return {
          backgroundColor: "rgba(239, 68, 68, 0.2)", // red-500 with opacity
          color: "#991b1b", // red-800
          fontWeight: 600,
        };
      }

      if (status === "underutilized") {
        return {
          backgroundColor: "rgba(234, 179, 8, 0.2)", // yellow-500 with opacity
          color: "#713f12", // yellow-900
          fontWeight: 600,
        };
      }

      return {};
    },
    [unitToShow, selectedResourceType, columnTotals, getCapacityStatus]
  );

  const maxColumnValue = Math.max(...Array.from(columnTotals.values()));

  return (
    <div className="timeline-container">
      {/* Controls */}
      <Form className="flex items-center justify-between mb-4">
        {/* View Type Toggle */}
        <Form.Item label="View: " className="mb-0 mr-4">
          <Radio.Group
            block
            options={options}
            defaultValue="workers"
            optionType="button"
            buttonStyle="solid"
            onChange={(e) => setUnitToShow(e.target.value)}
            style={{ width: 180 }}
          />
        </Form.Item>

        {/* Week Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Week:</span>
          <Button onClick={goToPreviousWeek} disabled={selectedWeekIndex === 0}>
            ←
          </Button>
          <Select
            value={selectedWeekIndex}
            onChange={(value) => setSelectedWeekIndex(value as number)}
            options={allWeeks.map((week, index) => ({
              label: `W${week.weekNumber} ${week.year} (${formatWeekRange(
                week.weekStart,
                week.weekEnd
              )})`,
              value: index,
            }))}
            style={{ width: 320 }}
          />
          <Button
            onClick={goToNextWeek}
            disabled={selectedWeekIndex === allWeeks.length - 1}
          >
            →
          </Button>
          <Button type="text" onClick={goToCurrentWeek}>
            Current
          </Button>
        </div>

        {/* Resource Type Selector */}
        {resourceTypes.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Resource:</span>
            <Select
              value={selectedResourceType}
              onChange={(value) => setSelectedResourceType(value as string)}
              options={resourceTypes.map((type) => ({
                label: type.charAt(0).toUpperCase() + type.slice(1),
                value: type,
              }))}
              style={{ width: 120 }}
            />
          </div>
        )}
      </Form>

      {/* Table */}
      <div className="timeline-scroll-area">
        <div className="bg-white">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-20 bg-white">
              <tr>
                <th
                  className="border border-gray-300 p-3 text-left font-medium text-gray-700 bg-gray-50"
                  style={{ minWidth: 200 }}
                >
                  Project
                </th>
                {columns.map((column) => {
                  // Calculate capacity info
                  let capacityInfo: { capacity: number } | null = null;

                  if (selectedResourceType === "time") {
                    if (unitToShow === "workers") {
                      const capacity = WORKERS_WEEKLY_CAPACITY[column];
                      if (capacity) {
                        capacityInfo = { capacity };
                      }
                    } else if (unitToShow === "roles") {
                      const planned = columnPlannedValues.get(column) || 0;
                      const plannedHours = planned / 60;
                      if (plannedHours > 0) {
                        capacityInfo = { capacity: plannedHours };
                      }
                    }
                  }

                  return (
                    <th
                      key={column}
                      className="border border-gray-300 p-3 text-center font-medium text-gray-700 bg-gray-50"
                      style={{ minWidth: 100, ...getHeaderStyle(column) }}
                    >
                      <div>{column}</div>
                      {capacityInfo && (
                        <div className="text-xs font-normal mt-1 text-gray-500">
                          {capacityInfo.capacity.toFixed(1)}h planned
                        </div>
                      )}
                    </th>
                  );
                })}
                <th
                  className="border border-gray-300 p-3 text-center font-medium text-gray-700 bg-gray-50"
                  style={{ minWidth: 100 }}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {projectsData.map((project) => {
                const rowTotal = columns.reduce(
                  (sum, column) => sum + getCellValue(project, column),
                  0
                );

                return (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium text-gray-800">
                      <div className="font-medium text-sm">
                        {project.companyName}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {project.name}
                      </div>
                    </td>
                    {columns.map((column) => {
                      const value = getCellValue(project, column);
                      const isEditing =
                        editingCell?.projectId === project.id &&
                        editingCell?.column === column;

                      // Check if this cell is editable (project overlaps with selected week)
                      const isEditable =
                        project.startDate <= selectedWeek.weekEnd &&
                        project.dueDate >= selectedWeek.weekStart;

                      return (
                        <td
                          key={column}
                          className={`border border-gray-300 p-3 text-center text-sm ${
                            isEditable
                              ? "cursor-pointer hover:ring-2 hover:ring-blue-300"
                              : ""
                          }`}
                          style={getCellStyle(value, maxColumnValue)}
                          onDoubleClick={() =>
                            isEditable &&
                            startEditing(project.id, column, value)
                          }
                        >
                          {isEditing ? (
                            <input
                              type="number"
                              step={
                                selectedResourceType === "time" ? "0.5" : "1"
                              }
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleEditKeyDown}
                              onBlur={commitEdit}
                              autoFocus
                              className="w-full px-2 py-1 text-center border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            formatCellValue(value)
                          )}
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 p-3 text-center text-sm font-medium bg-gray-50">
                      {formatCellValue(rowTotal)}
                    </td>
                  </tr>
                );
              })}

              {/* Totals Row */}
              <tr className="bg-gray-100 font-medium">
                <td className="border border-gray-300 p-3 text-gray-800">
                  Total
                </td>
                {columns.map((column) => {
                  const total = columnTotals.get(column) || 0;

                  // Calculate remaining info
                  let remainingInfo: { remaining: number } | null = null;

                  if (selectedResourceType === "time") {
                    if (unitToShow === "workers") {
                      const capacity = WORKERS_WEEKLY_CAPACITY[column];
                      if (capacity) {
                        const totalHours = total / 60;
                        remainingInfo = {
                          remaining: capacity - totalHours,
                        };
                      }
                    } else if (unitToShow === "roles") {
                      const planned = columnPlannedValues.get(column) || 0;
                      const totalHours = total / 60;
                      const plannedHours = planned / 60;
                      if (plannedHours > 0) {
                        remainingInfo = {
                          remaining: plannedHours - totalHours,
                        };
                      }
                    }
                  }

                  return (
                    <td
                      key={column}
                      className="border border-gray-300 p-3 text-center text-sm"
                      style={getTotalCellStyle(column)}
                    >
                      <div>{formatCellValue(total)}</div>
                      {remainingInfo && (
                        <div className="text-xs font-normal mt-0.5 text-gray-500">
                          {Math.abs(remainingInfo.remaining).toFixed(1)}h{" "}
                          {remainingInfo.remaining >= 0 ? "remaining" : "over"}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="border border-gray-300 p-3 text-center text-sm font-medium">
                  {formatCellValue(
                    Array.from(columnTotals.values()).reduce(
                      (sum, val) => sum + val,
                      0
                    )
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
