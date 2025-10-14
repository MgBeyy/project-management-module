import { Button, DatePicker, Form, Input, InputNumber, Select } from "antd";
import type { DatePickerProps, InputNumberProps } from "antd";
import { ProjectStatus, ProjectPriority } from "../services/get-projects";
import { useProjectsStore } from "@/store/zustand/projects-store";
import MultiSelectSearch from "./multi-select-search";

export default function ProjectsFilter() {
  const [form] = Form.useForm();
  const { setFilters, resetFilters } = useProjectsStore();

  const onChangeNumber: InputNumberProps["onChange"] = value => {
    console.log("Saat değişti:", value);
    form.setFieldValue("PlannedHours", value);
  };

  const onChangeDate: DatePickerProps["onChange"] = (date, dateString) => {
    console.log("Tarih değişti:", date, dateString);
  };

  const onChangeSelect = (value: string, option: any) => {
    console.log("Select değişti:", value, option);
  };

  const handleSubmit = (values: any) => {
    console.log("✅ Form değerleri (raw):", values);

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

    console.log("📤 Zustand'a gönderilen temizlenmiş payload:", cleanedPayload);
    setFilters(cleanedPayload);
  };

  const handleReset = () => {
    form.resetFields();
    resetFilters();
    console.log("Form ve Zustand temizlendi");
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
          label="Planlanan Başlangıç"
          name="plannedStartDate"
          className="mb-3"
        >
          <DatePicker
            onChange={onChangeDate}
            placeholder="Başlangıç tarihi"
            size="middle"
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          label="Planlanan Bitiş"
          name="plannedEndDate"
          className="mb-3"
        >
          <DatePicker
            placeholder="Bitiş tarihi"
            size="middle"
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item label="Planlanan Saat" name="plannedHours" className="mb-3">
          <InputNumber
            min={0}
            max={10000}
            placeholder="Saat"
            onChange={onChangeNumber}
            size="middle"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="Başlangıç Zamanı" name="startedAt" className="mb-3">
          <DatePicker
            showTime
            placeholder="Başlangıç zamanı"
            size="middle"
            style={{ width: "100%" }}
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Form.Item>

        <Form.Item label="Bitiş Zamanı" name="endAt" className="mb-3">
          <DatePicker
            showTime
            placeholder="Bitiş zamanı"
            size="middle"
            style={{ width: "100%" }}
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Form.Item>

        <Form.Item label="Durum" name="status" className="mb-3">
          <Select
            placeholder="Durum seçin"
            allowClear
            onChange={onChangeSelect}
            size="middle"
            style={{ width: "100%" }}
            options={statusOptions}
          />
        </Form.Item>

        <Form.Item label="Öncelik" name="priority" className="mb-3">
          <Select
            placeholder="Öncelik seçin"
            allowClear
            onChange={onChangeSelect}
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
