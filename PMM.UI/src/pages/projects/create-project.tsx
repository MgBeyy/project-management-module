import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  AutoComplete,
  Spin,
  Card,
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
export default function CreateProject() {
  const [form] = Form.useForm();
  const [labelForm] = Form.useForm(); // ✅ Label form için ayrı form instance

  // ✅ Müşteri AutoComplete state'leri
  const [customerOptions, setCustomerOptions] = useState<{ value: string }[]>(
    []
  );
  const [customerValue, setCustomerValue] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);

  // ✅ Üst Projeler MultiSelect state'i - YENİ!
  const [selectedParentProjects, setSelectedParentProjects] = useState<
    string[]
  >([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  // ✅ Label oluşturma state'leri - YENİ!
  const [labelLoading, setLabelLoading] = useState(false);
  const [labelColor, setLabelColor] = useState("#1890ff"); // Varsayılan renk
  const [isLabelModalVisible, setIsLabelModalVisible] = useState(false);

  // ✅ Müşteri AutoComplete API çağrısı (ESKİ)
  const handleCustomerSearch = async (searchText: string) => {
    if (!searchText || searchText.trim().length < 2) {
      // ✅ Minimum 2 karakter
      setCustomerOptions([]);
      return;
    }

    setCustomerLoading(true);

    try {
      console.log(
        "🔍 Müşteri API isteği:",
        `https://localhost:7087/api/Client?Search=${searchText}`
      );
      const res = await axios.get("https://localhost:7087/api/Client", {
        params: {
          Search: searchText.trim(), // ✅ Search parametresi
          limit: 50, // ✅ Limit ekle
        },
        timeout: 5000, // ✅ 5 saniye timeout
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("✅ Müşteri API yanıtı:", res.data);

      // ✅ Nested API yapısını parse et (projeler gibi)
      const apiResult = res.data?.result?.data || res.data?.data || res.data;

      // ✅ Array kontrolü
      if (!Array.isArray(apiResult)) {
        console.error(
          "❌ Müşteri API yanıtı array formatında değil:",
          apiResult
        );
        setCustomerOptions([]);
        return;
      }

      // ✅ AutoComplete formatına çevir
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

      console.log("✅ Formatted müşteri options:", data);
      setCustomerOptions(data);
    } catch (err: any) {
      console.error("❌ Müşteri veri çekme hatası:", err);

      // ✅ Hata durumunda mock data (isteğe bağlı)
      if (err.response?.status === 500 || err.code === "ERR_NETWORK") {
        console.warn("🎭 Müşteri mock data kullanılıyor...");

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
    console.log("🏷️ Label modal açılıyor...");
  };

  // ✅ Modal kapatma fonksiyonu
  const handleLabelModalCancel = () => {
    setIsLabelModalVisible(false);
    // ✅ Modal kapanırken form'u temizle
    labelForm.resetFields();
    setLabelColor("#1890ff");
    console.log("❌ Label modal iptal edildi");
  };

  // ✅ Label oluşturma fonksiyonu - güncellendi
  const handleCreateLabel = async (labelValues: any) => {
    setLabelLoading(true);

    try {
      console.log("🏷️ Label oluşturma isteği:", labelValues);

      const labelData = {
        name: labelValues.labelName,
        description: labelValues.labelDescription,
        color: labelColor,
      };

      console.log("📤 Label verisi gönderiliyor:", labelData);

      const response = await axios.post(
        "https://localhost:7087/api/Label",
        labelData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("✅ Label oluşturuldu:", response.data);

      // ✅ Başarı mesajı
      message.success("🎉 Etiket başarıyla oluşturuldu!");

      // ✅ Modal'ı kapat ve form'u temizle
      setIsLabelModalVisible(false);
      labelForm.resetFields();
      setLabelColor("#1890ff");

      // ✅ Yeni oluşturulan etiketi seçili etiketlere ekle (opsiyonel)
      const newLabelId = response.data?.id || response.data?.result?.id;
      if (newLabelId) {
        const updatedLabels = [...selectedLabels, newLabelId.toString()];
        setSelectedLabels(updatedLabels);
        form.setFieldValue("labels", updatedLabels);
      }
    } catch (error: any) {
      console.error("❌ Label oluşturma hatası:", error);

      if (error.response?.status === 400) {
        message.error("❌ Geçersiz etiket bilgileri!");
      } else if (error.response?.status === 409) {
        message.error("❌ Bu isimde etiket zaten mevcut!");
      } else if (error.code === "ERR_NETWORK") {
        message.error("❌ Bağlantı hatası! Backend çalışıyor mu?");
      } else {
        message.error("❌ Etiket oluşturulamadı!");
      }
    } finally {
      setLabelLoading(false);
    }
  };

  // ✅ Renk değişimi fonksiyonu
  const handleColorChange = (color: any) => {
    const hexColor = color.toHexString();
    setLabelColor(hexColor);
    console.log("🎨 Renk değişti:", hexColor);
  };

  // ✅ Üst projeler değiştiğinde - YENİ!
  const handleParentProjectsChange = (values: string[]) => {
    setSelectedParentProjects(values);
    form.setFieldValue("parentProjects", values);
  };
  const handleLabelsChange = (values: string[]) => {
    setSelectedLabels(values);
    form.setFieldValue("labels", values);
  };

  // ✅ AutoComplete change handlers (MÜŞTERI)
  const handleCustomerChange = (data: string) => {
    setCustomerValue(data);
    form.setFieldValue("customer", data);
  };

  // ✅ AutoComplete select handlers (MÜŞTERI)
  const handleCustomerSelect = (data: string) => {
    console.log("Müşteri seçildi:", data);
    setCustomerValue(data);
    form.setFieldValue("customer", data);
  };

  // ✅ Input change handlers
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

  // ✅ Form submit handler
  const handleSubmit = async (values: any) => {
    console.log("✅ Proje oluşturma form değerleri:", values);

    // ✅ API için veriyi hazırla
    const projectData = {
      // ✅ Temel bilgiler
      Code: values.code || undefined,
      Title: values.title || undefined,
      PlannedHourse: values.plannedHours || undefined, // Backend'deki alan adı

      // ✅ Tarih alanları - string formatına çevir
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

      // ✅ Enum değerler
      Status: values.status || undefined,
      Priority: values.priority || undefined,

      // ✅ İlişkili veriler (ID'ler olarak gönder)
      ClientId: values.customer || undefined, // Müşteri ID'si
      ParentProjectIds: selectedParentProjects || [], // Üst proje ID'leri
      LabelIds: selectedLabels || [], // Etiket ID'leri
    };

    // ✅ Undefined değerleri temizle
    const cleanedData = Object.fromEntries(
      Object.entries(projectData).filter(
        ([_, value]) =>
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
      )
    );

    console.log("📤 API'ye gönderilecek proje verisi:", cleanedData);

    // ✅ API çağrısını yap
    try {
      console.log("🚀 Proje oluşturma API isteği başlıyor...");

      const response = await axios.post(
        "https://localhost:7087/api/Project",
        cleanedData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 15000, // 15 saniye timeout
        }
      );

      console.log("✅ Proje başarıyla oluşturuldu:", response.data);

      // ✅ Başarı mesajı göster
      message.success("🎉 Proje başarıyla oluşturuldu!");

      // ✅ Form'u temizle (opsiyonel)
      form.resetFields();
      setCustomerValue("");
      setCustomerOptions([]);
      setSelectedParentProjects([]);
      setSelectedLabels([]);

      // ✅ Projeler sayfasına yönlendir (opsiyonel)
      // navigate("/pm-module/projects");
    } catch (error: any) {
      console.error("❌ Proje oluşturma hatası:", error);

      // ✅ Hata türüne göre mesaj göster
      if (error.response?.status === 400) {
        message.error("❌ Geçersiz proje bilgileri! Lütfen kontrol edin.");
      } else if (error.response?.status === 409) {
        message.error("❌ Bu proje kodu zaten mevcut!");
      } else if (error.response?.status === 500) {
        message.error("❌ Sunucu hatası! Lütfen tekrar deneyin.");
      } else if (error.code === "ERR_NETWORK") {
        message.error("❌ Bağlantı hatası! Backend çalışıyor mu?");
      } else if (error.code === "ECONNABORTED") {
        message.error("❌ İstek zaman aşımına uğradı! Tekrar deneyin.");
      } else {
        message.error("❌ Proje oluşturulamadı! Tekrar deneyin.");
      }

      // ✅ Detaylı hata logları
      if (error.response?.data) {
        console.error("📋 Backend hata detayı:", error.response.data);
      }
    }
  };

  const handleReset = () => {
    form.resetFields();
    // ✅ AutoComplete state'lerini temizle
    setCustomerValue("");
    setCustomerOptions([]);
    setSelectedParentProjects([]); // ✅ MultiSelect temizle
    setSelectedLabels([]); // ✅ Label MultiSelect temizle - YENİ!
    console.log("Form temizlendi");
  };

  const handleBackToProjects = () => {
    console.log("Projeler sayfasına dönülüyor...");
  };

  // ✅ Status options
  const statusOptions = [
    { value: ProjectStatus.ACTIVE, label: "Aktif" },
    { value: ProjectStatus.INACTIVE, label: "Pasif" },
    { value: ProjectStatus.COMPLETED, label: "Tamamlandı" },
    { value: ProjectStatus.PLANNED, label: "Planlandı" },
  ];

  // ✅ Priority options
  const priorityOptions = [
    { value: ProjectPriority.YUKSEK, label: "Yüksek" },
    { value: ProjectPriority.ORTA, label: "Orta" },
    { value: ProjectPriority.DUSUK, label: "Düşük" },
  ];

  // ...existing code...

  return (
    <div className="h-full w-full p-4">
      {/* ✅ Üstte geri dönme butonu */}
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

      {/* ✅ ANA PROJE OLUŞTURMA FORMU */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={(changedValues, allValues) => {
          console.log("📝 Değer değişti:", changedValues);
          console.log("📋 Tüm değerler:", allValues);
        }}
        className="h-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
          {/* ✅ Tüm mevcut form alanları... */}
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

          {/* ✅ Etiketler alanı + Yeni Etiket butonu - GÜNCELLENDİ! */}
          <Form.Item label="Etiketler" name="labels" className="mb-3">
            <div className="space-y-2">
              {/* ✅ MultiSelect */}
              <MultiSelectSearch
                placeholder="Etiket ara ve seç..."
                onChange={handleLabelsChange}
                value={selectedLabels}
                apiUrl="https://localhost:7087/api/Label"
                size="middle"
                className="w-full"
              />

              {/* ✅ Yeni Etiket Oluştur Butonu */}
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

          {/* ✅ Form butonları */}
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

      {/* ✅ ETİKET OLUŞTURMA MODAL'I - YENİ! */}
      <Modal
        title="Yeni Etiket Oluştur"
        open={isLabelModalVisible}
        onCancel={handleLabelModalCancel}
        footer={null} // ✅ Footer'ı kaldır, form'un kendi butonları olacak
        width={600}
        destroyOnHidden={true} // ✅ Modal kapandığında içeriği temizle
      >
        <Form
          form={labelForm}
          layout="vertical"
          onFinish={handleCreateLabel}
          className="mt-4"
        >
          <div className="space-y-4">
            {/* ✅ Label Name */}
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
                autoFocus // ✅ Modal açıldığında odaklan
              />
            </Form.Item>

            {/* ✅ Label Description */}
            <Form.Item label="Etiket Açıklaması" name="labelDescription">
              <Input.TextArea
                placeholder="Etiketin detaylı açıklaması (opsiyonel)"
                rows={3}
                size="middle"
              />
            </Form.Item>

            {/* ✅ Label Color */}
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
                        "#1890ff", // Blue
                        "#52c41a", // Green
                        "#faad14", // Orange
                        "#f5222d", // Red
                        "#722ed1", // Purple
                        "#13c2c2", // Cyan
                        "#fa541c", // Volcano
                        "#a0d911", // Lime
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

            {/* ✅ Modal Butonları */}
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
