import { useState, useEffect, useCallback } from "react";
import { Modal, Form, Input, InputNumber, Select, Row, Col } from "antd";
import type { SelectProps } from "antd";
import { createTask } from "../../services/create-task";
import { useTasksStore } from "@/store/zustand/tasks-store";
import { TaskStatus } from "../../services/get-tasks";
import { useNotification } from "@/hooks/useNotification";
import getMultiSelectSearch from "@/features/projects/services/get-multi-select-search";
import { getTasksForSelect } from "../../services/get-tasks-for-select";

const { TextArea } = Input;
const MIN_SEARCH_LENGTH = 2;

type BaseSelectOption = NonNullable<SelectProps["options"]>[number];

interface SelectOption extends BaseSelectOption {
  value: number;
  label: string;
  key: string;
  raw?: any;
}

const mergeOptions = (existing: SelectOption[], incoming: SelectOption[]) => {
  const map = new Map<string, SelectOption>();
  existing.forEach(option => map.set(String(option.value), option));
  incoming.forEach(option => map.set(String(option.value), option));
  return Array.from(map.values());
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

const normalizeProjectOption = (project: any): SelectOption | null => {
  if (!project) {
    return null;
  }

  const rawId =
    project?.id ??
    project?.Id ??
    project?.projectId ??
    project?.value ??
    project?.key;

  const numericId = Number(rawId);

  if (!rawId || Number.isNaN(numericId)) {
    return null;
  }

  const projectCode = project?.code || project?.Code;
  const projectTitle = project?.title || project?.Title || project?.name;

  const composedLabel = [projectCode, projectTitle]
    .filter(Boolean)
    .join(" - ")
    .trim();

  const label = composedLabel || `Proje #${numericId}`;

  return {
    value: numericId,
    label,
    key: String(numericId),
    raw: project,
  };
};

const normalizeTaskOption = (task: any): SelectOption | null => {
  if (!task) {
    return null;
  }

  const rawId =
    task?.id ??
    task?.Id ??
    task?.taskId ??
    task?.value ??
    task?.key;

  const numericId = Number(rawId);

  if (!rawId || Number.isNaN(numericId)) {
    return null;
  }

  const taskCode = task?.code || task?.Code;
  const taskTitle = task?.title || task?.Title || `Görev #${numericId}`;
  const projectCode = task?.projectCode || task?.ProjectCode;

  const labelParts = [
    taskCode,
    taskTitle,
    projectCode ? `(Proje: ${projectCode})` : undefined,
  ].filter(Boolean);

  return {
    value: numericId,
    label: labelParts.join(" - "),
    key: String(numericId),
    raw: task,
  };
};

export default function CreateTaskModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const notification = useNotification();
  const [form] = Form.useForm();
  const { triggerRefresh } = useTasksStore();

  const [projectOptions, setProjectOptions] = useState<SelectOption[]>([]);
  const [defaultProjectOptions, setDefaultProjectOptions] = useState<SelectOption[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);

  const [parentTaskOptions, setParentTaskOptions] = useState<SelectOption[]>([]);
  const [defaultParentTaskOptions, setDefaultParentTaskOptions] = useState<SelectOption[]>([]);
  const [parentTaskLoading, setParentTaskLoading] = useState(false);

  const loadInitialSelectData = useCallback(async () => {
    setProjectLoading(true);
    setParentTaskLoading(true);

    try {
      const [projectsRaw, tasksRaw] = await Promise.all([
        getMultiSelectSearch("", "/Project"),
        getTasksForSelect({ pageSize: 20 }),
      ]);

      const projectList = extractArrayFromResponse(projectsRaw)
        .map(normalizeProjectOption)
        .filter((option): option is SelectOption => Boolean(option));

      setProjectOptions(projectList);
      setDefaultProjectOptions(projectList);

      const taskList = extractArrayFromResponse(tasksRaw)
        .map(normalizeTaskOption)
        .filter((option): option is SelectOption => Boolean(option));

      setParentTaskOptions(taskList);
      setDefaultParentTaskOptions(taskList);
    } catch (error) {
      console.error("Görev oluşturma modalı seçenekleri yüklenirken hata:", error);
    } finally {
      setProjectLoading(false);
      setParentTaskLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadInitialSelectData();
    }
  }, [visible, loadInitialSelectData]);

  const handleCreate = async (values: any) => {
    try {
      await createTask(values);
      notification.success("Görev Oluşturuldu", " Görev başarıyla oluşturuldu!");
      triggerRefresh();
      form.resetFields();
      onClose();
    } catch (error: any) {
      console.error("Görev oluşturma hatası:", error);

      if (error.response?.data) {
        console.error("Backend hata detayı:", error.response.data);
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setProjectOptions(defaultProjectOptions);
    setParentTaskOptions(defaultParentTaskOptions);
    onClose();
  };

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

  const fetchParentTasks = useCallback(
    async (searchText: string, projectId?: number) => {
      const trimmed = searchText.trim();
      const shouldSearch = trimmed.length >= MIN_SEARCH_LENGTH;

      if (!shouldSearch && !projectId) {
        setParentTaskOptions(defaultParentTaskOptions);
        return;
      }

      setParentTaskLoading(true);
      try {
        const tasksRaw = await getTasksForSelect({
          searchText: shouldSearch ? trimmed : "",
          projectId,
          pageSize: 20,
        });

        const taskList = extractArrayFromResponse(tasksRaw)
          .map(normalizeTaskOption)
          .filter((option): option is SelectOption => Boolean(option));

        setParentTaskOptions(taskList);

        if (!shouldSearch && !projectId) {
          setDefaultParentTaskOptions(prev =>
            mergeOptions(prev, taskList)
          );
        }
      } catch (error) {
        console.error("Üst görev seçenekleri alınırken hata:", error);
      } finally {
        setParentTaskLoading(false);
      }
    },
    [defaultParentTaskOptions]
  );

  const handleParentTaskSearch = useCallback(
    (searchText: string) => {
      const projectId = form.getFieldValue("projectId") as number | undefined;
      fetchParentTasks(searchText, projectId);
    },
    [fetchParentTasks, form]
  );

  const handleProjectChange = useCallback(
    (value: number | undefined) => {
      form.setFieldValue("parentTaskId", undefined);

      if (value === undefined || value === null) {
        setParentTaskOptions(defaultParentTaskOptions);
        return;
      }

      fetchParentTasks("", value);
    },
    [defaultParentTaskOptions, fetchParentTasks, form]
  );

  const ensureProjectOptions = useCallback(
    (open: boolean) => {
      if (open && projectOptions.length === 0 && defaultProjectOptions.length > 0) {
        setProjectOptions(defaultProjectOptions);
      }
    },
    [defaultProjectOptions, projectOptions.length]
  );

  const ensureParentTaskOptions = useCallback(
    (open: boolean) => {
      if (open) {
        const projectId = form.getFieldValue("projectId") as number | undefined;
        if (projectId) {
          fetchParentTasks("", projectId);
          return;
        }

        if (parentTaskOptions.length === 0 && defaultParentTaskOptions.length > 0) {
          setParentTaskOptions(defaultParentTaskOptions);
        }
      }
    },
    [
      defaultParentTaskOptions,
      fetchParentTasks,
      form,
      parentTaskOptions.length,
    ]
  );

  return (
    <Modal
      title="Yeni Görev Oluştur"
      open={visible}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Oluştur"
      cancelText="İptal"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreate}
        initialValues={{
          status: TaskStatus.TODO,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Proje"
              name="projectId"
              rules={[{ required: true, message: "Proje seçimi gereklidir" }]}
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
          </Col>
          <Col span={12}>
            <Form.Item label="Üst Görev" name="parentTaskId">
              <Select
                showSearch
                placeholder="Üst görev seçin..."
                options={parentTaskOptions}
                onSearch={handleParentTaskSearch}
                onDropdownVisibleChange={ensureParentTaskOptions}
                filterOption={false}
                allowClear
                loading={parentTaskLoading}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Başlık"
          name="title"
          rules={[{ required: true, message: "Başlık gereklidir" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Açıklama" name="description">
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item label="Durum" name="status">
          <Select>
            <Select.Option value={TaskStatus.TODO}>Yapılacak</Select.Option>
            <Select.Option value={TaskStatus.IN_PROGRESS}>
              Devam Ediyor
            </Select.Option>
            <Select.Option value={TaskStatus.DONE}>Tamamlandı</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Planlanan Saat" name="plannedHours">
          <InputNumber style={{ width: "100%" }} min={0} step={0.5} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
