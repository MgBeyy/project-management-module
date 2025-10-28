import { useState, useEffect, useCallback } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { Modal, Form, Input, InputNumber, Select, AutoComplete, Button, Spin, Tag } from "antd";
import type { SelectProps } from "antd";
import { useNotification } from "@/hooks/useNotification";
import { useTasksStore } from "@/store/zustand/tasks-store";
import getMultiSelectSearch from "@/services/projects/get-multi-select-search";
import { getTasksForSelect } from "@/services/tasks/get-tasks-for-select";
import { createTask } from "@/services/tasks/create-task";
import { TaskStatus } from "@/services/tasks/get-tasks";
import { updateTask } from "@/services/tasks/update-task";
import type { TaskModalProps } from "@/types/tasks";
import { AiOutlinePlus, AiOutlineEdit } from "react-icons/ai";
import { MultiSelectOption } from "@/types";
import MultiSelectSearch, { MultiSelectOption as MultiSelectSearchOption } from "../../projects/multi-select-search";
import CreateLabelModal from "../../projects/modals/create-label-modal";


const { TextArea } = Input;
const MIN_SEARCH_LENGTH = 2;

const formItemNoMarginStyle: CSSProperties = { marginBottom: 0 };

type BaseSelectOption = NonNullable<SelectProps["options"]>[number];

interface SelectOption extends BaseSelectOption {
  value: number;
  label: string;
  key: string;
  raw?: any;
}

const mergeOptions = <T extends { value: string | number }>(existing: T[], incoming: T[]) => {
  const map = new Map<string, T>();
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
  const taskTitle = task?.title;
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

const resolveLabelColor = (label: any): string | undefined => {
  return (
    label?.color ??
    label?.Color ??
    label?.hexColor ??
    label?.HexColor ??
    label?.hex ??
    label?.Hex ??
    label?.colour ??
    label?.Colour
  );
};

const resolveLabelDescription = (label: any): string | undefined => {
  return label?.description ?? label?.Description ?? label?.desc ?? label?.Desc;
};

const extractLabelIdentifier = (candidate: any): string | null => {
  if (candidate === null || candidate === undefined) {
    return null;
  }

  if (typeof candidate === "object" && !Array.isArray(candidate)) {
    const value =
      candidate?.id ??
      candidate?.Id ??
      candidate?.labelId ??
      candidate?.LabelId ??
      candidate?.value ??
      candidate?.key;

    if (value === null || value === undefined) {
      return null;
    }

    return String(value);
  }

  const stringified = String(candidate);
  if (!stringified || stringified === "null" || stringified === "undefined") {
    return null;
  }

  return stringified;
};

const normalizeLabelOption = (label: any): MultiSelectSearchOption | null => {
  if (!label) {
    return null;
  }

  const identifier = extractLabelIdentifier(label);

  if (!identifier) {
    return null;
  }

  const resolvedName =
    label?.name ??
    label?.Name ??
    label?.title ??
    label?.Title ??
    label?.label ??
    label?.Label ??
    `Label ${identifier}`;

  return {
    value: identifier,
    label: resolvedName,
    key: identifier,
    color: resolveLabelColor(label),
    description: resolveLabelDescription(label),
    name: resolvedName,
    ...label,
  };
};

const resolveTaskLabelData = (task: any): {
  ids: string[];
  options: MultiSelectSearchOption[];
} => {
  const derivedIds: string[] = [];
  const normalizedOptions: MultiSelectSearchOption[] = [];

  const pushId = (value: any) => {
    const identifier = extractLabelIdentifier(value);
    if (!identifier) {
      return;
    }

    if (!derivedIds.includes(identifier)) {
      derivedIds.push(identifier);
    }
  };

  const processSource = (source: any) => {
    if (!source) {
      return;
    }

    const evaluate = (item: any) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const normalized = normalizeLabelOption(item);
        if (normalized) {
          normalizedOptions.push(normalized);
          pushId(normalized.value);
          return;
        }
      }

      pushId(item);
    };

    if (Array.isArray(source)) {
      source.forEach(evaluate);
      return;
    }

    evaluate(source);
  };

  processSource(task?.LabelIds);
  processSource((task as any)?.labelIds);
  processSource((task as any)?.Labels);
  processSource((task as any)?.labels);

  return {
    ids: derivedIds,
    options: mergeOptions([], normalizedOptions),
  };
};

