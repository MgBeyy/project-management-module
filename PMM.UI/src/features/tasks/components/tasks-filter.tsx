import { Button, DatePicker, Form, Input, InputNumber, Select } from "antd";
import type { DatePickerProps, InputNumberProps } from "antd";
import { TaskStatus } from "../services/get-tasks";
import { useTasksStore } from "@/store/zustand/tasks-store";

export default function TasksFilter() {
  const [form] = Form.useForm();
  const { setFilters, resetFilters } = useTasksStore();

  const onChangeNumber: InputNumberProps["onChange"] = value => {
    console.log("Sayı değişti:", value);
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
      Title: values.title || undefined,
      Description: values.description || undefined,
      ProjectId: values.projectId || undefined,
      Status: (values.status as TaskStatus) || undefined,
      Weight: values.weight || undefined,
      WeightMin: values.weightMin || undefined,
      WeightMax: values.weightMax || undefined,
      PlannedHours: values.plannedHours || undefined,
      PlannedHoursMin: values.plannedHoursMin || undefined,
      PlannedHoursMax: values.plannedHoursMax || undefined,
      CreatedAtMin: values.createdAtMin
        ? values.createdAtMin.valueOf()
        : undefined,
      CreatedAtMax: values.createdAtMax
        ? values.createdAtMax.valueOf()
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
    { value: TaskStatus.TODO, label: "Yapılacak" },
    { value: TaskStatus.IN_PROGRESS, label: "Devam Ediyor" },
    { value: TaskStatus.DONE, label: "Tamamlandı" },
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
        <Form.Item label="Başlık" name="title" className="mb-3">
          <Input placeholder="Başlık" size="middle" />
        </Form.Item>

        <Form.Item label="Açıklama" name="description" className="mb-3">
          <Input placeholder="Açıklama" size="middle" />
        </Form.Item>

        <Form.Item label="Proje ID" name="projectId" className="mb-3">
          <InputNumber
            placeholder="Proje ID"
            size="middle"
            style={{ width: "100%" }}
            min={1}
          />
        </Form.Item>

        <Form.Item label="Ağırlık (Min)" name="weightMin" className="mb-3">
          <InputNumber
            min={0}
            placeholder="Min ağırlık"
            onChange={onChangeNumber}
            size="middle"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="Ağırlık (Max)" name="weightMax" className="mb-3">
          <InputNumber
            min={0}
            placeholder="Max ağırlık"
            onChange={onChangeNumber}
            size="middle"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="Planlanan Saat (Min)" name="plannedHoursMin" className="mb-3">
          <InputNumber
            min={0}
            placeholder="Min saat"
            onChange={onChangeNumber}
            size="middle"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="Planlanan Saat (Max)" name="plannedHoursMax" className="mb-3">
          <InputNumber
            min={0}
            placeholder="Max saat"
            onChange={onChangeNumber}
            size="middle"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="Oluşturulma (Min)" name="createdAtMin" className="mb-3">
          <DatePicker
            showTime
            placeholder="Min tarih"
            size="middle"
            style={{ width: "100%" }}
            format="YYYY-MM-DD HH:mm:ss"
            onChange={onChangeDate}
          />
        </Form.Item>

        <Form.Item label="Oluşturulma (Max)" name="createdAtMax" className="mb-3">
          <DatePicker
            showTime
            placeholder="Max tarih"
            size="middle"
            style={{ width: "100%" }}
            format="YYYY-MM-DD HH:mm:ss"
            onChange={onChangeDate}
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
