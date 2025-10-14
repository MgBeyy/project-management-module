import { Modal, Form, Input, DatePicker } from "antd";
import { useEffect } from "react";
import { useNotification } from "@/hooks/useNotification";
import { updateActivity } from "../../services/update-activity";
import { useActivitiesStore } from "@/store/zustand/activities-store";
import dayjs from "dayjs";
import UserSelect from "../user-select";
import TaskSelect from "../task-select";

const { TextArea } = Input;

export default function UpdateActivityModal({
  visible,
  onClose,
  activity,
}: {
  visible: boolean;
  onClose: () => void;
  activity: any;
}) {
  const notification = useNotification();
  const [form] = Form.useForm();
  const { triggerRefresh } = useActivitiesStore();

  useEffect(() => {
    if (visible && activity) {
      form.setFieldsValue({
        taskId: activity.TaskId,
        userId: activity.UserId,
        description: activity.Description,
        startTime: dayjs(activity.StartTime),
        endTime: dayjs(activity.EndTime),
      });
    }
  }, [visible, activity, form]);

  const handleUpdate = async (values: any) => {
    try {
      const activityData = {
        taskId: values.taskId,
        userId: values.userId,
        description: values.description,
        startTime: values.startTime.valueOf(), // Convert to milliseconds
        endTime: values.endTime.valueOf(), // Convert to milliseconds
      };

      await updateActivity(activity.Id, activityData);
      notification.success("Etkinlik Güncellendi", "Etkinlik başarıyla güncellendi!");
      triggerRefresh();
      form.resetFields();
      onClose();
    } catch (error: any) {
      console.error("Etkinlik güncelleme hatası:", error);

      if (error.response?.status === 404) {
        notification.error("Hata", "Etkinlik bulunamadı");
      } else if (error.response?.status === 400) {
        notification.error("Geçersiz Bilgiler", "Lütfen etkinlik bilgilerini kontrol edin.");
      } else if (error.response?.status === 500) {
        notification.error("Sunucu Hatası", "Lütfen tekrar deneyin.");
      } else if (error.code === "ERR_NETWORK") {
        notification.error("Bağlantı Hatası", "Backend çalışıyor mu?");
      } else {
        notification.error("Hata", "Etkinlik güncellenemedi! Tekrar deneyin.");
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
      title={`Etkinlik Düzenle (#${activity?.Id ?? ""})`}
      open={visible}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Güncelle"
      cancelText="İptal"
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleUpdate}>
        <Form.Item
          label="Görev"
          name="taskId"
          rules={[{ required: true, message: "Görev seçimi gereklidir" }]}
        >
          <TaskSelect placeholder="Görev ara ve seç..." style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Kullanıcı"
          name="userId"
          rules={[{ required: true, message: "Kullanıcı seçimi gereklidir" }]}
        >
          <UserSelect placeholder="Kullanıcı ara ve seç..." style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Açıklama"
          name="description"
          rules={[{ required: true, message: "Açıklama gereklidir" }]}
        >
          <TextArea rows={4} placeholder="Etkinlik açıklaması..." />
        </Form.Item>

        <Form.Item
          label="Başlangıç Zamanı"
          name="startTime"
          rules={[{ required: true, message: "Başlangıç zamanı gereklidir" }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: "100%" }}
            placeholder="Başlangıç zamanı seçin"
          />
        </Form.Item>

        <Form.Item
          label="Bitiş Zamanı"
          name="endTime"
          rules={[{ required: true, message: "Bitiş zamanı gereklidir" }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: "100%" }}
            placeholder="Bitiş zamanı seçin"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
