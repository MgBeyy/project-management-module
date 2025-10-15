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
  Modal,
  Tag,
} from "antd";
import { useState, useEffect, useCallback } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { AiOutlinePlus, AiOutlineEdit } from "react-icons/ai";
import type { DatePickerProps, InputNumberProps, SelectProps } from "antd";
import dayjs from "dayjs";
import {
  ProjectPriority,
} from "../../services/get-projects";
import MultiSelectSearch, { MultiSelectOption } from "../multi-select-search";
import getMultiSelectSearch from "../../services/get-multi-select-search";
import { getClientsForSelect } from "@/features/projects/services/get-clients-for-select";
import { createLabel } from "@/features/projects/services/create-label";
import { updateLabel } from "@/features/projects/services/update-label";
import { createProject } from "@/features/projects/services/create-project";
import { updateProject, UpdateProjectData } from "../../services/update-project";
import { showNotification } from "@/utils/notification";

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectData?: {
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
    ClientId?: string;
    ParentProjectIds?: string[];
    LabelIds?: string[];
  } | null;
  mode?: 'create' | 'edit' | 'view';
}

const mergeOptions = (
  existing: MultiSelectOption[],
  incoming: MultiSelectOption[]
) => {
  const map = new Map<string, MultiSelectOption>();
  existing.forEach(option => map.set(String(option.value), option));
  incoming.forEach(option => map.set(String(option.value), option));
  return Array.from(map.values());
};

const normalizeLabelOption = (label: any): MultiSelectOption | null => {
  if (!label) {
    return null;
  }

  const id =
    label?.id ?? label?.Id ?? label?.labelId ?? label?.value ?? label?.key;

  if (id === undefined || id === null) {
    return null;
  }

  const stringId = String(id);
  const resolvedName =
    label?.name ||
    label?.title ||
    label?.label ||
    label?.Label ||
    `Label ${stringId}`;

  return {
    value: stringId,
    label: resolvedName,
    key: stringId,
    color: label?.color,
    description: label?.description,
    name: resolvedName,
    ...label,
  };
};

const extractLabelEntity = (response: any) => {
  if (!response) {
    return null;
  }

  const candidate =
    response?.result?.data ||
    response?.data?.result ||
    response?.data?.data ||
    response?.result ||
    response?.data ||
    response;

  if (Array.isArray(candidate)) {
    return candidate[0] || null;
  }

  return candidate;
};

const normalizeProjectOption = (project: any): MultiSelectOption | null => {
  if (!project) {
    return null;
  }

  const id =
    project?.id ??
    project?.Id ??
    project?.projectId ??
    project?.value ??
    project?.key;

  if (id === undefined || id === null) {
    return null;
  }

  const stringId = String(id);

  const resolvedLabel =
    (project?.code && project?.title)
      ? `${project.code} - ${project.title}`
      : project?.title || project?.name || project?.label || `Project ${stringId}`;

  return {
    value: stringId,
    label: resolvedLabel,
    key: stringId,
    ...project,
  };
};

