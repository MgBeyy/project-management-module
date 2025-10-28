import { Button, DatePicker, Form, Input, InputNumber, Select } from "antd";
import { useState, useEffect, useCallback } from "react";
import { useTasksStore } from "@/store/zustand/tasks-store";
import { TaskStatus } from "@/services/tasks/get-tasks";
import getMultiSelectSearch from "@/services/projects/get-multi-select-search";
import type { SelectProps } from "antd";

const MIN_SEARCH_LENGTH = 2;

type BaseSelectOption = NonNullable<SelectProps["options"]>[number];

interface SelectOption extends BaseSelectOption {
  value: number;
  label: string;
  key: string;
  raw?: any;
}

const extractArrayFromResponse = (payload: any): any[] => {
  if (!payload) {
    return [];
  }
  const candidates = [
    payload?.data
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

const normalizeProjectOption = (project: any): SelectOption | null => {
  const rawId = project?.id

  const numericId = Number(rawId);

  if (!rawId || Number.isNaN(numericId)) {
    return null;
  }

  const projectCode = project?.code;
  const projectTitle = project?.title;

  const composedLabel = [projectCode, projectTitle]
    .filter(Boolean)
    .join(" - ")
    .trim();
  const label = composedLabel;
  return {
    value: numericId,
    label,
    key: String(numericId),
    raw: project,
  };
};

export default function TasksFilter() {
  const [form] = Form.useForm();
  const { setFilters, resetFilters } = useTasksStore();

  const [projectOptions, setProjectOptions] = useState<SelectOption[]>([]);
  const [defaultProjectOptions, setDefaultProjectOptions] = useState<SelectOption[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);

  const loadInitialProjectData = useCallback(async () => {
    setProjectLoading(true);
    try {
      const projectsRaw = await getMultiSelectSearch("", "/Project");
      const projectList = extractArrayFromResponse(projectsRaw)
        .map(normalizeProjectOption)
        .filter((option): option is SelectOption => Boolean(option));

      setProjectOptions(projectList);
      setDefaultProjectOptions(projectList);
    } catch (error) {
      console.error("Proje seçenekleri yüklenirken hata:", error);
    } finally {
      setProjectLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialProjectData();
  }, [loadInitialProjectData]);

  const handleProjectSearch = useCallback(
    async (searchText: string) => {
      const trimmed = searchText.trim();

      if (!trimmed || trimmed.length < MIN_SEARCH_LENGTH) {
        setProjectOptions(defaultProjectOptions);
        return;
      }

      setProjectLoading(true);
      try {
        const projectsRaw = await getMultiSelectSearch(trimmed, "/Project");
        const projectList = extractArrayFromResponse(projectsRaw)
          .map(normalizeProjectOption)
          .filter((option): option is SelectOption => Boolean(option));

        setProjectOptions(projectList);
      } catch (error) {
        console.error("Proje arama hatası:", error);
      } finally {
        setProjectLoading(false);
      }
    },
    [defaultProjectOptions]
  );

  const handleProjectChange = useCallback(
    (value: number | undefined) => {
      // Filter için project değiştiğinde herhangi bir işlem yapmıyoruz
      console.log("Project changed:", value);
    },
    []
  );

  const ensureProjectOptions = useCallback(
    (open: boolean) => {
      if (open && projectOptions.length === 0 && defaultProjectOptions.length > 0) {
        setProjectOptions(defaultProjectOptions);
      }
    },
    [defaultProjectOptions, projectOptions.length]
  );

  const handleSubmit = (values: any) => {
    const serializedPayload = {
      Title: values.title || undefined,
      Description: values.description || undefined,
      ProjectId: values.projectId || undefined,
      Status: (values.status as TaskStatus) || undefined,
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
    { value: TaskStatus.INACTIVE, label: "Pasif" },
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
        <Form.Item
          label="Proje"
          name="projectId"
          className="mb-3"
        >
          <Select
            showSearch
            placeholder="Proje seçin..."
            options={projectOptions}
            onSearch={handleProjectSearch}
            onChange={handleProjectChange}
            onDropdownVisibleChange={ensureProjectOptions}
            filterOption={false}
            allowClear
            loading={projectLoading}
          />
        </Form.Item>
        <Form.Item label="Planlanan Saat (Min)" name="plannedHoursMin" className="mb-3">
          <InputNumber
            min={0}
            placeholder="Min saat"
            size="middle"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="Planlanan Saat (Maks)" name="plannedHoursMax" className="mb-3">
          <InputNumber
            min={0}
            placeholder="Maks saat"
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
            format="DD-MM-YYYY HH:mm:ss"
          />
        </Form.Item>

        <Form.Item label="Oluşturulma (Maks)" name="createdAtMax" className="mb-3">
          <DatePicker
            showTime
            placeholder="Maks tarih"
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
