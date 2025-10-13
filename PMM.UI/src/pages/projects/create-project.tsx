import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  AutoComplete,
  Spin,
  ColorPicker,
  message,
  Modal,
} from "antd";
import { useState } from "react";
import { AiOutlineArrowLeft, AiOutlinePlus } from "react-icons/ai";
import type { DatePickerProps, InputNumberProps } from "antd";
import {
  ProjectStatus,
  ProjectPriority,
} from "../../features/projects/services/get-projects";
import axios from "axios";
import MultiSelectSearch from "../../features/projects/components/multi-select-search";
import { Link } from "react-router-dom";
import { getClientsForSelect } from "@/features/projects/services/get-clients-for-select";
import { createLabel } from "@/features/projects/services/create-label";
import { createProject } from "@/features/projects/services/create-project";
export default function CreateProject() {
  const [form] = Form.useForm();
  const [labelForm] = Form.useForm();

  const [customerOptions, setCustomerOptions] = useState<{ value: string }[]>(
    []
  );
  const [customerValue, setCustomerValue] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);

  const [selectedParentProjects, setSelectedParentProjects] = useState<
    string[]
  >([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelLoading, setLabelLoading] = useState(false);
  const [labelColor, setLabelColor] = useState("#1890ff");
  const [isLabelModalVisible, setIsLabelModalVisible] = useState(false);

  const handleCustomerSearch = async (searchText: string) => {
    if (!searchText || searchText.trim().length < 2) {
      setCustomerOptions([]);
      return;
    }

    setCustomerLoading(true);

    try {
      const constructedUrl = `/Client?Search=${encodeURIComponent(
        searchText
      )}`;
      console.log("🔍 Müşteri API isteği:", constructedUrl);
      const res = await getClientsForSelect(searchText, "/Client");

      console.log("✅ Müşteri API yanıtı:", res.data);

      const apiResult = res.data?.result?.data || res.data?.data || res.data;

      if (!Array.isArray(apiResult)) {
        console.error("Müşteri API yanıtı array formatında değil:", apiResult);
        setCustomerOptions([]);
        return;
      }

      const data = apiResult.map((item: any) => ({
        value:
          item.name ||
          item.title ||
          `${item.firstName} ${item.lastName}`.trim(),
        label:
          item.name ||
          item.title ||
          `${item.firstName} ${item.lastName}`.trim(),
        key: item.id?.toString() || Math.random().toString(),
      }));

      console.log("Formatted müşteri options:", data);
      setCustomerOptions(data);
    } catch (err: any) {
      console.error("Müşteri veri çekme hatası:", err);

      if (err.response?.status === 500 || err.code === "ERR_NETWORK") {
        console.warn("Müşteri mock data kullanılıyor...");

        const mockCustomers = [
          { value: "ABC Şirketi", label: "ABC Şirketi", key: "1" },
          { value: "XYZ Ltd.", label: "XYZ Ltd.", key: "2" },
          { value: "Test Müşteri", label: "Test Müşteri", key: "3" },
        ].filter(customer =>
          customer.value.toLowerCase().includes(searchText.toLowerCase())
        );

        setCustomerOptions(mockCustomers);
      } else {
        setCustomerOptions([]);
      }
    } finally {
      setCustomerLoading(false);
    }
  };

  const showLabelModal = () => {
    setIsLabelModalVisible(true);
    console.log("Label modal açılıyor...");
  };

  const handleLabelModalCancel = () => {
    setIsLabelModalVisible(false);
    labelForm.resetFields();
    setLabelColor("#1890ff");
    console.log("Label modal iptal edildi");
  };

  const handleCreateLabel = async (labelValues: any) => {
    setLabelLoading(true);

    try {
      console.log("Label oluşturma isteği:", labelValues);

      const labelData = {
        name: labelValues.labelName,
        description: labelValues.labelDescription,
        color: labelColor,
      };

      console.log("Label verisi gönderiliyor:", labelData);

      const response = await createLabel(labelData);

      console.log("Label oluşturuldu:", response.data);

      message.success("Etiket başarıyla oluşturuldu!");

      setIsLabelModalVisible(false);
      labelForm.resetFields();
      setLabelColor("#1890ff");

      const newLabelId = response.data?.id || response.data?.result?.id;
      if (newLabelId) {
        const updatedLabels = [...selectedLabels, newLabelId.toString()];
        setSelectedLabels(updatedLabels);
        form.setFieldValue("labels", updatedLabels);
      }
    } catch (error: any) {
      console.error("Label oluşturma hatası:", error);

      if (error.response?.status === 400) {
        message.error("Geçersiz etiket bilgileri!");
      } else if (error.response?.status === 409) {
        message.error("Bu isimde etiket zaten mevcut!");
      } else if (error.code === "ERR_NETWORK") {
        message.error("Bağlantı hatası! Backend çalışıyor mu?");
      } else {
        message.error("Etiket oluşturulamadı!");
      }
    } finally {
      setLabelLoading(false);
    }
  };

  const handleColorChange = (color: any) => {
    const hexColor = color.toHexString();
    setLabelColor(hexColor);
    console.log("Renk değişti:", hexColor);
  };

  const handleParentProjectsChange = (values: string[]) => {
    setSelectedParentProjects(values);
    form.setFieldValue("parentProjects", values);
  };
  const handleLabelsChange = (values: string[]) => {
    setSelectedLabels(values);
    form.setFieldValue("labels", values);
  };

  const handleCustomerChange = (data: string) => {
    setCustomerValue(data);
    form.setFieldValue("customer", data);
  };

  const handleCustomerSelect = (data: string) => {
    console.log("Müşteri seçildi:", data);
    setCustomerValue(data);
    form.setFieldValue("customer", data);
  };

  const onChangeNumber: InputNumberProps["onChange"] = value => {
    console.log("Saat değişti:", value);
    form.setFieldValue("plannedHours", value);
  };

  const onChangeDate: DatePickerProps["onChange"] = (date, dateString) => {
    console.log("Tarih değişti:", date, dateString);
  };

  const onChangeSelect = (value: string, option: any) => {
    console.log("Select değişti:", value, option);
  };

  const handleSubmit = async (values: any) => {
    console.log("Proje oluşturma form değerleri:", values);

    const projectData = {
      Code: values.code || undefined,
      Title: values.title || undefined,
      PlannedHourse: values.plannedHours || undefined,

      PlannedStartDate: values.plannedStartDate
        ? values.plannedStartDate.format("YYYY-MM-DD")
        : undefined,
      PlannedDeadLine: values.plannedEndDate
        ? values.plannedEndDate.format("YYYY-MM-DD")
        : undefined,
      StartedAt: values.startedAt
        ? values.startedAt.format("YYYY-MM-DD")
        : undefined,
      EndAt: values.endAt ? values.endAt.format("YYYY-MM-DD") : undefined,

      Status: values.status || undefined,
      Priority: values.priority || undefined,

      ClientId: values.customer || undefined,
      ParentProjectIds: selectedParentProjects || [],
      LabelIds: selectedLabels || [],
    };

    const cleanedData = Object.fromEntries(
      Object.entries(projectData).filter(
        ([_, value]) =>
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
      )
    );

    console.log("API'ye gönderilecek proje verisi:", cleanedData);

    try {
      console.log("Proje oluşturma API isteği başlıyor...");

      const response = await createProject(cleanedData);

      console.log("✅ Proje başarıyla oluşturuldu:", response.data);

      message.success("🎉 Proje başarıyla oluşturuldu!");

      form.resetFields();
      setCustomerValue("");
      setCustomerOptions([]);
      setSelectedParentProjects([]);
      setSelectedLabels([]);
    } catch (error: any) {
      console.error("Proje oluşturma hatası:", error);

      if (error.response?.status === 400) {
        message.error("Geçersiz proje bilgileri! Lütfen kontrol edin.");
      } else if (error.response?.status === 409) {
        message.error("Bu proje kodu zaten mevcut!");
      } else if (error.response?.status === 500) {
        message.error("Sunucu hatası! Lütfen tekrar deneyin.");
      } else if (error.code === "ERR_NETWORK") {
        message.error("Bağlantı hatası! Backend çalışıyor mu?");
      } else if (error.code === "ECONNABORTED") {
        message.error("İstek zaman aşımına uğradı! Tekrar deneyin.");
      } else {
        message.error("Proje oluşturulamadı! Tekrar deneyin.");
      }

      if (error.response?.data) {
        console.error("Backend hata detayı:", error.response.data);
      }
    }
  };

  const handleReset = () => {
    form.resetFields();
    setCustomerValue("");
    setCustomerOptions([]);
    setSelectedParentProjects([]);
    setSelectedLabels([]);
    console.log("Form temizlendi");
  };

  const handleBackToProjects = () => {
    console.log("Projeler sayfasına dönülüyor...");
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
    <div className="h-full w-full p-4">
      <div className="mb-6">
        <Link to="/pm-module/projects">
          <Button
            type="dashed"
            icon={<AiOutlineArrowLeft />}
            onClick={handleBackToProjects}
            size="middle"
            className="flex items-center gap-2"
          >
            Projeler Sayfasına Dön
          </Button>
        </Link>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={(changedValues, allValues) => {
          console.log("Değer değişti:", changedValues);
          console.log("Tüm değerler:", allValues);
        }}
        className="h-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
          <Form.Item
            label="Proje Kodu"
            name="code"
            rules={[{ required: true, message: "Proje kodu zorunludur!" }]}
            className="mb-3"
          >
            <Input placeholder="Örn: PRJ-001" size="middle" />
          </Form.Item>

          <Form.Item
            label="Proje Başlığı"
            name="title"
            rules={[{ required: true, message: "Proje başlığı zorunludur!" }]}
            className="mb-3"
          >
            <Input placeholder="Proje başlığını girin" size="middle" />
          </Form.Item>

          <Form.Item
            label="Planlanan Saat"
            name="plannedHours"
            rules={[{ required: true, message: "Planlanan saat zorunludur!" }]}
            className="mb-3"
          >
            <InputNumber
              min={0}
              max={10000}
              placeholder="Saat"
              onChange={onChangeNumber}
              size="middle"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Planlanan Başlangıç"
            name="plannedStartDate"
            rules={[
              { required: true, message: "Başlangıç tarihi zorunludur!" },
            ]}
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
            rules={[{ required: true, message: "Bitiş tarihi zorunludur!" }]}
            className="mb-3"
          >
            <DatePicker
              placeholder="Bitiş tarihi"
              size="middle"
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item label="Başlangıç Zamanı" name="startedAt" className="mb-3">
            <DatePicker
              placeholder="Başlangıç zamanı"
              size="middle"
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item label="Bitiş Zamanı" name="endAt" className="mb-3">
            <DatePicker
              placeholder="Bitiş zamanı"
              size="middle"
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item
            label="Proje Durumu"
            name="status"
            rules={[{ required: true, message: "Proje durumu zorunludur!" }]}
            className="mb-3"
          >
            <Select
              placeholder="Durum seçin"
              allowClear
              onChange={onChangeSelect}
              size="middle"
              style={{ width: "100%" }}
              options={statusOptions}
            />
          </Form.Item>

          <Form.Item
            label="Proje Önceliği"
            name="priority"
            rules={[{ required: true, message: "Proje önceliği zorunludur!" }]}
            className="mb-3"
          >
            <Select
              placeholder="Öncelik seçin"
              allowClear
              onChange={onChangeSelect}
              size="middle"
              style={{ width: "100%" }}
              options={priorityOptions}
            />
          </Form.Item>

          <Form.Item label="Müşteri" name="customer" className="mb-3">
            <AutoComplete
              value={customerValue}
              options={customerOptions}
              onSearch={handleCustomerSearch}
              onChange={handleCustomerChange}
              onSelect={handleCustomerSelect}
              placeholder="Müşteri ara... (min 2 karakter)"
              notFoundContent={
                customerLoading ? (
                  <div className="flex justify-center items-center py-2">
                    <Spin size="small" />
                    <span className="ml-2">Müşteriler aranıyor...</span>
                  </div>
                ) : customerValue && customerValue.length >= 2 ? (
                  "Müşteri bulunamadı"
                ) : (
                  "En az 2 karakter yazın"
                )
              }
              allowClear
              size="middle"
              style={{ width: "100%" }}
              filterOption={false}
              showSearch={true}
            />
          </Form.Item>

          <Form.Item
            label="Üst Projeler"
            name="parentProjects"
            className="mb-3"
          >
            <MultiSelectSearch
              placeholder="Üst proje ara ve seç..."
              onChange={handleParentProjectsChange}
              value={selectedParentProjects}
              apiUrl="/Project"
              size="middle"
              className="w-full"
            />
          </Form.Item>

          <Form.Item label="Etiketler" name="labels" className="mb-3">
            <div className="space-y-2">
              <MultiSelectSearch
                placeholder="Etiket ara ve seç..."
                onChange={handleLabelsChange}
                value={selectedLabels}
                apiUrl="/Label"
                size="middle"
                className="w-full"
              />

              <Button
                type="dashed"
                icon={<AiOutlinePlus />}
                onClick={showLabelModal}
                size="small"
                className="w-full flex items-center justify-center gap-1"
                style={{
                  borderStyle: "dashed",
                  color: "#52c41a",
                  borderColor: "#52c41a",
                }}
              >
                Yeni Etiket Oluştur
              </Button>
            </div>
          </Form.Item>

          <Form.Item className="mb-3 flex items-end col-span-full">
            <div className="flex justify-end w-full gap-3">
              <Button
                onClick={handleReset}
                size="middle"
                className="min-w-[100px]"
              >
                Temizle
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="middle"
                className="min-w-[100px]"
              >
                Proje Oluştur
              </Button>
            </div>
          </Form.Item>
        </div>
      </Form>

      <Modal
        title="Yeni Etiket Oluştur"
        open={isLabelModalVisible}
        onCancel={handleLabelModalCancel}
        footer={null}
        width={600}
        destroyOnHidden={true}
      >
        <Form
          form={labelForm}
          layout="vertical"
          onFinish={handleCreateLabel}
          className="mt-4"
        >
          <div className="space-y-4">
            <Form.Item
              label="Etiket Adı"
              name="labelName"
              rules={[
                { required: true, message: "Etiket adı gereklidir!" },
                { min: 2, message: "En az 2 karakter olmalıdır!" },
              ]}
            >
              <Input
                placeholder="Örn: Frontend, Backend, Bug Fix..."
                size="middle"
                autoFocus
              />
            </Form.Item>

            <Form.Item label="Etiket Açıklaması" name="labelDescription">
              <Input.TextArea
                placeholder="Etiketin detaylı açıklaması (opsiyonel)"
                rows={3}
                size="middle"
              />
            </Form.Item>

            <Form.Item label="Etiket Rengi">
              <div className="flex items-center gap-3">
                <ColorPicker
                  value={labelColor}
                  onChange={handleColorChange}
                  size="middle"
                  showText
                  format="hex"
                  presets={[
                    {
                      label: "Recommended",
                      colors: [
                        "#1890ff",
                        "#52c41a",
                        "#faad14",
                        "#f5222d",
                        "#722ed1",
                        "#13c2c2",
                        "#fa541c",
                        "#a0d911",
                      ],
                    },
                  ]}
                />
                <div
                  className="w-10 h-10 rounded border-2 border-gray-300"
                  style={{ backgroundColor: labelColor }}
                  title={`Seçilen renk: ${labelColor}`}
                />
                <span className="text-sm text-gray-500">{labelColor}</span>
              </div>
            </Form.Item>

            <Form.Item className="mb-0 pt-4">
              <div className="flex justify-end gap-3">
                <Button onClick={handleLabelModalCancel} size="middle">
                  İptal
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={labelLoading}
                  size="middle"
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                  }}
                >
                  {labelLoading ? "Oluşturuluyor..." : "Etiket Oluştur"}
                </Button>
              </div>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
