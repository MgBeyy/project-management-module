import { Modal, Form, Input, DatePicker } from "antd";
import { useNotification } from "@/hooks/useNotification";
import { createActivity } from "../../../services/activities/create-activity";
import { useActivitiesStore } from "@/store/zustand/activities-store";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useRef } from "react";
import UserSelect from "../user-select";
import TaskSelect from "../task-select";

const { TextArea } = Input;

export default function CreateActivityModal({
  visible,
  onClose,
  initialDate,
  initialEndDate,
  selectedUserId,
}: {
  visible: boolean;
  onClose: () => void;
  initialDate?: Dayjs;
  initialEndDate?: Dayjs;
  selectedUserId?: number | null;
}) {
  const notification = useNotification();
  const [form] = Form.useForm();
  const { triggerRefresh } = useActivitiesStore();
  const selectedUser = Form.useWatch("userId", form);
  const previousSelectedUserRef = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        startTime: initialDate || dayjs(),
        endTime: initialEndDate || (initialDate ? initialDate.add(1, "hour") : dayjs().add(1, "hour")),
        userId: selectedUserId || undefined,
      });
    }
  }, [visible, initialDate, selectedUserId, form]);

  useEffect(() => {
    if (!visible) {
      previousSelectedUserRef.current = undefined;
      return;
    }

    const normalizedSelected = selectedUser ?? null;

    if (previousSelectedUserRef.current === undefined) {
      previousSelectedUserRef.current = normalizedSelected;
      return;
    }

    if (previousSelectedUserRef.current !== normalizedSelected) {
      form.setFieldsValue({ taskId: undefined });
      previousSelectedUserRef.current = normalizedSelected;
    }
  }, [selectedUser, visible, form]);

  const handleCreate = async (values: any) => {
    try {
      const activityData = {
        taskId: values.taskId,
        userId: values.userId,
        description: values.description,
        startTime: values.startTime.valueOf(),
        endTime: values.endTime.valueOf(),
      };

      await createActivity(activityData);
      notification.success("Etkinlik Olusturuldu", "Etkinlik basariyla olusturuldu!");
      triggerRefresh();
      form.resetFields();
      onClose();
    } catch (error: any) {
      console.error("Etkinlik olusturma hatasi:", error);

      if (error.response?.data) {
        console.error("Backend hata detayi:", error.response.data);
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    previousSelectedUserRef.current = undefined;
    onClose();
  };

  return (
    <Modal
      title="Yeni Etkinlik Olustur"
      open={visible}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Olustur"
      cancelText="Iptal"
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleCreate}>
        <Form.Item
          label="Kullanici"
          name="userId"
          rules={[{ required: true, message: "Kullanici secimi gereklidir" }]}
        >
          <UserSelect placeholder="Kullanici ara ve sec..." style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Gorev"
          name="taskId"
          rules={[{ required: true, message: "Gorev secimi gereklidir" }]}
        >
          <TaskSelect
            placeholder="Gorev ara ve sec..."
            style={{ width: "100%" }}
            assignedUserId={selectedUser}
            disabled={!selectedUser}
          />
        </Form.Item>

        <Form.Item
          label="Aciklama"
          name="description"
          rules={[{ required: true, message: "Aciklama gereklidir" }]}
        >
          <TextArea rows={4} placeholder="Etkinlik aciklamasi..." />
        </Form.Item>

        <Form.Item
          label="Baslangic Zamani"
          name="startTime"
          rules={[{ required: true, message: "Baslangic zamani gereklidir" }]}
        >
          <DatePicker
            showTime={{ format: "HH:mm", minuteStep: 15 }}
            format="DD-MM-YYYY HH:mm"
            style={{ width: "100%" }}
            placeholder="Baslangic zamani secin"
          />
        </Form.Item>

        <Form.Item
          label="Bitis Zamani"
          name="endTime"
          rules={[{ required: true, message: "Bitis zamani gereklidir" }]}
        >
          <DatePicker
            showTime={{ format: "HH:mm", minuteStep: 15 }}
            format="DD-MM-YYYY HH:mm"
            style={{ width: "100%" }}
            placeholder="Bitis zamani secin"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
