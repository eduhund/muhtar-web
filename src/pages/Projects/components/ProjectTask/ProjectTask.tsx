import { useState } from "react";
import { Checkbox, Typography } from "antd";
import dayjs from "dayjs";

import { useTasks } from "../../../../hooks/useTasks";
import { Task } from "../../../../context/AppContext";

import "./ProjectTask.scss";
import EditTaskModal from "../EditTaskModal/EditTaskModal";

const { Text } = Typography;

export default function ProjectTask({ task }: { task: Task }) {
  const [isOpenTaskModal, setIsOpenTaskModal] = useState(false);
  const { updateTask } = useTasks();

  async function handleTaskDoneChange(taskId: string, checked: boolean) {
    await updateTask({
      id: taskId,
      doneDate: checked ? dayjs().toISOString() : null,
    });
  }

  function handleOpenTaskModal() {
    setIsOpenTaskModal(true);
  }

  function handleCloseTaskModal() {
    setIsOpenTaskModal(false);
  }

  function renderTaskDuration() {
    if (!task.duration) return null;
    if (Array.isArray(task.duration)) {
      const [min, max] = task.duration;
      return `${min / 60}-${max / 60}h`;
    } else {
      return `${task.duration / 60}h`;
    }
  }

  function renderTaskDates() {
    const start = task.startDate ? dayjs(task.startDate).format("D MMM") : null;
    const end = task.dueDate ? dayjs(task.dueDate).format("D MMM") : null;
    const done = task.doneDate ? dayjs(task.doneDate).format("D MMM") : null;
    if (start && !end) {
      return `Start: ${start}` + (done ? `; Done: ${done}` : "");
    } else if (!start && end) {
      return `Deadline: ${end}` + (done ? `; Done: ${done}` : "");
    } else if (start && end) {
      return `${start} → ${end}` + (done ? `; Done: ${done}` : "");
    }
    if (done) return `Done: ${done}`;
    return null;
  }

  return (
    <div className="ProjectTask-wrapper">
      <div className="ProjectTask" onClick={handleOpenTaskModal}>
        <Checkbox
          key={task.id}
          checked={!!task.doneDate}
          onChange={(e) => handleTaskDoneChange(task.id, e.target.checked)}
        />
        <div className="ProjectTask-info">
          <Text className="ProjectTask-title">{task.name}</Text>
          <div className="ProjectTask-meta">
            <div className="ProjectTask-dates">{renderTaskDates()}</div>
            <div className="ProjectTask-assigned">
              <span>{task.assignedMembership?.name || "Unassigned"}, </span>
              <span>{renderTaskDuration()}</span>
            </div>
          </div>
        </div>
      </div>
      <EditTaskModal
        isOpen={isOpenTaskModal}
        task={task}
        onClose={handleCloseTaskModal}
      />
    </div>
  );
}
