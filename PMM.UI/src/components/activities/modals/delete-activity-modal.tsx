import { Modal } from "antd";
import { deleteActivity } from "../../../services/activities/delete-activity";
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
      await deleteActivity(activity.id);
      notification.success("Etkinlik Silindi", "Etkinlik başarıyla silindi!");
      triggerRefresh();
      onClose();
    } catch (error: any) {
      console.error("Etkinlik silme hatası:", error);
      notification.error("Hata", "Etkinlik silinirken bir hata oluştu!");
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
      {activity?.description && (
        <p style={{ marginTop: "8px", color: "#666" }}>
          <strong>Açıklama:</strong> {activity.description}
        </p>
      )}
    </Modal>
  );
}
