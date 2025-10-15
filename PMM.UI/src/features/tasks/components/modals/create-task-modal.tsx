import { Modal, Form, Input, InputNumber, Select, Row, Col } from "antd";
import { createTask } from "../../services/create-task";
import { useTasksStore } from "@/store/zustand/tasks-store";
import { TaskStatus } from "../../services/get-tasks";
import { useNotification } from "@/hooks/useNotification";

const { TextArea } = Input;

export default function CreateTaskModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const notification = useNotification();
  const [form] = Form.useForm();
  const { triggerRefresh } = useTasksStore();

  const handleCreate = async (values: any) => {
    try {
      await createTask(values);
      notification.success("Görev Oluşturuldu", "🎉 Görev başarıyla oluşturuldu!");
      triggerRefresh();
      form.resetFields();
      onClose();
    } catch (error: any) {
      console.error("Görev oluşturma hatası:", error);

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
      title="Yeni Görev Oluştur"
      open={visible}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Oluştur"
      cancelText="İptal"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreate}
        initialValues={{
          status: TaskStatus.TODO,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Proje ID"
              name="projectId"
              rules={[{ required: true, message: "Proje ID gereklidir" }]}
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

        <Form.Item label="Durum" name="status">
          <Select>
            <Select.Option value={TaskStatus.TODO}>Yapılacak</Select.Option>
            <Select.Option value={TaskStatus.IN_PROGRESS}>
              Devam Ediyor
            </Select.Option>
            <Select.Option value={TaskStatus.DONE}>Tamamlandı</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Planlanan Saat" name="plannedHours">
          <InputNumber style={{ width: "100%" }} min={0} step={0.5} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
