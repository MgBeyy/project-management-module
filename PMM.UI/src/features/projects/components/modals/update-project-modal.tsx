import { Modal, Form, Input, DatePicker, InputNumber, Select } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { updateProject, UpdateProjectData } from "../../services/update-project";
import { ProjectPriority } from "../../services/get-projects";
import { useNotification } from "@/hooks/useNotification";

interface UpdateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectData: {
    Id: number | null;
    Code: string;
    Title: string;
    PlannedStartDate?: string;
    PlannedDeadLine?: string;
    PlannedHours?: number;
    StartedAt?: string | null;
    EndAt?: string | null;
    Status: string;
    Priority: string;
    rawPlannedStartDate?: number | null;
    rawPlannedDeadline?: number | null;
    rawStartedAt?: number | null;
    rawEndAt?: number | null;
    rawStatus?: number;
  } | null;
}

export default function UpdateProjectModal({
  visible,
  onClose,
  onSuccess,
  projectData,
}: UpdateProjectModalProps) {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const notification = useNotification();
  useEffect(() => {
    if (visible && projectData) {
      // Form alanlarını doldur - ham timestamp değerlerini kullan
      form.setFieldsValue({
        title: projectData.Title,
        plannedStartDate: projectData.rawPlannedStartDate
          ? dayjs(projectData.rawPlannedStartDate)
          : null,
        plannedDeadline: projectData.rawPlannedDeadline
          ? dayjs(projectData.rawPlannedDeadline)
          : null,
        plannedHours: projectData.PlannedHours,
        startedAt: projectData.rawStartedAt ? dayjs(projectData.rawStartedAt) : null,
        endAt: projectData.rawEndAt ? dayjs(projectData.rawEndAt) : null,
        status: projectData.rawStatus ?? 0,
        priority: projectData.Priority,
      });
    }
  }, [visible, projectData, form]);

  const handleSubmit = async (values: any) => {
    if (!projectData?.Id) return;

    setIsLoading(true);
    try {
      const updateData: UpdateProjectData = {
        title: values.title,
        plannedStartDate: values.plannedStartDate
          ? values.plannedStartDate.valueOf()
          : null,
        plannedDeadline: values.plannedDeadline
          ? values.plannedDeadline.valueOf()
          : null,
        plannedHours: values.plannedHours || null,
        startedAt: values.startedAt ? values.startedAt.valueOf() : null,
        endAt: values.endAt ? values.endAt.valueOf() : null,
        status: values.status,
        priority: values.priority,
      };

      await updateProject(projectData.Id, updateData);

      notification.success("Başarılı", `"${values.title}" projesi başarıyla güncellendi.`);

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const statusOptions = [
    { value: 0, label: "Planlandı" },
    { value: 1, label: "Aktif" },
    { value: 2, label: "Tamamlandı" },
    { value: 3, label: "Beklemede" },
  ];

  const priorityOptions = [
    { value: ProjectPriority.YUKSEK, label: "Yüksek" },
    { value: ProjectPriority.ORTA, label: "Orta" },
    { value: ProjectPriority.DUSUK, label: "Düşük" },
  ];

  return (
    <Modal
      title={
        <div className="text-lg">
          {`${projectData ? `Güncelle: ${projectData.Code}` : "Proje Bulunamadı"}`}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText="Güncelle"
      cancelText="İptal"
      confirmLoading={isLoading}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          label="Başlık"
          name="title"
          rules={[{ required: true, message: "Başlık zorunludur!" }]}
        >
          <Input placeholder="Proje başlığı" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Planlanan Başlangıç Tarihi"
            name="plannedStartDate"
            rules={[
              { required: true, message: "Başlangıç tarihi zorunludur!" },
            ]}
          >
            <DatePicker
              placeholder="Başlangıç tarihi"
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item label="Planlanan Bitiş Tarihi" name="plannedDeadline">
            <DatePicker
              placeholder="Bitiş tarihi"
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Planlanan Saat"
          name="plannedHours"
          rules={[
            { required: false },
            { type: "number", min: 0, message: "Saat negatif olamaz!" },
          ]}
        >
          <InputNumber
            placeholder="Planlanan saat"
            style={{ width: "100%" }}
            min={0}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Başlangıç Zamanı" name="startedAt">
            <DatePicker
              showTime
              placeholder="Başlangıç zamanı"
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>

          <Form.Item label="Bitiş Zamanı" name="endAt">
            <DatePicker
              showTime
              placeholder="Bitiş zamanı"
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Durum"
            name="status"
            rules={[{ required: true, message: "Durum zorunludur!" }]}
          >
            <Select placeholder="Durum seçin" options={statusOptions} />
          </Form.Item>

          <Form.Item
            label="Öncelik"
            name="priority"
            rules={[{ required: true, message: "Öncelik zorunludur!" }]}
          >
            <Select placeholder="Öncelik seçin" options={priorityOptions} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
