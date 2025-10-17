import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface DeleteConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  projectTitle?: string;
}

export default function DeleteConfirmModal({
  visible,
  onConfirm,
  onCancel,
  projectTitle,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-[#faad14] text-lg" />
          <span>Proje Silme Onayı</span>
        </div>
      }
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Evet, Sil"
      cancelText="İptal"
      okButtonProps={{
        danger: true,
      }}
      centered
    >
      <div className="p-4">
        <p className="text-lg mb-2">
          <strong>"{projectTitle || "Bu proje"}"</strong> projesini silmek istediğinizden emin misiniz?
        </p>
        <p className="text-gray-500 mb-0">
          Bu işlem geri alınamaz.
        </p>
      </div>
    </Modal>
  );
}