const extractArrayFromResponse = (payload: any): any[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  const candidates = [
    payload?.result?.data,
    payload?.data?.result?.data,
    payload?.data?.data,
    payload?.data,
    payload?.result,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

export default function CreateProjectModal({
  visible,
  onClose,
  onSuccess,
  projectData,
  mode = 'create',
}: CreateProjectModalProps) {
  const [form] = Form.useForm();
  const [labelForm] = Form.useForm();

  const [customerOptions, setCustomerOptions] = useState<
    { value: string; label: string; key: string }[]
  >([]);
  const [defaultCustomerOptions, setDefaultCustomerOptions] = useState<
    { value: string; label: string; key: string }[]
  >([]);
  const [customerValue, setCustomerValue] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);

  const [selectedParentProjects, setSelectedParentProjects] = useState<
    string[]
  >([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [parentProjectOptions, setParentProjectOptions] = useState<MultiSelectOption[]>([]);
  const [labelSelectOptions, setLabelSelectOptions] = useState<MultiSelectOption[]>([]);
  const [labelLoading, setLabelLoading] = useState(false);
  const [labelColor, setLabelColor] = useState("#1890ff");
  const [isLabelModalVisible, setIsLabelModalVisible] = useState(false);
  const [labelModalMode, setLabelModalMode] = useState<'create' | 'edit'>('create');
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = mode === 'edit' && projectData;
  const isViewMode = mode === 'view' && projectData;

  const viewModeFieldStyle: CSSProperties | undefined = isViewMode
    ? {
        backgroundColor: "#f7f9fc",
        color: "#1f1f1f",
        borderColor: "#d9d9d9",
      }
    : undefined;

  const areOptionsEqual = (
    first: MultiSelectOption[],
    second: MultiSelectOption[]
  ) => {
    if (first.length !== second.length) {
      return false;
    }

    const map = new Map<string, MultiSelectOption>();
    first.forEach(option => map.set(String(option.value), option));

    return second.every(option => {
      const key = String(option.value);
      const matched = map.get(key);

      if (!matched) {
        return false;
      }

      const matchedLabel =
        typeof matched.label === "string" ? matched.label : String(matched.label);
      const optionLabel =
        typeof option.label === "string" ? option.label : String(option.label);

      return (
        matchedLabel === optionLabel &&
        (matched as any)?.color === (option as any)?.color &&
        (matched as any)?.description === (option as any)?.description
      );
    });
  };

  const handleLabelOptionsSync = useCallback(
    (options: MultiSelectOption[]) => {
      if (options.length === 0) {
        setLabelSelectOptions(prev => (prev.length === 0 ? prev : []));
        return;
      }

      setLabelSelectOptions(prev => {
        const merged = mergeOptions(prev, options);
        if (areOptionsEqual(prev, merged)) {
          return prev;
        }
        return merged;
      });
    },
    []
  );

  const handleParentOptionsSync = useCallback((options: MultiSelectOption[]) => {
    if (options.length === 0) {
      return;
    }

    setParentProjectOptions(prev => {
      const merged = mergeOptions(prev, options);
      return areOptionsEqual(prev, merged) ? prev : merged;
    });
  }, []);

  const loadInitialSelectData = useCallback(async () => {
    setCustomerLoading(true);

    try {
      const [clientsRaw, labelsRaw, projectsRaw] = await Promise.all([
        getClientsForSelect("", "/Client"),
        getMultiSelectSearch("", "/Label"),
        getMultiSelectSearch("", "/Project"),
      ]);

      const clientOptions = extractArrayFromResponse(clientsRaw)
        .map((item: any) => {
          const rawLabel =
            item?.name ||
            item?.title ||
            item?.companyName ||
            `${item?.firstName || ""} ${item?.lastName || ""}`.trim();

          const normalizedLabel = (rawLabel || "").trim();

          if (!normalizedLabel) {
            return null;
          }

          return {
            value: normalizedLabel,
            label: normalizedLabel,
            key:
              item?.id?.toString?.() ||
              item?.Id?.toString?.() ||
              Math.random().toString(36).slice(2),
          };
        })
        .filter(
          (option): option is { value: string; label: string; key: string } =>
            Boolean(option)
        );

      setCustomerOptions(clientOptions);
      setDefaultCustomerOptions(clientOptions);

      const normalizedLabelOptions = extractArrayFromResponse(labelsRaw)
        .map(normalizeLabelOption)
        .filter((option): option is MultiSelectOption => Boolean(option));

      if (normalizedLabelOptions.length > 0) {
        handleLabelOptionsSync(normalizedLabelOptions);
      }

      const normalizedProjectOptions = extractArrayFromResponse(projectsRaw)
        .map(normalizeProjectOption)
        .filter((option): option is MultiSelectOption => Boolean(option));

      if (normalizedProjectOptions.length > 0) {
        setParentProjectOptions(prev => {
          const merged = mergeOptions(prev, normalizedProjectOptions);
          return areOptionsEqual(prev, merged) ? prev : merged;
        });
      }
    } catch (error) {
      console.error("İlk seçenek verileri yüklenirken hata:", error);
    } finally {
      setCustomerLoading(false);
    }
  }, [handleLabelOptionsSync]);

  const handleReset = useCallback(() => {
    form.resetFields();
    setCustomerValue("");
    setCustomerOptions([]);
    setDefaultCustomerOptions([]);
    setSelectedParentProjects([]);
    setSelectedLabels([]);
    setParentProjectOptions([]);
    setLabelSelectOptions([]);
    setLabelModalMode('create');
    setEditingLabelId(null);
    setLabelColor("#1890ff");
    setIsLabelModalVisible(false);
    console.log("Form temizlendi");
  }, [form]);

  const labelTagRender: SelectProps["tagRender"] = tagProps => {
    const { label, value, closable, onClose, option } = tagProps;

    const handleMouseDown = (event: MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      openLabelModalForEdit(
        String(value),
        option as MultiSelectOption,
        typeof label === "string" ? label : label?.toString?.()
      );
    };

    const resolvedColor = (option as any)?.color || "#4a90e2";

    return (
      <Tag
        color={resolvedColor}
        onMouseDown={handleMouseDown}
        closable={!isViewMode && closable}
        onClose={onClose}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          marginInlineEnd: 4,
          paddingInlineEnd: isViewMode ? 8 : 4,
        }}
      >
        <span>{label}</span>
        {!isViewMode && (
          <Button
            type="text"
            size="small"
            icon={<AiOutlineEdit />}
            onClick={handleEditClick}
          />
        )}
      </Tag>
    );
  };

  // Form'u edit veya view mode'da doldur
  useEffect(() => {
    if (!visible) {
      return;
    }

    loadInitialSelectData();
  }, [visible, loadInitialSelectData]);

  // Form'u edit veya view mode'da doldur
  useEffect(() => {
    if (!visible) {
      return;
    }

    if ((isEditMode || isViewMode) && projectData) {
      const normalizedLabelOptions: MultiSelectOption[] = [];

      const derivedLabelIds =
        projectData.LabelIds && projectData.LabelIds.length > 0
          ? projectData.LabelIds
              .map(id =>
                id !== null && id !== undefined ? String(id) : null
              )
              .filter((id): id is string => Boolean(id))
          : [];

      const derivedParentProjectIds = (projectData.ParentProjectIds || [])
        .map(parentId =>
          parentId !== null && parentId !== undefined ? String(parentId) : null
        )
        .filter((id): id is string => Boolean(id));

      const fallbackLabelOptions = derivedLabelIds
        .filter(
          id =>
            !normalizedLabelOptions.some(
              option => String(option.value) === id
            )
        )
        .map(id => ({
          value: id,
          label: id,
          key: id,
        })) as MultiSelectOption[];

      const combinedOptions = mergeOptions(
        normalizedLabelOptions,
        fallbackLabelOptions
      );

      form.setFieldsValue({
        code: projectData.Code,
        title: projectData.Title,
        plannedStartDate: projectData.rawPlannedStartDate
          ? dayjs(projectData.rawPlannedStartDate)
          : null,
        plannedEndDate: projectData.rawPlannedDeadline
          ? dayjs(projectData.rawPlannedDeadline)
          : null,
        plannedHours: projectData.PlannedHours,
        startedAt: projectData.rawStartedAt
          ? dayjs(projectData.rawStartedAt)
          : null,
        endAt: projectData.rawEndAt ? dayjs(projectData.rawEndAt) : null,
        status: projectData.rawStatus ?? 0,
        priority: projectData.Priority,
        customer: projectData.ClientId || "",
        parentProjects: derivedParentProjectIds,
        labels: derivedLabelIds,
      });

      setCustomerValue(projectData.ClientId || "");
      setSelectedParentProjects(derivedParentProjectIds);
      setSelectedLabels(derivedLabelIds);
      setLabelSelectOptions(combinedOptions);
      setLabelModalMode('create');
      setEditingLabelId(null);

      if (derivedParentProjectIds.length > 0) {
        const normalizedParentOptions = derivedParentProjectIds
          .map(id => ({ value: id, label: id, key: id })) as MultiSelectOption[];

        if (normalizedParentOptions.length > 0) {
          setParentProjectOptions(prev => {
            const merged = mergeOptions(prev, normalizedParentOptions);
            return areOptionsEqual(prev, merged) ? prev : merged;
          });
        }
      }
    } else if (!isEditMode && !isViewMode) {
      // Create mode için formu temizle
      handleReset();
    }
  }, [visible, isEditMode, isViewMode, projectData, handleReset]);

  const handleCustomerSearch = async (searchText: string) => {
    if (!searchText || searchText.trim().length < 2) {
      setCustomerOptions(defaultCustomerOptions);
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

  const openLabelModalForCreate = () => {
    setLabelModalMode('create');
    setEditingLabelId(null);
    labelForm.resetFields();
    setLabelColor("#1890ff");
    setIsLabelModalVisible(true);
    console.log("Label modal (create) açılıyor...");
  };

  const openLabelModalForEdit = (
    labelId: string,
    option?: MultiSelectOption,
    fallbackLabel?: string
  ) => {
    if (isViewMode) {
      return;
    }

    const normalizedId = String(labelId);
    const optionSource =
      option ||
      labelSelectOptions.find(item => String(item.value) === normalizedId);

    if (option) {
      setLabelSelectOptions(prev =>
        mergeOptions(prev, [option as MultiSelectOption])
      );
    }

    const resolvedLabel = (() => {
      if (optionSource?.name) {
        return optionSource.name as string;
      }
      if (typeof optionSource?.label === "string") {
        return optionSource.label;
      }
      if (optionSource?.label != null) {
        return optionSource.label.toString();
      }
      if (fallbackLabel) {
        return fallbackLabel;
      }
      return "";
    })();

    const resolvedDescription =
      (optionSource as any)?.description ||
      (optionSource as any)?.labelDescription ||
      "";

    const resolvedColor =
      ((optionSource as any)?.color as string) || labelColor || "#1890ff";

    labelForm.setFieldsValue({
      labelName: resolvedLabel,
      labelDescription: resolvedDescription,
    });

    setLabelColor(resolvedColor);
    setLabelModalMode('edit');
    setEditingLabelId(normalizedId);
    setIsLabelModalVisible(true);
    console.log("Label modal (edit) açılıyor...", normalizedId);
  };

  const handleLabelCreateButtonClick = () => {
    openLabelModalForCreate();
  };

  const handleLabelModalCancel = () => {
    setIsLabelModalVisible(false);
    labelForm.resetFields();
    setLabelColor("#1890ff");
    setLabelModalMode('create');
    setEditingLabelId(null);
    console.log("Label modal iptal edildi");
  };

  const handleLabelModalSubmit = async (labelValues: any) => {
    setLabelLoading(true);

    try {
      console.log("Label kaydetme isteği (mode:", labelModalMode, "):", labelValues);

      const payload = {
        name: labelValues.labelName,
        description: labelValues.labelDescription,
        color: labelColor,
      };

      let response: any = null;

      if (labelModalMode === 'edit' && editingLabelId) {
        response = await updateLabel(editingLabelId, payload);
        showNotification.success(
          "Etiket Güncellendi",
          " Etiket başarıyla güncellendi!"
        );
      } else {
        response = await createLabel(payload);
        showNotification.success(
          "Etiket Oluşturuldu",
          " Etiket başarıyla oluşturuldu!"
        );
      }

      if (!response) {
        throw new Error("Label yanıtı alınamadı");
      }

      const labelEntity = extractLabelEntity(response);
      const resolvedId =
        labelEntity?.id ?? labelEntity?.Id ?? editingLabelId ?? null;

      if (!resolvedId) {
        console.warn("Label yanıtında ID bulunamadı:", response);
      }

      const normalizedOption =
        normalizeLabelOption({
          ...labelEntity,
          id: labelEntity?.id ?? labelEntity?.Id ?? resolvedId,
          color: labelEntity?.color ?? labelColor,
          description:
            labelEntity?.description ?? labelValues.labelDescription ?? "",
          name: labelEntity?.name ?? labelValues.labelName,
        }) ||
        normalizeLabelOption({
          id: resolvedId,
          name: labelValues.labelName,
          description: labelValues.labelDescription,
          color: labelColor,
        });

      if (normalizedOption) {
        setLabelSelectOptions(prev =>
          mergeOptions(prev, [normalizedOption])
        );
      }

      if (labelModalMode === 'create' && resolvedId) {
        const newId = String(resolvedId);
        const updatedLabels = Array.from(
          new Set([...selectedLabels, newId])
        );
        setSelectedLabels(updatedLabels);
        form.setFieldValue("labels", updatedLabels);
      } else {
        form.setFieldValue("labels", selectedLabels);
      }

      setIsLabelModalVisible(false);
      labelForm.resetFields();
      setLabelColor("#1890ff");
      setLabelModalMode('create');
      setEditingLabelId(null);
    } catch (error: any) {
      console.error("Label kaydetme hatası:", error);
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
    if (isViewMode) {
      return;
    }
    setSelectedParentProjects(values);
    form.setFieldValue("parentProjects", values);
  };
  const handleLabelsChange = (values: string[]) => {
    if (isViewMode) {
      return;
    }
    setSelectedLabels(values);
    form.setFieldValue("labels", values);
  };

  const handleCustomerChange = (data: string) => {
    if (isViewMode) {
      return;
    }
    setCustomerValue(data);
    form.setFieldValue("customer", data);
  };

  const handleCustomerSelect = (data: string) => {
    console.log("Müşteri seçildi:", data);
    if (isViewMode) {
      return;
    }
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
    console.log(`Proje ${isEditMode ? 'güncelleme' : 'oluşturma'} form değerleri:`, values);

    setIsSubmitting(true);

    try {
      if (isEditMode && projectData?.Id) {
        // Update mode
        const updateData: UpdateProjectData = {
          title: values.title,
          plannedStartDate: values.plannedStartDate
            ? values.plannedStartDate.valueOf()
            : null,
          plannedDeadline: values.plannedEndDate
            ? values.plannedEndDate.valueOf()
            : null,
          plannedHours: values.plannedHours || null,
          startedAt: values.startedAt ? values.startedAt.valueOf() : null,
          endAt: values.endAt ? values.endAt.valueOf() : null,
          status: values.status,
          priority: values.priority,
        };

        await updateProject(projectData.Id, updateData);
        showNotification.success("Proje Güncellendi", " Proje başarıyla güncellendi!");
      } else {
        // Create mode
        const createData = {
          Code: values.code || undefined,
          Title: values.title || undefined,
          PlannedHours: values.plannedHours || undefined,

          PlannedStartDate: values.plannedStartDate
            ? values.plannedStartDate.valueOf()
            : undefined,
          PlannedDeadLine: values.plannedEndDate
            ? values.plannedEndDate.valueOf()
            : undefined,
          StartedAt: values.startedAt
            ? values.startedAt.valueOf()
            : undefined,
          EndAt: values.endAt ? values.endAt.valueOf() : undefined,

          Status: values.status || undefined,
          Priority: values.priority || undefined,

          ClientId: values.customer || undefined,
          ParentProjectIds: selectedParentProjects || [],
          LabelIds: selectedLabels || [],
        };

        const cleanedData = Object.fromEntries(
          Object.entries(createData).filter(
            ([_, value]) =>
              value !== undefined &&
              value !== null &&
              value !== "" &&
              !(Array.isArray(value) && value.length === 0)
          )
        );

        console.log("API'ye gönderilecek proje verisi:", cleanedData);

        await createProject(cleanedData);
        showNotification.success("Proje Oluşturuldu", " Proje başarıyla oluşturuldu!");
      }

      handleReset();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error(`Proje ${isEditMode ? 'güncelleme' : 'oluşturma'} hatası:`, error);
      // API client zaten hata mesajını gösteriyor, burada sadece logluyoruz
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  const statusOptions = [
    { value: 0, label: "Planlandı" },
    { value: 1, label: "Aktif" },
    { value: 2, label: "Tamamlandı" },
    { value: 3, label: "Pasif" },
  ];

  const priorityOptions = [
    { value: ProjectPriority.YUKSEK, label: "Yüksek" },
    { value: ProjectPriority.ORTA, label: "Orta" },
    { value: ProjectPriority.DUSUK, label: "Düşük" },
  ];

  return (
    <>
      <Modal
        title={
          isViewMode 
            ? `Proje Detayları: ${projectData?.Code}` 
            : isEditMode 
              ? `Proje Güncelle: ${projectData?.Code}` 
              : "Yeni Proje Oluştur"
        }
        open={visible}
        onCancel={handleModalClose}
        footer={null}
        width={1200}
        destroyOnClose={true}
        styles={{
          body: {
            maxHeight: "70vh",
            overflowY: "auto",
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={isViewMode ? undefined : handleSubmit}
          onValuesChange={(changedValues, allValues) => {
            console.log("Değer değişti:", changedValues);
            console.log("Tüm değerler:", allValues);
          }}
          className="mt-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
            <Form.Item
              label="Proje Kodu"
              name="code"
              rules={[{ required: !isEditMode, message: "Proje kodu zorunludur!" }]}
              className="mb-3"
            >
              <Input 
                placeholder="Örn: PRJ-001" 
                size="middle" 
                disabled={!!isEditMode || !!isViewMode}
                style={viewModeFieldStyle}
              />
            </Form.Item>

            <Form.Item
              label="Proje Başlığı"
              name="title"
              rules={[{ required: true, message: "Proje başlığı zorunludur!" }]}
              className="mb-3"
            >
              <Input
                placeholder="Proje başlığını girin"
                size="middle"
                disabled={!!isViewMode}
                style={viewModeFieldStyle}
              />
            </Form.Item>

            <Form.Item
              label="Planlanan Saat"
              name="plannedHours"
              rules={[{ required: false, message: "Planlanan saat zorunludur!" }]}
              className="mb-3"
            >
              <InputNumber
                min={0}
                max={10000}
                placeholder="Saat"
                onChange={onChangeNumber}
                size="middle"
                style={{
                  width: "100%",
                  ...(viewModeFieldStyle || {}),
                }}
                disabled={!!isViewMode}
              />
            </Form.Item>

            <Form.Item
              label="Planlanan Başlangıç"
              name="plannedStartDate"
              rules={[
                { required: false, message: "Başlangıç tarihi zorunludur!" },
              ]}
              className="mb-3"
            >
              <DatePicker
                onChange={onChangeDate}
                placeholder="Başlangıç tarihi"
                size="middle"
                style={{
                  width: "100%",
                  ...(viewModeFieldStyle || {}),
                }}
                format="YYYY-MM-DD"
                disabled={!!isViewMode}
              />
            </Form.Item>

            <Form.Item
              label="Planlanan Bitiş"
              name="plannedEndDate"
              rules={[{ required: false, message: "Bitiş tarihi zorunludur!" }]}
              className="mb-3"
            >
              <DatePicker
                placeholder="Bitiş tarihi"
                size="middle"
                style={{
                  width: "100%",
                  ...(viewModeFieldStyle || {}),
                }}
                format="YYYY-MM-DD"
                disabled={!!isViewMode}
              />
            </Form.Item>

            <Form.Item label="Başlangıç Zamanı" name="startedAt" className="mb-3">
              <DatePicker
                placeholder="Başlangıç zamanı"
                size="middle"
                style={{
                  width: "100%",
                  ...(viewModeFieldStyle || {}),
                }}
                format="YYYY-MM-DD"
                disabled={!!isViewMode}
              />
            </Form.Item>

            <Form.Item label="Bitiş Zamanı" name="endAt" className="mb-3">
              <DatePicker
                placeholder="Bitiş zamanı"
                size="middle"
                style={{
                  width: "100%",
                  ...(viewModeFieldStyle || {}),
                }}
                format="YYYY-MM-DD"
                disabled={!!isViewMode}
              />
            </Form.Item>

            <Form.Item
              label="Proje Durumu"
              name="status"
              rules={[{ required: false, message: "Proje durumu zorunludur!" }]}
              className="mb-3"
            >
              <Select
                placeholder="Durum seçin"
                allowClear
                onChange={onChangeSelect}
                size="middle"
                style={{
                  width: "100%",
                  ...(viewModeFieldStyle || {}),
                }}
                options={statusOptions}
                disabled={!!isViewMode}
              />
            </Form.Item>

            <Form.Item
              label="Proje Önceliği"
              name="priority"
              rules={[{ required: false, message: "Proje önceliği zorunludur!" }]}
              className="mb-3"
            >
              <Select
                placeholder="Öncelik seçin"
                allowClear
                onChange={onChangeSelect}
                size="middle"
                style={{
                  width: "100%",
                  ...(viewModeFieldStyle || {}),
                }}
                options={priorityOptions}
                disabled={!!isViewMode}
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
                style={{
                  width: "100%",
                  ...(viewModeFieldStyle || {}),
                }}
                filterOption={false}
                showSearch={true}
                disabled={!!isViewMode}
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
                disabled={isViewMode}
                style={{
                  width: "100%",
                  ...(viewModeFieldStyle || {}),
                }}
                initialOptions={parentProjectOptions}
                onOptionsChange={handleParentOptionsSync}
              />
            </Form.Item>

            <Form.Item label="Etiketler" name="labels" className="mb-3">
              <div className="space-y-2 flex flex-row gap-2">
                <MultiSelectSearch
                  placeholder="Etiket ara ve seç..."
                  onChange={handleLabelsChange}
                  value={selectedLabels}
                  apiUrl="/Label"
                  size="middle"
                  className="w-full flex-1"
                  disabled={isViewMode}
                  style={{
                    width: "100%",
                    ...(viewModeFieldStyle || {}),
                  }}
                  initialOptions={labelSelectOptions}
                  tagRender={labelTagRender}
                  onOptionsChange={handleLabelOptionsSync}
                />

                {!isViewMode && (
                  <Button
                    type="dashed"
                    icon={<AiOutlinePlus />}
                    onClick={handleLabelCreateButtonClick}
                    size="middle"
                    className="w-full h-[32px] flex items-center justify-center gap-1"
                    style={{
                      borderStyle: "dashed",
                      color: "#52c41a",
                      borderColor: "#52c41a",
                    }}
                  >
                  </Button>
                )}
              </div>
            </Form.Item>
          </div>

          <Form.Item className="mb-0 mt-6">
            <div className="flex justify-end w-full gap-3">
              <Button
                onClick={handleModalClose}
                size="middle"
                className="min-w-[100px]"
              >
                {isViewMode ? "Kapat" : "İptal"}
              </Button>
              {!isViewMode && (
                <>
                  {!isEditMode && (
                    <Button
                      onClick={handleReset}
                      size="middle"
                      className="min-w-[100px]"
                    >
                      Temizle
                    </Button>
                  )}
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="middle"
                    className="min-w-[100px]"
                    loading={isSubmitting}
                  >
                    {isSubmitting 
                      ? (isEditMode ? "Güncelleniyor..." : "Oluşturuluyor...") 
                      : (isEditMode ? "Proje Güncelle" : "Proje Oluştur")
                    }
                  </Button>
                </>
              )}
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={labelModalMode === 'edit' ? "Etiketi Düzenle" : "Yeni Etiket Oluştur"}
        open={isLabelModalVisible}
        onCancel={handleLabelModalCancel}
        footer={null}
        width={600}
        destroyOnClose={true}
      >
        <Form
          form={labelForm}
          layout="vertical"
          onFinish={handleLabelModalSubmit}
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
                  {labelLoading
                    ? labelModalMode === 'edit'
                      ? "Güncelleniyor..."
                      : "Oluşturuluyor..."
                    : labelModalMode === 'edit'
                      ? "Etiket Güncelle"
                      : "Etiket Oluştur"}
                </Button>
              </div>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
}
