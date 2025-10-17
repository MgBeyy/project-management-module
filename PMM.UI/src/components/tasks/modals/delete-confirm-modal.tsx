import { Modal } from "antd";
import { useTasksStore } from "@/store/zustand/tasks-store";
import { useNotification } from "@/hooks/useNotification";
import { deleteTask } from "@/services/tasks/delete-task";

export default function DeleteConfirmModal({
  visible,
  onClose,
  task,
}: {
  visible: boolean;
  onClose: () => void;
  task: any;
}) {
  const notification = useNotification();
  const { triggerRefresh } = useTasksStore();

  const handleDelete = async () => {
    try {
      await deleteTask(task.Id);
      notification.success("Görev Silindi", "Görev başarıyla silindi!");
      triggerRefresh();
      onClose();
    } catch (error: any) {
      console.error("Görev silme hatası:", error);
    }
  };

  return (
    <Modal
      title="Görevi Sil"
      open={visible}
      onOk={handleDelete}
      onCancel={onClose}
      okText="Sil"
      cancelText="İptal"
      okButtonProps={{ danger: true }}
    >
      <p>
        <strong>{task?.Title}</strong> başlıklı görevi silmek istediğinizden
        emin misiniz?
      </p>
    </Modal>
  );
}
