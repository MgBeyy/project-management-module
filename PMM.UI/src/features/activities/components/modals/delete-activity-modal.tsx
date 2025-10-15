import { Modal } from "antd";
import { deleteActivity } from "../../services/delete-activity";
import { useActivitiesStore } from "@/store/zustand/activities-store";
import { useNotification } from "@/hooks/useNotification";

export default function DeleteActivityModal({
  visible,
  onClose,
  activity,
}: {
  visible: boolean;
  onClose: () => void;
  activity: any;
}) {
  const notification = useNotification();
  const { triggerRefresh } = useActivitiesStore();

  const handleDelete = async () => {
    try {
      await deleteActivity(activity.Id);
      notification.success("Etkinlik Silindi", "Etkinlik başarıyla silindi!");
      triggerRefresh();
      onClose();
    } catch (error: any) {
      console.error("Etkinlik silme hatası:", error);

    }
  };

  return (
    <Modal
      title="Etkinliği Sil"
      open={visible}
      onOk={handleDelete}
      onCancel={onClose}
      okText="Sil"
      cancelText="İptal"
      okButtonProps={{ danger: true }}
    >
      <p>
        Bu etkinliği silmek istediğinizden emin misiniz?
      </p>
      <p style={{ marginTop: "8px", color: "#666" }}>
        <strong>Açıklama:</strong> {activity?.Description}
      </p>
    </Modal>
  );
}
