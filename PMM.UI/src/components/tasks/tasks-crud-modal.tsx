import { Button, Space } from "antd";
import { useState } from "react";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye, AiOutlinePlus } from "react-icons/ai";
import { useTasksStore } from "@/store/zustand/tasks-store";
import { useNotification } from "@/hooks/useNotification";
import CreateTaskModal from "./modals/create-task-modal";
import DeleteConfirmModal from "./modals/delete-confirm-modal";

export default function TasksCrudModal() {
  const notification = useNotification();
  const { selectedTask, clearSelectedTask } = useTasksStore();
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const handleCreateClick = () => {
    setModalMode("create");
    setTaskModalVisible(true);
  };

  const handleUpdateClick = () => {
    if (!selectedTask || !selectedTask.Id) {
      notification.warning("Uyarı", "Lütfen güncellemek için bir görev seçin.");
      return;
    }
    setModalMode("edit");
    setTaskModalVisible(true);
  };

  const handleViewClick = () => {
    if (!selectedTask || !selectedTask.Id) {
      notification.warning("Uyarı", "Lütfen görüntülemek için bir görev seçin.");
      return;
    }
    setModalMode("view");
    setTaskModalVisible(true);
  };

  const handleDeleteClick = () => {
    if (!selectedTask || !selectedTask.Id) {
      notification.warning("Uyarı", "Lütfen silmek için bir görev seçin.");
      return;
    }
    setIsDeleteModalVisible(true);
  };

  const handleModalClose = () => {
    setTaskModalVisible(false);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalVisible(false);
  };

  const handleTaskModalSuccess = () => {
    clearSelectedTask();
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <Space>
        <Button
          type="primary"
          icon={<AiOutlinePlus />}
          size="middle"
          onClick={handleCreateClick}
        />
        <Button
          type="primary"
          icon={<AiOutlineEdit />}
          size="middle"
          onClick={handleUpdateClick}
        />
        <Button
          type="primary"
          icon={<AiOutlineEye />}
          size="middle"
          onClick={handleViewClick}
        />
        <Button
          type="primary"
          icon={<AiOutlineDelete />}
          size="middle"
          onClick={handleDeleteClick}
          danger
        />
      </Space>

      <CreateTaskModal
        visible={taskModalVisible}
        onClose={handleModalClose}
        onSuccess={handleTaskModalSuccess}
        taskData={selectedTask as any}
        mode={modalMode}
      />

      <DeleteConfirmModal
        visible={isDeleteModalVisible && !!selectedTask}
        onClose={handleDeleteModalClose}
        task={selectedTask}
      />
    </div>
  );
}
