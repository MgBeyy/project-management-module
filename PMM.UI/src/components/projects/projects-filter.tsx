import { Button, DatePicker, Form, Input, InputNumber, Select } from "antd";
import type { InputNumberProps } from "antd";
import { useProjectsStore } from "@/store/zustand/projects-store";
import MultiSelectSearch from "./multi-select-search";
import { ProjectPriority, ProjectStatus } from "@/services/projects/get-projects";

export default function ProjectsFilter() {
  const [form] = Form.useForm();
  const { setFilters, resetFilters } = useProjectsStore();

  const onChangeNumber: InputNumberProps["onChange"] = value => {
    form.setFieldValue("PlannedHours", value);
  };

  const handleSubmit = (values: any) => {
    const serializedPayload = {
      Code: values.code || undefined,
      Title: values.title || undefined,
      PlannedStartDate: values.plannedStartDate
        ? values.plannedStartDate.valueOf()
        : undefined,
      PlannedDeadLine: values.plannedEndDate
        ? values.plannedEndDate.valueOf()
        : undefined,
      StartedAt: values.startedAt ? values.startedAt.valueOf() : undefined,
      EndAt: values.endAt ? values.endAt.valueOf() : undefined,

      PlannedHours: values.plannedHours || undefined,
      Status: (values.status as ProjectStatus) || undefined,
      Priority: (values.priority as ProjectPriority) || undefined,
      LabelIds: values.labelIds && values.labelIds.length > 0 
        ? values.labelIds.map((id: string) => parseInt(id, 10))
        : undefined,
      page: 1,
      pageSize: 50,
    };
    const cleanedPayload = Object.fromEntries(
      Object.entries(serializedPayload).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    setFilters(cleanedPayload);
  };

  const handleReset = () => {
    form.resetFields();
    resetFilters();
  };
  const statusOptions = [
    { value: ProjectStatus.ACTIVE, label: "Aktif" },
    { value: ProjectStatus.INACTIVE, label: "Pasif" },
    { value: ProjectStatus.COMPLETED, label: "Tamamlandı" },
    { value: ProjectStatus.PLANNED, label: "Planlandı" },
  ];
  const priorityOptions = [
    { value: ProjectPriority.YUKSEK, label: "Yüksek" },
    { value: ProjectPriority.ORTA, label: "Orta" },
    { value: ProjectPriority.DUSUK, label: "Düşük" },
  ];

  return (
    <div className="p-4 w-full">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={(changedValues, allValues) => {
          console.log("Değer değişti:", changedValues);
          console.log("Tüm değerler:", allValues);
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-2"
      >
        <Form.Item label="Kod" name="code" className="mb-3">
          <Input placeholder="Kod" size="middle" />
        </Form.Item>

        <Form.Item label="Başlık" name="title" className="mb-3">
          <Input placeholder="Başlık" size="middle" />
        </Form.Item>

        <Form.Item label="Etiketler" name="labelIds" className="mb-3">
          <MultiSelectSearch
            placeholder="Etiket ara ve seç..."
            apiUrl="/Label"
            size="middle"
          />
        </Form.Item>

        <Form.Item
          label="Planlanan Başlangıç Tarihi"
          name="plannedStartDate"
          className="mb-3"
        >
          <DatePicker
            placeholder="Başlangıç tarihi"
            size="middle"
            style={{ width: "100%" }}
            format="DD-MM-YYYY"
          />
        </Form.Item>

        <Form.Item
          label="Planlanan Bitiş Tarihi"
          name="plannedEndDate"
          className="mb-3"
        >
          <DatePicker
            placeholder="Bitiş tarihi"
            size="middle"
            style={{ width: "100%" }}
            format="DD-MM-YYYY"
          />
        </Form.Item>

        <Form.Item label="Planlanan Çalışma Saati" name="plannedHours" className="mb-3">
          <InputNumber
            min={0}
            max={10000}
            placeholder="Saat"
            onChange={onChangeNumber}
            size="middle"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="Gerçekleşen Başlangıç Tarihi" name="startedAt" className="mb-3">
          <DatePicker
            showTime
            placeholder="Başlangıç zamanı"
            size="middle"
            style={{ width: "100%" }}
            format="DD-MM-YYYY HH:mm:ss"
          />
        </Form.Item>

        <Form.Item label="Gerçekleşen Bitiş Tarihi" name="endAt" className="mb-3">
          <DatePicker
            showTime
            placeholder="Bitiş zamanı"
            size="middle"
            style={{ width: "100%" }}
            format="DD-MM-YYYY HH:mm:ss"
          />
        </Form.Item>

        <Form.Item label="Durum" name="status" className="mb-3">
          <Select
            placeholder="Durum seçin"
            allowClear
            size="middle"
            style={{ width: "100%" }}
            options={statusOptions}
          />
        </Form.Item>

        <Form.Item label="Öncelik" name="priority" className="mb-3">
          <Select
            placeholder="Öncelik seçin"
            allowClear
            size="middle"
            style={{ width: "100%" }}
            options={priorityOptions}
          />
        </Form.Item>

        <Form.Item className="mb-3 flex items-end">
          <div className="flex gap-2 w-full">
            <Button onClick={handleReset} size="middle" className="flex-1">
              Temizle
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="middle"
              className="flex-1"
            >
              Filtrele
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}
