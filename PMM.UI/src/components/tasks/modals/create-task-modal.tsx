import { useState, useEffect, useCallback } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { Modal, Form, Input, InputNumber, Select, AutoComplete, Button, Spin, Tag, DatePicker } from "antd";
import type { SelectProps } from "antd";
import { AiOutlinePlus, AiOutlineEdit } from "react-icons/ai";

import { useNotification } from "@/hooks/useNotification";
import { useTasksStore } from "@/store/zustand/tasks-store";
import getMultiSelectSearch from "@/services/projects/get-multi-select-search";
import { createTask } from "@/services/tasks/create-task";
import { GetTasks } from "@/services/tasks/get-tasks";
import { updateTask } from "@/services/tasks/update-task";
import type { TaskDto, TaskModalProps } from "@/types/tasks";
import type { IdNameDto, MultiSelectOption, ProjectListDto } from "@/types";

import MultiSelectSearch, {
  MultiSelectOption as MultiSelectSearchOption,
} from "../../common/multi-select-search";
import CreateLabelModal from "@/components/label/create-label-modal";
import { TaskStatus } from "@/types/tasks/ui";
import { normalizeProjectOption } from "../tasks-filter";
import { fromMillis, toMillis } from "@/utils/retype";

const { TextArea } = Input;
const MIN_SEARCH_LENGTH = 2;
const formItemNoMarginStyle: CSSProperties = { marginBottom: 0 };

type BaseSelectOption = NonNullable<SelectProps["options"]>[number];

interface SelectOption extends BaseSelectOption {
  value: number;
  label: string;
  key: string;
}

const mergeOptions = <T extends { value: string | number }>(existing: T[], incoming: T[]) => {
  const map = new Map<string, T>();
  existing.forEach(o => map.set(String(o.value), o));
  incoming.forEach(o => map.set(String(o.value), o));
  return Array.from(map.values());
};

const areSelectOptionArraysEqual = (a: SelectOption[], b: SelectOption[]) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const A = a[i];
    const B = b[i];
    if (!B || A.value !== B.value || A.label !== B.label || A.key !== B.key) return false;
  }
  return true;
};

const normalizeTaskOption = (task: TaskDto): SelectOption | null => {
  if (!task) return null;
  return {
    value: task.id,
    label: [task.code, task.title].filter(Boolean).join(" - ").trim(),
    key: String(task.id),
    raw: task,
  };
};

