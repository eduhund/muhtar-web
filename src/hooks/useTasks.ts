import { useContext } from "react";
import { AppContext, Task } from "../context/AppContext";
import { membershipAPI } from "../api";

export type TaskEntry = {
  name: string;
  projectId: string;
  assignedMembershipId: string | null;
  jobId: string | null;
  startDate: string | null;
  dueDate: string | null;
  doneDate: string | null;
  duration: number | null; // in minutes
  notes: string;
};

export function useTasks() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMembership must be used within a TimetableProvider");
  }

  const { tasks, tasksLoading, updateState } = context;

  async function addTask(entry: TaskEntry) {
    const { data } = (await membershipAPI.createTask(entry)) as { data: Task };
    if (data && tasks) {
      const newTasks = updateTasksList(tasks, data);
      updateState({ tasks: newTasks });
    }
    return data;
  }

  async function updateTask(entry: { id: string } & Partial<TaskEntry>) {
    const { OK } = await membershipAPI.updateTask(entry);
    if (OK && tasks) {
      const entryRecord = tasks.find((item) => item.id === entry.id);
      console.log("entryRecord", entryRecord);
      if (entryRecord) {
        const newTasks = updateTasksList(tasks, {
          ...entryRecord,
          ...entry,
        });
        console.log("newTasks", newTasks);
        updateState({ tasks: newTasks });
      }
    }
    return OK;
  }

  async function archiveTask(id: string) {
    const { OK } = await membershipAPI.archiveTask(id);
    if (OK && tasks) {
      const entryRecord = tasks.find((item) => item.id === id);
      if (entryRecord) {
        entryRecord.isDeleted = true;
        const newTasks = updateTasksList(tasks, entryRecord);
        updateState({ tasks: newTasks });
      }
    }
    return OK;
  }

  async function restoreTask(id: string) {
    const { OK } = await membershipAPI.restoreTask(id);
    if (OK && tasks) {
      const entryRecord = tasks.find((item) => item.id === id);
      if (entryRecord) {
        entryRecord.isDeleted = false;
        const newTasks = updateTasksList(tasks, entryRecord);
        updateState({ tasks: newTasks });
      }
    }
    return OK;
  }

  return {
    tasks,
    isLoading: tasksLoading,
    addTask,
    updateTask,
    archiveTask,
    restoreTask,
  };
}

export function updateTasksList(tasks: Task[], updated: Task) {
  const idx = tasks.findIndex((item) => item.id === updated.id);
  if (idx !== -1) {
    return [...tasks.slice(0, idx), updated, ...tasks.slice(idx + 1)];
  } else {
    return [...tasks, updated];
  }
}
