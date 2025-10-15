import { Button, Space } from "antd";
import { useState } from "react";
import { useTasksStore } from "@/store/zustand/tasks-store";
import DeleteConfirmModal from "./modals/delete-confirm-modal";
import UpdateTaskModal from "./modals/update-task-modal";
import CreateTaskModal from "./modals/create-task-modal";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye, AiOutlinePlus } from "react-icons/ai";

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
          icon={<AiOutlinePlus />}
          size={"middle"}
          onClick={() => setIsCreateModalVisible(true)}
        />
        <Button
          type="primary"
          icon={<AiOutlineEdit />}
          size={"middle"}
          onClick={() => setIsUpdateModalVisible(true)}
        />
        <Button
          type="primary"
          icon={<AiOutlineDelete />}
          size={"middle"}
          onClick={() => setIsDeleteModalVisible(true)}
          danger
        />
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