const resolveTaskLabelData = (task: TaskDto): { ids: string[]; options: MultiSelectSearchOption[] } => {
  const ids: string[] = [];
  const options: MultiSelectSearchOption[] = [];
  task.labels?.forEach((label: any) => {
    const option = {
      value: label.id.toString(),
      label: label.name,
      key: label.id.toString(),
      ...label,
    };
    if (option) {
      options.push(option);
      ids.push(String(label.id));
    }
  });
  return { ids, options: mergeOptions([], options) };
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

  const currentTaskData = selectedTask;

  // Project
  const [projectOptions, setProjectOptions] = useState<SelectOption[]>([]);
  const [defaultProjectOptions, setDefaultProjectOptions] = useState<SelectOption[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);

  // Parent Task
  const [parentTaskOptions, setParentTaskOptions] = useState<SelectOption[]>([]);
  const [defaultParentTaskOptions, setDefaultParentTaskOptions] = useState<SelectOption[]>([]);
  const [parentTaskLoading, setParentTaskLoading] = useState(false);
  const [parentTaskCache, setParentTaskCache] = useState<Record<number, SelectOption[]>>({});

  // Users
  const [selectedUsers, setSelectedUsers] = useState<IdNameDto[]>([]);
  const [userOptions, setUserOptions] = useState<MultiSelectOption[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearchValue, setUserSearchValue] = useState("");

  // Labels
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelSelectOptions, setLabelSelectOptions] = useState<MultiSelectSearchOption[]>([]);
  const [isLabelModalVisible, setIsLabelModalVisible] = useState(false);
  const [labelModalMode, setLabelModalMode] = useState<"create" | "edit">("create");
  const [editingLabelData, setEditingLabelData] = useState<MultiSelectSearchOption | null>(null);

  const isEditMode = mode === "edit" && !!currentTaskData;
  const isViewMode = mode === "view" && !!currentTaskData;
  const resolvedTaskId = currentTaskData?.id;

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
        getMultiSelectSearch("", "/Project") as Promise<ProjectListDto>,
        GetTasks({ query: { pageSize: 50 } }),
      ]);

      const projectList: SelectOption[] = (projectsRaw.data || [])
        .map(normalizeProjectOption)
        .filter((o): o is SelectOption => Boolean(o));

      setProjectOptions(projectList);
      setDefaultProjectOptions(projectList);

      const taskList = (tasksRaw.data || [])
        .map(normalizeTaskOption)
        .filter((o): o is SelectOption => Boolean(o));

      setParentTaskOptions(taskList);
      setDefaultParentTaskOptions(taskList);
    } catch (e) {
      console.error("Seçenekler yüklenirken hata:", e);
    } finally {
      setProjectLoading(false);
      setParentTaskLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) loadInitialSelectData();
  }, [visible, loadInitialSelectData]);

  const handleSubmit = async (values: any) => {
    if (isViewMode) {
      closeModal();
      return;
    }

    const normalizedValues = {
      ...values,
      assignedUserIds: selectedUsers.map(u => u.id),
      labelIds: selectedLabels,
      parentTaskId: values.parentTaskId ?? null,
      plannedStartDate: toMillis(values.plannedStartDate) ?? null,
      plannedEndDate: toMillis(values.plannedEndDate) ?? null,
      actualStartDate: toMillis(values.actualStartDate) ?? null,
      actualEndDate: toMillis(values.actualEndDate) ?? null,
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
      console.error(`Görev ${isEditMode ? "güncelleme" : "oluşturma"} hatası:`, error);
      if (error.response?.data) console.error("Backend hata detayı:", error.response.data);
    }
  };

  const handleCancel = () => closeModal();

  const handleProjectSearch = useCallback(
    async (searchText: string) => {
      if (isViewMode) return;
      const trimmed = searchText.trim();
      if (!trimmed || trimmed.length < MIN_SEARCH_LENGTH) {
        setProjectOptions(defaultProjectOptions);
        return;
      }
      setProjectLoading(true);
      try {
        const projectsRaw = await getMultiSelectSearch(trimmed, "/Project") as ProjectListDto;
        const list = (projectsRaw.data || [])
          .map(normalizeProjectOption)
          .filter((o): o is SelectOption => Boolean(o));
        setProjectOptions(list);
      } catch (e) {
        console.error("Proje arama hatası:", e);
      } finally {
        setProjectLoading(false);
      }
    },
    [defaultProjectOptions, isViewMode]
  );

  // --- Parent task search (project-aware) ---
  const fetchParentTasks = useCallback(
    async (searchText: string, projectId?: number) => {
      const trimmed = searchText.trim();
      const shouldSearch = trimmed.length >= MIN_SEARCH_LENGTH;
      const resolvedProjectId = projectId ?? form.getFieldValue("projectId");

      if (!shouldSearch && !resolvedProjectId) {
        setParentTaskOptions([]);
        return;
      }

      setParentTaskLoading(true);
      try {
        const tasksRaw = await GetTasks({
          query: {
            search: shouldSearch ? trimmed : undefined,
            projectId: resolvedProjectId,
            pageSize: 20,
          },
        });

        const taskList = (tasksRaw.data || [])
          .map(normalizeTaskOption)
          .filter((o): o is SelectOption => Boolean(o));

        if (resolvedProjectId) {
          let mergedForProject: SelectOption[] | null = null;

          setParentTaskCache(prev => {
            const prevExisting = prev[resolvedProjectId] ?? [];
            const merged = mergeOptions(prevExisting, taskList);
            mergedForProject = merged;
            if (areSelectOptionArraysEqual(prevExisting, merged)) return prev;
            return { ...prev, [resolvedProjectId]: merged };
          });

          setParentTaskOptions(shouldSearch ? taskList : (mergedForProject ?? taskList));
        } else {
          const mergedDefaults = shouldSearch ? taskList : mergeOptions(defaultParentTaskOptions, taskList);
          setParentTaskOptions(mergedDefaults);
          if (!shouldSearch) {
            setDefaultParentTaskOptions(prev => mergeOptions(prev, taskList));
          }
        }
      } catch (e) {
        console.error("Üst görev seçenekleri alınırken hata:", e);
      } finally {
        setParentTaskLoading(false);
      }
    },
    [defaultParentTaskOptions, form]
  );

  const handleParentTaskSearch = useCallback(
    (searchText: string) => {
      if (isViewMode) return;
      const projectId = form.getFieldValue("projectId");
      fetchParentTasks(searchText, projectId);
    },
    [fetchParentTasks, form, isViewMode]
  );

  const handleProjectChange = useCallback(
    (value: number) => {
      if (isViewMode) return;

      form.setFieldValue("parentTaskId", undefined);

      const numericValue = value;
      if (numericValue === undefined) {
        setParentTaskOptions([]);
        return;
      }

      const cachedOptions = parentTaskCache[numericValue];
      if (cachedOptions && cachedOptions.length > 0) {
        setParentTaskOptions(cachedOptions);
      } else {
        setParentTaskOptions([]);
      }

      fetchParentTasks("", numericValue);
    },
    [fetchParentTasks, form, isViewMode, parentTaskCache]
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
      if (!open) return;

      const projectId = form.getFieldValue("projectId");
      if (projectId) {
        const cached = parentTaskCache[projectId];
        if (cached && cached.length > 0) {
          setParentTaskOptions(cached);
          return;
        }
        fetchParentTasks("", projectId);
        return;
      }

      if (parentTaskOptions.length > 0) setParentTaskOptions([]);
    },
    [fetchParentTasks, form, parentTaskCache, parentTaskOptions.length]
  );

  useEffect(() => {
    if (!visible) return;

    if ((isEditMode || isViewMode) && currentTaskData) {
      const { ids: resolvedLabelIds, options: resolvedLabelOptions } = resolveTaskLabelData(currentTaskData);
      const currentStatus = currentTaskData.status;
      let statusValue = TaskStatus.TODO;
      if (currentStatus === "InProgress") statusValue = TaskStatus.IN_PROGRESS;
      else if (currentStatus === "Done") statusValue = TaskStatus.DONE;
      else if (currentStatus === "Inactive") statusValue = TaskStatus.INACTIVE;
      else if (currentStatus === "WaitingForApproval") statusValue = TaskStatus.WAITING_FOR_APPROVAL;

      const resolvedProjectId = currentTaskData?.projectId;
      const resolvedParentTaskId = currentTaskData?.parentTaskId;

      form.setFieldsValue({
        code: currentTaskData?.code ?? "",
        projectId: resolvedProjectId,
        parentTaskId: resolvedParentTaskId,
        title: currentTaskData?.title ?? "",
        description: currentTaskData?.description ?? "",
        status: statusValue,
        plannedStartDate: fromMillis(currentTaskData?.plannedStartDate) ?? undefined,
        plannedEndDate: fromMillis(currentTaskData?.plannedEndDate) ?? undefined,
        actualStartDate: fromMillis(currentTaskData?.actualStartDate) ?? undefined,
        actualEndDate: fromMillis(currentTaskData?.actualEndDate) ?? undefined,
        plannedHours: currentTaskData?.plannedHours ?? undefined,
        actualHours: currentTaskData?.actualHours ?? undefined,
      });

      setSelectedLabels(resolvedLabelIds);

      if (resolvedLabelOptions.length > 0 || resolvedLabelIds.length > 0) {
        setLabelSelectOptions(prev => {
          const fallbackOptions = resolvedLabelIds
            .filter(id => !resolvedLabelOptions.some(o => String(o.value) === id))
            .map(id => {
              const existing = prev.find(o => String(o.value) === id);
              return (
                existing || ({ value: id, label: id, key: id, name: id } as MultiSelectSearchOption)
              );
            });

          const next = mergeOptions(prev, mergeOptions(resolvedLabelOptions, fallbackOptions));

          if (next.length === prev.length) {
            const prevMap = new Map(prev.map(o => [String(o.value), o]));
            let changed = false;
            for (const o of next) {
              const ex = prevMap.get(String(o.value));
              if (!ex) {
                changed = true;
                break;
              }
              if (
                ex.label !== o.label ||
                (ex as any).color !== (o as any).color ||
                (ex as any).description !== (o as any).description
              ) {
                changed = true;
                break;
              }
            }
            if (!changed) return prev;
          }

          return next;
        });
      }

      // Ensure Project option exists
      if (currentTaskData?.projectId) {
        const option: SelectOption = {
          value: Number(currentTaskData?.projectId),
          label:
            String(
              projectOptions.find(o => o.value === currentTaskData?.projectId)?.label ??
              currentTaskData?.projectCode ??
              ""
            ) || `Proje #${currentTaskData?.projectId}`,
          key: String(currentTaskData?.projectId),
          raw: { Id: currentTaskData?.projectId, Code: currentTaskData?.projectCode },
        };

        setProjectOptions(prev => mergeOptions(prev, [option]));
        setDefaultProjectOptions(prev => (prev.some(e => e.value === option.value) ? prev : [...prev, option]));
        setSelectedUsers(currentTaskData.assignedUsers || []);
      }

      // Ensure Parent Task option exists
      if (currentTaskData?.parentTaskId) {
        const resolvedParentId = Number(currentTaskData?.parentTaskId);
        const found =
          parentTaskOptions.find(o => o.value === resolvedParentId) ??
          defaultParentTaskOptions.find(o => o.value === resolvedParentId);
        const parentLabel = found?.label;

        const parentOption: SelectOption = {
          value: resolvedParentId,
          label: String(parentLabel),
          key: String(resolvedParentId),
          raw:
            found?.raw ?? {
              Id: resolvedParentId,
              Code: found?.parentTaskCode,
              Title: found?.parentTaskTitle,
            },
        };

        setParentTaskOptions(prev => {
          const idx = prev.findIndex(o => o.value === parentOption.value);
          if (idx === -1) return mergeOptions(prev, [parentOption]);
          const ex = prev[idx];
          if (ex.label === parentOption.label && ex.key === parentOption.key) return prev;
          const next = [...prev];
          next[idx] = { ...ex, ...parentOption };
          return next;
        });

        setDefaultParentTaskOptions(prev => {
          const idx = prev.findIndex(o => o.value === parentOption.value);
          if (idx === -1) return [...prev, parentOption];
          const ex = prev[idx];
          if (ex.label === parentOption.label && ex.key === parentOption.key) return prev;
          const next = [...prev];
          next[idx] = { ...ex, ...parentOption };
          return next;
        });

        if (resolvedProjectId !== undefined) {
          setParentTaskCache(prev => {
            const ex = prev[resolvedProjectId] ?? [];
            const merged = mergeOptions(ex, [parentOption]);
            if (areSelectOptionArraysEqual(ex, merged)) return prev;
            return { ...prev, [resolvedProjectId]: merged };
          });
        }
      }
    }
  }, [
    visible,
    isEditMode,
    isViewMode,
    currentTaskData,
    form,
  ]);

  useEffect(() => {
    if (!visible) return;
    if (!isEditMode && !isViewMode) {
      form.resetFields();
      setSelectedUsers([]);
      setSelectedLabels([]);
      setLabelSelectOptions([]);
    }
  }, [visible, isEditMode, isViewMode, form]);

  const handleRemoveUser = (userId: number) => {
    if (isViewMode) return;
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleAddUser = (userId: string) => {
    if (isViewMode) return;
    const userOption = userOptions.find(o => o.value === userId);
    if (!userOption) return;
    if (selectedUsers.some(u => u.id === Number(userId))) return;
    const newUser = {
      id: Number(userId),
      name: typeof userOption.label === "string" ? userOption.label : String(userOption.label),
    };
    setSelectedUsers(prev => [...prev, newUser]);
  };

  const handleUserSearch = async (searchText: string) => {
    if (!searchText || searchText.trim().length === 0) {
      setUserLoading(true);
      try {
        const response = await getMultiSelectSearch("", "/User");
        const apiResult = response.data;
        const opts: MultiSelectOption[] = apiResult.map((item: any) => {
          const id = item.id?.toString() || Math.random().toString();
          const name =
            item.name ||
            item.title ||
            `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
            `User ${id}`;
          `User ${id}`;

          let capacityNode = null;
          if (item.capacityPercent !== undefined) {
            let color = "#ff4d4f";
            if (item.capacityPercent >= 50) color = "#52c41a";
            else if (item.capacityPercent >= 20) color = "#faad14";

            capacityNode = (
              <span style={{
                marginLeft: "8px",
                backgroundColor: color,
                color: "#fff",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "0.75em",
                fontWeight: 500
              }}>
                %{item.capacityPercent}
              </span>
            );
          }

          return {
            value: id,
            label: (
              <span>
                {name}
                {capacityNode}
              </span>
            ),
            key: id,
            ...item
          };
        });
        setUserOptions(opts);
      } catch (e) {
        console.error("Kullanıcı listesi yükleme hatası:", e);
        setUserOptions([]);
      } finally {
        setUserLoading(false);
      }
      return;
    }

    setUserLoading(true);
    try {
      const response = await getMultiSelectSearch(searchText, "/User");
      const apiResult = response.data;
      const opts: MultiSelectOption[] = apiResult.map((item: any) => {
        const id = item.id?.toString() || Math.random().toString();
        const name =
          item.name ||
          item.title ||
          `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
          `User ${id}`;
        `User ${id}`;

        let capacityNode = null;
        if (item.capacityPercent !== undefined) {
          let color = "#ff4d4f";
          if (item.capacityPercent >= 50) color = "#52c41a";
          else if (item.capacityPercent >= 20) color = "#faad14";

          capacityNode = (
            <span style={{
              marginLeft: "8px",
              backgroundColor: color,
              color: "#fff",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.75em",
              fontWeight: 500
            }}>
              %{item.capacityPercent}
            </span>
          );
        }

        return {
          value: id,
          label: (
            <span>
              {name}
              {capacityNode}
            </span>
          ),
          key: id,
          ...item
        };
      });
      setUserOptions(opts);
    } catch (e) {
      console.error("Kullanıcı arama hatası:", e);
      setUserOptions([]);
    } finally {
      setUserLoading(false);
    }
  };

  const handleLabelsChange = (values: string[]) => {
    if (isViewMode) return;
    setSelectedLabels(values);
    form.setFieldValue("labels", values);
  };

  const handleLabelCreateButtonClick = () => {
    setLabelModalMode("create");
    setEditingLabelData(null);
    setIsLabelModalVisible(true);
  };

  const handleLabelModalSuccess = (labelOption: MultiSelectSearchOption) => {
    setLabelSelectOptions(prev => mergeOptions(prev, [labelOption]));
    if (labelModalMode === "create") {
      const newId = String(labelOption.value);
      const updated = Array.from(new Set([...selectedLabels, newId]));
      setSelectedLabels(updated);
      form.setFieldValue("labels", updated);
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

    const handleMouseDown = (e: MouseEvent<HTMLSpanElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const found = labelSelectOptions.find(opt => opt.value === String(value));
      const data: MultiSelectSearchOption = {
        value: String(value),
        label: found?.name || found?.label || "",
        key: String(value),
        name: found?.name || found?.label || "",
        description: (found as any)?.description || "",
        color: (found as any)?.color || "#1890ff",
      };
      setLabelModalMode("edit");
      setEditingLabelData(data);
      setIsLabelModalVisible(true);
    };

    const resolvedColor = (option as any)?.color || "#4a90e2";

    return (
      <Tag
        color={resolvedColor}
        onMouseDown={handleMouseDown}
        closable={!isViewMode && closable}
        onClose={onClose}
        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginInlineEnd: 4, paddingInlineEnd: isViewMode ? 8 : 4 }}
      >
        <span>{label}</span>
        {!isViewMode && <Button type="text" size="small" icon={<AiOutlineEdit />} onClick={handleEditClick} />}
      </Tag>
    );
  };

  const modalTitle = isViewMode
    ? `Görev Detayları${currentTaskData?.code ? ` (${currentTaskData?.code})` : ""}`
    : isEditMode
      ? `Görev Güncelle${currentTaskData?.code ? ` (${currentTaskData?.code})` : ""}`
      : "Yeni Görev Oluştur";

  return (
    <>
      <Modal
        title={modalTitle}
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={1200}
        destroyOnHidden
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: TaskStatus.TODO }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-1">
            <Form.Item
              label="Görev Kodu"
              name="code"
              rules={[{ required: true, message: "Görev kodu gereklidir" }]}
              style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? "none" : "auto" }}
            >
              <Input placeholder="Görev kodu girin..." disabled={isEditMode} />
            </Form.Item>

            <Form.Item
              label="Proje"
              name="projectId"
              rules={[{ required: true, message: "Proje seçimi gereklidir" }]}
              style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? "none" : "auto" }}
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

            <Form.Item
              label="Üst Görev"
              name="parentTaskId"
              style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? "none" : "auto" }}
            >
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
              style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? "none" : "auto" }}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Durum"
              name="status"
              style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? "none" : "auto" }}
            >
              <Select
                options={[
                  { value: TaskStatus.TODO, label: "Yapılacak" },
                  { value: TaskStatus.IN_PROGRESS, label: "Devam Ediyor" },
                  { value: TaskStatus.WAITING_FOR_APPROVAL, label: "Onay Bekliyor" },
                  { value: TaskStatus.DONE, label: "Tamamlandı" },
                  { value: TaskStatus.INACTIVE, label: "Pasif" },
                ]}
              />
            </Form.Item>

            {/* Planlanan Başlangıç ve Bitiş Tarihleri */}
            <Form.Item
              label="Planlanan Başlangıç"
              name="plannedStartDate"
              style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? "none" : "auto" }}
              rules={[
                { required: false },
              ]}
            >
              <DatePicker
                format="DD-MM-YYYY"
                style={{ width: "100%" }}
                disabled={isViewMode}
              />
            </Form.Item>

            <Form.Item
              label="Planlanan Bitiş"
              name="plannedEndDate"
              dependencies={["plannedStartDate"]}
              style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? "none" : "auto" }}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue("plannedStartDate");
                    if (!value || !start || value.isSame(start, "day") || value.isAfter(start, "day")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Bitiş tarihi başlangıç tarihinden önce olamaz"));
                  },
                }),
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD-MM-YYYY"
                disabled={isViewMode}
                disabledDate={(current) => {
                  const start = form.getFieldValue("plannedStartDate");
                  return !!start && current && current.isBefore(start, "day");
                }}
              />
            </Form.Item>

            <Form.Item noStyle dependencies={["status"]}>
              {({ getFieldValue }) => {
                const status = getFieldValue("status");
                const isTodo = status === TaskStatus.TODO;

                return (
                  <>
                    <Form.Item
                      label="Gerçekleşen Başlangıç"
                      name="actualStartDate"
                      style={{
                        ...formItemNoMarginStyle,
                        pointerEvents: isViewMode ? "none" : "auto",
                      }}
                      rules={[{ required: false }]}
                    >
                      <DatePicker
                        format="DD-MM-YYYY"
                        style={{ width: "100%" }}
                        disabled={isViewMode || isTodo}
                        placeholder="Gerçekleşen başlangıç..."
                      />
                    </Form.Item>

                    <Form.Item
                      label="Gerçekleşen Bitiş"
                      name="actualEndDate"
                      dependencies={["actualStartDate"]}
                      style={{
                        ...formItemNoMarginStyle,
                        pointerEvents: isViewMode ? "none" : "auto",
                      }}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const start = getFieldValue("actualStartDate");
                            if (
                              !value ||
                              !start ||
                              value.isSame(start, "day") ||
                              value.isAfter(start, "day")
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("Bitiş tarihi başlangıç tarihinden önce olamaz")
                            );
                          },
                        }),
                      ]}
                    >
                      <DatePicker
                        format="DD-MM-YYYY"
                        style={{ width: "100%" }}
                        disabled={isViewMode || isTodo}
                        disabledDate={(current) => {
                          const start = form.getFieldValue("actualStartDate");
                          return !!start && current && current.isBefore(start, "day");
                        }}
                        placeholder="Gerçekleşen bitiş..."
                      />
                    </Form.Item>
                  </>
                );
              }}
            </Form.Item>

            <Form.Item
              label="Planlanan Çalışma Saati"
              name="plannedHours"
              style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? "none" : "auto" }}
            >
              <InputNumber style={{ width: "100%" }} min={0} step={0.5} />
            </Form.Item>

            <Form.Item
              label="Gerçekleşen Çalışma Saati"
              name="actualHours"
              style={{ ...formItemNoMarginStyle, pointerEvents: isViewMode ? "none" : "auto" }}
            >
              <InputNumber style={{ width: "100%" }} min={0} step={0.5} />
            </Form.Item>

            <Form.Item label="Etiketler" style={formItemNoMarginStyle}>
              <div className="space-y-2 flex flex-row gap-2">
                <MultiSelectSearch
                  placeholder="Etiket ara ve seç..."
                  onChange={handleLabelsChange}
                  value={selectedLabels}
                  apiUrl="/Label"
                  size="middle"
                  className="w-full flex-1"
                  disabled={isViewMode}
                  style={{ width: "100%" }}
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
                    style={{ borderStyle: "dashed", color: "#52c41a", borderColor: "#52c41a" }}
                  />
                )}
              </div>
            </Form.Item>
          </div>

          <Form.Item
            label="Açıklama"
            required
            name="description"
            style={formItemNoMarginStyle}
            className="col-span-full"
          >
            <TextArea
              rows={isViewMode ? 8 : 4}
              readOnly={isViewMode}
              style={{ resize: "vertical" }}
            />
          </Form.Item>

          <Form.Item label="Görev Ekibi" style={formItemNoMarginStyle}>
            <div className="space-y-3">
              {!isViewMode && (
                <AutoComplete
                  value={userSearchValue}
                  options={userOptions}
                  onSearch={handleUserSearch}
                  onSelect={value => {
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
                  style={{ width: "100%" }}
                  filterOption={false}
                  showSearch
                />
              )}

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedUsers.map(user => {
                  const userOption = userOptions.find(o => o.value === user.id);
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
                          icon={<AiOutlinePlus style={{ transform: "rotate(45deg)" }} />}
                          onClick={() => handleRemoveUser(user.id)}
                          size="small"
                        />
                      )}
                    </div>
                  );
                })}
                {selectedUsers.length === 0 && (
                  <div className="text-center py-2 text-gray-500">Henüz ekip üyesi eklenmemiş</div>
                )}
              </div>
            </div>
          </Form.Item>

          <Form.Item style={formItemNoMarginStyle}>
            <div className="flex justify-end w-full gap-3 pt-3">
              <Button onClick={handleCancel} size="middle" className="min-w-[100px]">
                {isViewMode ? "Kapat" : "İptal"}
              </Button>
              {!isViewMode && (
                <Button type="primary" htmlType="submit" size="middle" className="min-w-[100px]">
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
        initialData={
          editingLabelData
            ? {
              id: editingLabelData.value.toString(),
              name: editingLabelData.label,
              description: (editingLabelData as any).description || "",
              color: (editingLabelData as any).color || "",
            }
            : undefined
        }
        onSuccess={handleLabelModalSuccess}
        onCancel={handleLabelModalCancel}
      />
    </>
  );
}
