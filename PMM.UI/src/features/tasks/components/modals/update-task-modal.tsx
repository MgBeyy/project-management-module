import { Modal, Form, Input, InputNumber, Select, Row, Col } from "antd";
import { useEffect } from "react";
import { updateTask } from "../../services/update-task";
import { useTasksStore } from "@/store/zustand/tasks-store";
import { TaskStatus } from "../../services/get-tasks";
import { useNotification } from "@/hooks/useNotification";

const { TextArea } = Input;

export default function UpdateTaskModal({
  visible,
  onClose,
  task,
}: {
  visible: boolean;
  onClose: () => void;
  task: any;
}) {
  const notification = useNotification();
  const [form] = Form.useForm();
  const { triggerRefresh } = useTasksStore();

  useEffect(() => {
    if (visible && task) {
      // Status mapping from string to enum value
      let statusValue
      if (task.Status === "InProgress") statusValue = TaskStatus.IN_PROGRESS;
      else if (task.Status === "Done") statusValue = TaskStatus.DONE;
      else statusValue = TaskStatus.TODO;

      form.setFieldsValue({
        projectId: task.ProjectId,
        parentTaskId: task.ParentTaskId,
        title: task.Title,
        description: task.Description,
        status: statusValue,
        weight: task.Weight,
        plannedHours: task.PlannedHours,
        actualHours: task.ActualHours,
      });
    }
  }, [visible, task, form]);

  const handleUpdate = async (values: any) => {
    try {
      await updateTask(task.Id, values);
      notification.success("Görev Güncellendi", "Görev başarıyla güncellendi!");
      triggerRefresh();
      form.resetFields();
      onClose();
    } catch (error: any) {
      console.error("Update error:", error);

      if (error.response?.status === 404) {
        notification.error("Hata", "Görev bulunamadı");
      } else if (error.response?.status === 400) {
        notification.error("Geçersiz Bilgiler", "Lütfen görev bilgilerini kontrol edin.");
      } else if (error.response?.status === 500) {
        notification.error("Sunucu Hatası", "Lütfen tekrar deneyin.");
      } else if (error.code === "ERR_NETWORK") {
        notification.error("Bağlantı Hatası", "Backend çalışıyor mu?");
      } else if (error.code === "ECONNABORTED") {
        notification.error("Zaman Aşımı", "İstek zaman aşımına uğradı! Tekrar deneyin.");
      } else {
        notification.error("Hata", "Görev güncellenemedi! Tekrar deneyin.");
      }

      if (error.response?.data) {
        console.error("Backend hata detayı:", error.response.data);
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        `Görev Güncelle (#${task?.Id ?? ""})`
      }
      open={visible}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Güncelle"
      cancelText="İptal"
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleUpdate}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Proje Kodu"
              name="projectCode"
              rules={[{ required: true, message: "Proje Kodu gereklidir" }]}
            >
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Üst Görev ID" name="parentTaskId">
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Başlık"
          name="title"
          rules={[{ required: true, message: "Başlık gereklidir" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Açıklama" name="description">
          <TextArea rows={4} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Durum" name="status">
              <Select>
                <Select.Option value={TaskStatus.TODO}>Yapılacak</Select.Option>
                <Select.Option value={TaskStatus.IN_PROGRESS}>
                  Devam Ediyor
                </Select.Option>
                <Select.Option value={TaskStatus.DONE}>Tamamlandı</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ağırlık"
              name="weight"
              rules={[{ required: true, message: "Ağırlık gereklidir" }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Planlanan Saat" name="plannedHours">
              <InputNumber style={{ width: "100%" }} min={0} step={0.5} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Gerçek Saat" name="actualHours">
              <InputNumber style={{ width: "100%" }} min={0} step={0.5} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
