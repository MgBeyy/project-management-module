import { Button, Space } from "antd";
import { useState } from "react";
import { useTasksStore } from "@/store/zustand/tasks-store";
import DeleteConfirmModal from "./modals/delete-confirm-modal";
import UpdateTaskModal from "./modals/update-task-modal";
import CreateTaskModal from "./modals/create-task-modal";

export default function TasksCrudModal() {
  const { selectedTask } = useTasksStore();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  return (
    <div style={{ marginBottom: "16px" }}>
      <Space>
        <Button
          type="primary"
          onClick={() => setIsCreateModalVisible(true)}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
        >
          Yeni Görev Oluştur
        </Button>

        <Button
          type="default"
          onClick={() => setIsUpdateModalVisible(true)}
          disabled={!selectedTask}
        >
          Görevi Güncelle
        </Button>

        <Button
          type="primary"
          danger
          onClick={() => setIsDeleteModalVisible(true)}
          disabled={!selectedTask}
        >
          Görevi Sil
        </Button>
      </Space>

      <CreateTaskModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />

      {selectedTask && (
        <>
          <UpdateTaskModal
            visible={isUpdateModalVisible}
            onClose={() => setIsUpdateModalVisible(false)}
            task={selectedTask}
          />

          <DeleteConfirmModal
            visible={isDeleteModalVisible}
            onClose={() => setIsDeleteModalVisible(false)}
            task={selectedTask}
          />
        </>
      )}
    </div>
  );
}
