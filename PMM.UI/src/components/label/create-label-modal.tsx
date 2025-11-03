import { Button, Form, Input, Modal, ColorPicker } from "antd";
import { useState, useEffect } from "react";
import { createLabel } from "@/services/labels/create-label";
import { updateLabel } from "@/services/labels/update-label";
import { showNotification } from "@/utils/notification";
import { CreateLabelModalProps } from "@/types/projects/ui";



export default function CreateLabelModal({
  visible,
  mode,
  initialData,
  onSuccess,
  onCancel,
}: CreateLabelModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState("#1890ff");

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        form.setFieldsValue({
          labelName: initialData.name || '',
          labelDescription: initialData.description || '',
        });
        setColor(initialData.color || '#1890ff');
      } else {
        form.resetFields();
        setColor('#1890ff');
      }
    }
  }, [visible, mode, initialData, form]);

  const handleCancel = () => {
    form.resetFields();
    setColor('#1890ff');
    onCancel();
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      const payload = {
        name: values.labelName,
        description: values.labelDescription,
        color: color,
      };

      let response: any = null;

      if (mode === 'edit' && initialData?.id) {
        response = await updateLabel(initialData.id, payload);
        showNotification.success(
          "Etiket Güncellendi",
          "Etiket başarıyla güncellendi!"
        );
      } else {
        response = await createLabel(payload);
        showNotification.success(
          "Etiket Oluşturuldu",
          "Etiket başarıyla oluşturuldu!"
        );
      }

      if (!response) {
        throw new Error("Label yanıtı alınamadı");
      }

      // Extract label entity from response
      const labelData = response.result || response;

      // Normalize to MultiSelectOption format
      const normalizedLabel = {
        value: labelData.id?.toString(),
        label: labelData.name,
        key: labelData.id?.toString(),
        name: labelData.name,
        description: labelData.description,
        color: labelData.color,
        ...labelData,
      };

      onSuccess?.(normalizedLabel);
      handleCancel();
    } catch (error: any) {
      console.error("Label kaydetme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (colorValue: any) => {
    const hexColor = colorValue.toHexString();
    setColor(hexColor);
  };

  return (
    <Modal
      title={mode === 'edit' ? "Etiketi Düzenle" : "Yeni Etiket Oluştur"}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnHidden={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
                value={color}
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
                style={{ backgroundColor: color }}
                title={`Seçilen renk: ${color}`}
              />
              <span className="text-sm text-gray-500">{color}</span>
            </div>
          </Form.Item>

          <Form.Item className="mb-0 pt-4">
            <div className="flex justify-end gap-3">
              <Button onClick={handleCancel} size="middle">
                İptal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="middle"
                style={{
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                }}
              >
                {loading
                  ? mode === 'edit'
                    ? "Güncelleniyor..."
                    : "Oluşturuluyor..."
                  : mode === 'edit'
                    ? "Etiket Güncelle"
                    : "Etiket Oluştur"}
              </Button>
            </div>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