export default function CreateTaskModal({
  visible,
  onClose,
  onSuccess,
  mode = "create",
}: TaskModalProps) {
  const notification = useNotification();
  const [form] = Form.useForm();
  const { triggerRefresh, selectedTask } = useTasksStore();

  // Use selectedTask from zustand if available, otherwise use prop
  const currentTaskData = selectedTask;

  const [projectOptions, setProjectOptions] = useState<SelectOption[]>([]);
  const [defaultProjectOptions, setDefaultProjectOptions] = useState<SelectOption[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);

  const [parentTaskOptions, setParentTaskOptions] = useState<SelectOption[]>([]);
  const [defaultParentTaskOptions, setDefaultParentTaskOptions] = useState<SelectOption[]>([]);
  const [parentTaskLoading, setParentTaskLoading] = useState(false);


  // User assignment state
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; name: string }[]>([]);
  const [userOptions, setUserOptions] = useState<MultiSelectOption[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearchValue, setUserSearchValue] = useState("");

  // Label state
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelSelectOptions, setLabelSelectOptions] = useState<MultiSelectSearchOption[]>([]);
  const [isLabelModalVisible, setIsLabelModalVisible] = useState(false);
  const [labelModalMode, setLabelModalMode] = useState<'create' | 'edit'>('create');
  const [editingLabelData, setEditingLabelData] = useState<MultiSelectSearchOption | null>(null);

  console.log(currentTaskData);
  
  const handleRemoveUser = (userId: string) => {
    if (isViewMode) return;
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleAddUser = (userId: string) => {
    if (isViewMode) return;

    const userOption = userOptions.find(option => option.value === userId);
    if (!userOption) return;

    // Kullanıcı zaten ekli mi kontrol et
    if (selectedUsers.some(user => user.id === userId)) {
      return;
    }

    const newUser = {
      id: userId,
      name: typeof userOption.label === 'string' ? userOption.label : String(userOption.label),
    };

    setSelectedUsers(prev => [...prev, newUser]);
  };

  const handleUserSearch = async (searchText: string) => {
    if (!searchText || searchText.trim().length === 0) {
      // Boş arama için tüm listeyi yükle
      setUserLoading(true);
      try {
        const response = await getMultiSelectSearch("", "/User");
        const apiResult = extractArrayFromResponse(response.data);

        const formattedOptions: MultiSelectOption[] = apiResult.map((item: any) => {
          const id = item.id?.toString() || Math.random().toString();
          const name = item.name || item.title || `${item.firstName || ""} ${item.lastName || ""}`.trim() || `User ${id}`;

          return {
            value: id,
            label: name,
            key: id,
            ...item,
          };
        });

        setUserOptions(formattedOptions);
      } catch (error) {
        console.error("Kullanıcı listesi yükleme hatası:", error);
        setUserOptions([]);
      } finally {
        setUserLoading(false);
      }
      return;
    }

    setUserLoading(true);

    try {
      const response = await getMultiSelectSearch(searchText, "/User");
      const apiResult = extractArrayFromResponse(response.data);

      const formattedOptions: MultiSelectOption[] = apiResult.map((item: any) => {
        const id = item.id?.toString() || Math.random().toString();
        const name = item.name || item.title || `${item.firstName || ""} ${item.lastName || ""}`.trim() || `User ${id}`;

        return {
          value: id,
          label: name,
          key: id,
          ...item,
        };
      });

      setUserOptions(formattedOptions);
    } catch (error) {
      console.error("Kullanıcı arama hatası:", error);
      setUserOptions([]);
    } finally {
      setUserLoading(false);
    }
  };

  const handleLabelsChange = (values: string[]) => {
    if (isViewMode) {
      return;
    }

    setSelectedLabels(values);
    form.setFieldValue("labels", values);
  };

  const handleLabelCreateButtonClick = () => {
    setLabelModalMode('create');
    setEditingLabelData(null);
    setIsLabelModalVisible(true);
  };

  const handleLabelModalSuccess = (labelOption: MultiSelectSearchOption) => {
    // Update label options
    setLabelSelectOptions(prev => mergeOptions(prev, [labelOption]));

    // Add to selected labels if it's a new label
    if (labelModalMode === 'create') {
      const newId = String(labelOption.value);
      const updatedLabels = Array.from(new Set([...selectedLabels, newId]));
      setSelectedLabels(updatedLabels);
      form.setFieldValue("labels", updatedLabels);
    }

    setIsLabelModalVisible(false);
    setEditingLabelData(null);
  };

  const handleLabelModalCancel = () => {
    setIsLabelModalVisible(false);
    setEditingLabelData(null);
  };

  const handleLabelOptionsSync = (options: MultiSelectSearchOption[]) => {
    setLabelSelectOptions(options);
  };

  const labelTagRender: SelectProps["tagRender"] = tagProps => {
    const { label, value, closable, onClose } = tagProps;

    const option = (tagProps as any)?.option;

    const handleMouseDown = (event: MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      // Find the label data from labelSelectOptions
      const labelOption = labelSelectOptions.find(opt => opt.value === String(value));

      const labelData: MultiSelectSearchOption = {
        value: String(value),
        label: labelOption?.name || labelOption?.label || '',
        key: String(value),
        name: labelOption?.name || labelOption?.label || '',
        description: (labelOption as any)?.description || '',
        color: (labelOption as any)?.color || '#1890ff',
      };

      setLabelModalMode('edit');
      setEditingLabelData(labelData);
      setIsLabelModalVisible(true);
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

  const isEditMode = mode === "edit" && !!currentTaskData;
  const isViewMode = mode === "view" && !!currentTaskData;
  const resolvedTaskId = currentTaskData?.Id;

  const closeModal = useCallback(() => {
    form.resetFields();
    setSelectedUsers([]);
    setSelectedLabels([]);
    setProjectOptions(defaultProjectOptions);
    setParentTaskOptions(defaultParentTaskOptions);
    onClose();
  }, [defaultParentTaskOptions, defaultProjectOptions, form, onClose]);

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

  const handleSubmit = async (values: any) => {
    if (isViewMode) {
      closeModal();
      return;
    }

    const normalizedValues = {
      ...values,
      assignedUserIds: selectedUsers.map(user => user.id),
      labelIds: selectedLabels,
      parentTaskId: values.parentTaskId ?? null,
      plannedHours: values.plannedHours ?? null,
      actualHours: values.actualHours ?? null,
    };

    try {
      if (isEditMode && resolvedTaskId) {
        const { code: _omit, ...updatePayload } = normalizedValues;
        await updateTask(Number(resolvedTaskId), updatePayload);
        notification.success("Görev Güncellendi", "Görev başarıyla güncellendi!");
      } else {
        await createTask(normalizedValues);
        notification.success("Görev Oluşturuldu", "Görev başarıyla oluşturuldu!");
      }

      triggerRefresh();
      onSuccess?.();
      closeModal();
    } catch (error: any) {
      console.error(
        `Görev ${isEditMode ? "güncelleme" : "oluşturma"} hatası:`,
        error
      );

      if (error.response?.data) {
        console.error("Backend hata detayı:", error.response.data);
      }
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  const handleProjectSearch = useCallback(
    async (searchText: string) => {
      if (isViewMode) {
        return;
      }

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
    [defaultProjectOptions, isViewMode]
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
      if (isViewMode) {
        return;
      }

      const projectId = form.getFieldValue("projectId") as number | undefined;
      fetchParentTasks(searchText, projectId);
    },
    [fetchParentTasks, form, isViewMode]
  );

  const handleProjectChange = useCallback(
    (value: number | undefined) => {
      if (isViewMode) {
        return;
      }

      form.setFieldValue("parentTaskId", undefined);

      if (value === undefined || value === null) {
        setParentTaskOptions(defaultParentTaskOptions);
        return;
      }

      fetchParentTasks("", value);
    },
    [defaultParentTaskOptions, fetchParentTasks, form, isViewMode]
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

  useEffect(() => {
    if (!visible) {
      return;
    }

    if ((isEditMode || isViewMode) && currentTaskData) {
      const { ids: resolvedLabelIds, options: resolvedLabelOptions } = resolveTaskLabelData(currentTaskData);
      const currentStatus = (currentTaskData as any)?.Status;
      let statusValue = TaskStatus.TODO;
      if (currentStatus === "InProgress") {
        statusValue = TaskStatus.IN_PROGRESS;
      } else if (currentStatus === "Done") {
        statusValue = TaskStatus.DONE;
      }

      form.setFieldsValue({
        code: currentTaskData?.Code ?? "",
        projectId: currentTaskData?.ProjectId ?? undefined,
        parentTaskId: currentTaskData?.ParentTaskId ?? undefined,
        title: currentTaskData?.Title ?? "",
        description: currentTaskData?.Description ?? "",
        status: statusValue,
        plannedHours: currentTaskData?.PlannedHours ?? undefined,
        actualHours: currentTaskData?.ActualHours ?? undefined,
      });

      setSelectedLabels(resolvedLabelIds);

      if (resolvedLabelOptions.length > 0 || resolvedLabelIds.length > 0) {
        setLabelSelectOptions(prev => {
          const fallbackOptions = resolvedLabelIds
            .filter(id => !resolvedLabelOptions.some(option => String(option.value) === id))
            .map(id => {
              const existing = prev.find(option => String(option.value) === id);
              if (existing) {
                return existing;
              }

              return {
                value: id,
                label: id,
                key: id,
                name: id,
              } as MultiSelectSearchOption;
            });

          const next = mergeOptions(
            prev,
            mergeOptions(resolvedLabelOptions, fallbackOptions)
          );

          if (next.length === prev.length) {
            const prevMap = new Map(
              prev.map(option => [String(option.value), option])
            );

            let hasDifference = false;

            for (const option of next) {
              const key = String(option.value);
              const existing = prevMap.get(key);
              if (!existing) {
                hasDifference = true;
                break;
              }

              if (
                existing.label !== option.label ||
                (existing as any).color !== (option as any).color ||
                (existing as any).description !== (option as any).description
              ) {
                hasDifference = true;
                break;
              }
            }

            if (!hasDifference) {
              return prev;
            }
          }

          return next;
        });
      }

      if (currentTaskData?.ProjectId) {
        const option: SelectOption = {
          value: Number(currentTaskData?.ProjectId),
          label: String(
            projectOptions.find(opt => opt.value === currentTaskData?.ProjectId)?.label ??
            currentTaskData?.ProjectCode ??
            ""
          ),
          key: String(currentTaskData?.ProjectId),
          raw: {
            Id: currentTaskData?.ProjectId,
            Code: currentTaskData?.ProjectCode,
          },
        };

        setProjectOptions(prev => mergeOptions(prev, [option]));
        setDefaultProjectOptions(prev => {
          const exists = prev.some(existing => existing.value === option.value);
          return exists ? prev : [...prev, option];
        });
        setSelectedUsers(
          Array.isArray(currentTaskData?.AssignedUsers)
            ? currentTaskData.AssignedUsers
            : []
        );

        // fetchParentTasks("", Number((currentTaskData as any).ProjectId)); // Removed to avoid API call in modal
      }

      if (currentTaskData?.ParentTaskId) {
        const parentOption: SelectOption = {
          value: Number(currentTaskData?.ParentTaskId),
          label: String(currentTaskData?.ParentTaskCode ?? currentTaskData?.ParentTaskTitle ?? ""),
          key: String(currentTaskData?.ParentTaskId),
          raw: {
            Id: currentTaskData?.ParentTaskId,
            Code: currentTaskData?.ParentTaskCode,
            Title: currentTaskData?.ParentTaskTitle,
          },
        };

        setParentTaskOptions(prev => mergeOptions(prev, [parentOption]));
        setDefaultParentTaskOptions(prev => {
          const exists = prev.some(existing => existing.value === parentOption.value);
          return exists ? prev : [...prev, parentOption];
        });
      }
    } else if (visible) {
      form.resetFields();
      setSelectedUsers([]);
      setSelectedLabels([]);
      setLabelSelectOptions([]);
    }
  }, [
    visible,
    isEditMode,
    isViewMode,
    currentTaskData,
    form,
    fetchParentTasks,
  ]);

  const modalTitle = isViewMode
    ? `Görev Detayları${currentTaskData?.Code ? ` (${currentTaskData?.Code})` : ""}`
    : isEditMode
      ? `Görev Güncelle${currentTaskData?.Code ? ` (${currentTaskData?.Code})` : ""}`
      : "Yeni Görev Oluştur";

  return (
    <>
      <Modal
      title={modalTitle}
      open={visible}
      onCancel={handleCancel}
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
        onFinish={handleSubmit}
        initialValues={{
          status: TaskStatus.TODO,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-1">
          <Form.Item
            label="Görev Kodu"
            name="code"
            rules={[{ required: true, message: "Görev kodu gereklidir" }]}
            style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? 'none' : 'auto' }}
          >
            <Input placeholder="Görev kodu girin..." disabled={isEditMode} />
          </Form.Item>

          <Form.Item
            label="Proje"
            name="projectId"
            rules={[{ required: true, message: "Proje seçimi gereklidir" }]}
            style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? 'none' : 'auto' }}
          >
            <Select
              showSearch
              placeholder="Proje seçin..."
              options={projectOptions}
              onSearch={handleProjectSearch}
              onChange={handleProjectChange}
              onDropdownVisibleChange={ensureProjectOptions}
              filterOption={false}
              allowClear={!isViewMode}
              loading={projectLoading}
              disabled={isEditMode}
            />
          </Form.Item>

          <Form.Item label="Üst Görev" name="parentTaskId" style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? 'none' : 'auto' }}>
            <Select
              showSearch
              placeholder="Üst görev seçin..."
              options={parentTaskOptions}
              onSearch={handleParentTaskSearch}
              onDropdownVisibleChange={ensureParentTaskOptions}
              filterOption={false}
              allowClear={!isViewMode}
              loading={parentTaskLoading}
            />
          </Form.Item>

          <Form.Item
            label="Başlık"
            name="title"
            rules={[{ required: true, message: "Başlık gereklidir" }]}
            style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? 'none' : 'auto' }}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Durum" name="status" style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? 'none' : 'auto' }}>
            <Select>
              <Select.Option value={TaskStatus.TODO}>Yapılacak</Select.Option>
              <Select.Option value={TaskStatus.IN_PROGRESS}>
                Devam Ediyor
              </Select.Option>
              <Select.Option value={TaskStatus.INACTIVE}>Pasif</Select.Option>
              <Select.Option value={TaskStatus.DONE}>Tamamlandı</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Planlanan Çalışma Saati" name="plannedHours" style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? 'none' : 'auto' }}>
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={0.5}
            />
          </Form.Item>

          <Form.Item label="Gerçekleşen Çalışma Saati" name="actualHours" style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? 'none' : 'auto' }}>
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={0.5}
            />
          </Form.Item>
           <Form.Item label="Etiketler" name="labels" style={formItemNoMarginStyle}>
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

        <Form.Item label="Açıklama" required name="description" style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? 'none' : 'auto' }}>
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item label="Görev Ekibi" style={formItemNoMarginStyle}>
          <div className="space-y-3">
            {!isViewMode && (
              <AutoComplete
                value={userSearchValue}
                options={userOptions}
                onSearch={handleUserSearch}
                onSelect={(value) => {
                  handleAddUser(value);
                  setUserSearchValue("");
                }}
                onChange={setUserSearchValue}
                onFocus={() => handleUserSearch("")}
                placeholder="Kullanıcı ara ve ekle..."
                notFoundContent={
                  userLoading ? (
                    <div className="flex justify-center items-center py-2">
                      <Spin size="small" />
                      <span className="ml-2">Kullanıcılar aranıyor...</span>
                    </div>
                  ) : (
                    "Kullanıcı bulunamadı"
                  )
                }
                allowClear
                size="middle"
                style={{
                  width: "100%",
                }}
                filterOption={false}
                showSearch={true}
              />
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedUsers.map((user) => {
                const userOption = userOptions.find(option => option.value === user.id);
                const userName = userOption?.label || user.name || `User ${user.id}`;

                return (
                  <div
                    key={user.id}
                    className="flex items-center mt-1 p-1 pl-3 rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="flex-1">
                      <span className="font-sm text-gray-900">{userName}</span>
                    </div>
                    {!isViewMode && (
                      <Button
                        type="text"
                        danger
                        icon={<AiOutlinePlus style={{ transform: 'rotate(45deg)' }} />}
                        onClick={() => handleRemoveUser(user.id)}
                        size="small"
                      />
                    )}
                  </div>
                );
              })}

              {selectedUsers.length === 0 && (
                <div className="text-center py-2 text-gray-500">
                  Henüz ekip üyesi eklenmemiş
                </div>
              )}
            </div>
          </div>
        </Form.Item>

        <Form.Item style={formItemNoMarginStyle}>
          <div className="flex justify-end w-full gap-3 pt-3">
            <Button
              onClick={handleCancel}
              size="middle"
              className="min-w-[100px]"
            >
              {isViewMode ? "Kapat" : "İptal"}
            </Button>
            {!isViewMode && (
              <Button
                type="primary"
                htmlType="submit"
                size="middle"
                className="min-w-[100px]"
              >
                {isEditMode ? "Güncelle" : "Oluştur"}
              </Button>
            )}
          </div>
        </Form.Item>
      </Form>
    </Modal>
    <CreateLabelModal
      visible={isLabelModalVisible}
      mode={labelModalMode}
      initialData={editingLabelData ? {
        id: editingLabelData.value.toString(),
        name: editingLabelData.label,
        description: (editingLabelData as any).description || '',
        color: (editingLabelData as any).color || ''
      } : undefined}
      onSuccess={handleLabelModalSuccess}
      onCancel={handleLabelModalCancel}
    />
    </>
  );
}
