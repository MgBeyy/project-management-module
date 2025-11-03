import { Modal, Button, Spin } from "antd";
import { useState } from "react";
import { deleteProjectFile } from "@/services/files/delete-project-file";
import { showNotification } from "@/utils/notification";
import type { ProjectFileDto } from "@/types";

interface DeleteProjectFileModalProps {
  visible: boolean;
  file: ProjectFileDto | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteProjectFileModal({
  visible,
  file,
  onClose,
  onSuccess,
}: DeleteProjectFileModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!file) return;

    setLoading(true);
    try {
      await deleteProjectFile({ fileId: file.id });
      showNotification.success(
        "Dosya silindi",
        `"${file.title}" başarıyla silindi.`
      );
      onClose();
      // onSuccess'i biraz delay ile çağır ki, modal kapanması sürüne kadar
      setTimeout(() => {
        onSuccess?.();
      }, 100);
    } catch (error) {
      console.error("Dosya silme hatası:", error);
      showNotification.error(
        "Dosya silinemedi",
        "Dosya silinirken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Dosya Silme Onayı"
      open={visible}
      onCancel={() => !loading && onClose()}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          İptal
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          loading={loading}
          onClick={handleDelete}
        >
          {loading ? "Siliniyor..." : "Sil"}
        </Button>,
      ]}
      destroyOnClose
      maskClosable={!loading}
      zIndex={1001}
    >
      <Spin spinning={loading} tip="Siliniyor...">
        <p>
          <strong>"{file?.title}"</strong> dosyasını silmek istediğinizden emin misiniz?
        </p>
        <p style={{ color: "#ff4d4f", marginTop: "12px" }}>
          Bu işlem geri alınamaz.
        </p>
      </Spin>
    </Modal>
  );
}
