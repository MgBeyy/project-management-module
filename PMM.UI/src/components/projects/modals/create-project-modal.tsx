import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  AutoComplete,
  Spin,
  Modal,
  Tag,
} from "antd";
import { useState, useEffect, useCallback } from "react";
import type { CSSProperties, MouseEvent } from "react";
import {
  AiOutlinePlus,
  AiOutlineEdit
} from "react-icons/ai";
import type { InputNumberProps, SelectProps } from "antd";
import MultiSelectSearch, { areOptionsEqual, mergeOptions, MultiSelectOption } from "../../common/multi-select-search";
import { getClientsForSelect } from "@/services/projects/get-clients-for-select";
import { createProject } from "@/services/projects/create-project";
import { showNotification } from "@/utils/notification";
import getMultiSelectSearch from "@/services/projects/get-multi-select-search";
import { updateProject } from "@/services/projects/update-project";
import { getProjectById } from "@/services/projects/get-project-by-code"; // NOTE: service name kept as-is in tree
import type {
  ProjectModalProps,
} from "@/types/projects";
import type {
  DetailedProjectDto,
  ProjectDto,
  ProjectPriority,
  ProjectStatus,
  ProjectAssignmentRole,
} from "@/types/projects";
import ProjectFiles from "../files/ProjectFiles";
import { normalizePriority, normalizeStatus, priorityOptions, statusOptions, userRoleOptions } from "@/types/projects/helpers";
import { toMillis, fromMillis, coerceNumberArray } from "@/utils/retype";
import CreateLabelModal from "@/components/label/create-label-modal";
import { normalizeLabelOption } from "@/types/label/ui";
import { LabelDto } from "@/types";

const normalizeProjectOption = (project: any): MultiSelectOption | null => {
  if (!project) return null;
  const id = project?.id;
  if (id === undefined || id === null) return null;
  const stringId = String(id);
  const resolvedCode = project?.code;
  const resolvedTitle = project?.title;
  const resolvedLabel = resolvedCode && resolvedTitle
    ? `${resolvedCode} - ${resolvedTitle}`
    : resolvedTitle ?? resolvedCode ?? `Project ${stringId}`;
  return {
    value: stringId,
    label: resolvedLabel,
    key: stringId,
    code: resolvedCode,
    title: resolvedTitle,
    ...project,
  };
};


export default function CreateProjectModal({
  visible,
  onClose,
  onSuccess,
  projectData,
  mode = "create",
}: ProjectModalProps) {
  const [form] = Form.useForm();

  // --- STATE ---
  const [customerOptions, setCustomerOptions] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const [defaultCustomerOptions, setDefaultCustomerOptions] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const [customerLoading, setCustomerLoading] = useState(false);

  const [selectedParentProjects, setSelectedParentProjects] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [parentProjectOptions, setParentProjectOptions] = useState<MultiSelectOption[]>([]);
  const [labelSelectOptions, setLabelSelectOptions] = useState<MultiSelectOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Users
  const [selectedUsers, setSelectedUsers] = useState<
    { userId: string; role: ProjectAssignmentRole; name: string }[]
  >([]);
  const [userOptions, setUserOptions] = useState<MultiSelectOption[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearchValue, setUserSearchValue] = useState("");

  // Label modal
  const [isLabelModalVisible, setIsLabelModalVisible] = useState(false);
  const [labelModalMode, setLabelModalMode] = useState<"create" | "edit">("create");
  const [editingLabelData, setEditingLabelData] = useState<any>(null);

  // Project details + files
  const [fullProjectDetails, setFullProjectDetails] = useState<DetailedProjectDto | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const isEditMode = mode === "edit" && !!projectData;
  const isViewMode = mode === "view" && !!projectData;
  const resolvedProjectId = fullProjectDetails?.id;

  const viewModeFieldStyle: CSSProperties | undefined = isViewMode
    ? { backgroundColor: "#f7f9fc", color: "#1f1f1f", borderColor: "#d9d9d9" }
    : undefined;
  const formItemNoMarginStyle: CSSProperties = { marginBottom: 0 };

  const handleLabelOptionsSync = useCallback((options: MultiSelectOption[]) => {
    if (options.length === 0) {
      setLabelSelectOptions((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    setLabelSelectOptions((prev) => {
      const merged = mergeOptions(prev, options);
      return areOptionsEqual(prev, merged) ? prev : merged;
    });
  }, []);

  const handleParentOptionsSync = useCallback((options: MultiSelectOption[]) => {
    if (options.length === 0) return;
    setParentProjectOptions((prev) => {
      const merged = mergeOptions(prev, options);
      return areOptionsEqual(prev, merged) ? prev : merged;
    });
  }, []);

  // Ensure selected customer id is present in options so label is shown
  const ensureCustomerOption = useCallback(
    (id: number | undefined | null, labelHint?: string) => {
      if (id == null) return;
      const exists =
        customerOptions.some((o) => o.value === id) ||
        defaultCustomerOptions.some((o) => o.value === id);
      if (!exists) {
        const item = { value: id, label: labelHint || `Müşteri #${id}` };
        setCustomerOptions((prev) => [item, ...prev]);
        setDefaultCustomerOptions((prev) => [item, ...prev]);
      }
    },
    [customerOptions, defaultCustomerOptions]
  );

  const loadInitialSelectData = useCallback(async () => {
    setCustomerLoading(true);
    try {
      const [clientsRaw, labelsRaw, projectsRaw] = await Promise.all([
        getClientsForSelect("", "/Client"),
        getMultiSelectSearch("", "/Label"),
        getMultiSelectSearch("", "/Project"),
      ]);

      const clientOptions = clientsRaw.data
        .map((item: any) => {
          if (item?.id == null || !item?.name) return null;
          return { value: Number(item.id), label: String(item.name) };
        })
        .filter(Boolean) as Array<{ value: number; label: string }>;

      setCustomerOptions(clientOptions);
      setDefaultCustomerOptions(clientOptions);

      const normalizedLabelOptions = labelsRaw.data
        .map(normalizeLabelOption)
        .filter((o: MultiSelectOption | null): o is MultiSelectOption => Boolean(o));
      if (normalizedLabelOptions.length > 0) handleLabelOptionsSync(normalizedLabelOptions);

      const normalizedProjectOptions = projectsRaw.data
        .map(normalizeProjectOption)
        .filter((o: MultiSelectOption | null): o is MultiSelectOption => Boolean(o));
      if (normalizedProjectOptions.length > 0) {
        setParentProjectOptions((prev) => {
          const merged = mergeOptions(prev, normalizedProjectOptions);
          return areOptionsEqual(prev, merged) ? prev : merged;
        });
      }
    } catch (e) {
      console.error("İlk seçenek verileri yüklenirken hata:", e);
    } finally {
      setCustomerLoading(false);
    }
  }, [handleLabelOptionsSync]);



  const handleReset = useCallback(() => {
    form.resetFields();
    setCustomerOptions([]);
    setDefaultCustomerOptions([]);
    setSelectedParentProjects([]);
    setSelectedLabels([]);
    setParentProjectOptions([]);
    setLabelSelectOptions((prev) => (prev.length === 0 ? prev : []));
    setSelectedUsers([]);
    setUserOptions([]);
    setUserSearchValue("");
    setLabelModalMode("create");
    setEditingLabelData(null);
  }, [form]);

  const labelTagRender: SelectProps["tagRender"] = (tagProps) => {
    const { value, closable, onClose } = tagProps;
    const option = (tagProps as any)?.option;
    
    const handleMouseDown = (event: MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const labelOption = labelSelectOptions.find((opt) => opt.value === String(value));
      const labelData = {
        id: String(value),
        name: labelOption?.name,
        description: (labelOption as any)?.description || "",
        color: (option as any)?.color || (labelOption as any)?.color || "#1890ff",
      };
      setLabelModalMode("edit");
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
        <span>{option?.label}</span>
        {!isViewMode && (
          <Button type="text" size="small" icon={<AiOutlineEdit />} onClick={handleEditClick} />
        )}
      </Tag>
    );
  };

  /** Effects */
  useEffect(() => {
    if (!visible) return;
    loadInitialSelectData();
  }, [visible, loadInitialSelectData]);

  useEffect(() => {
    if (!visible) return;
    if ((isEditMode || isViewMode) && projectData) {
      let derivedLabelIds: string[] = [];
      let derivedParentProjectIds: string[] = [];

      if (fullProjectDetails) {
        derivedLabelIds = (fullProjectDetails.labels || [])
          .map((l: LabelDto) => String(l.id))
          .filter(Boolean);
      } else {
        derivedLabelIds = (projectData.labels?.map((l) => String(l.id)) || [])
          .map((id) => (id !== null && id !== undefined ? String(id) : null))
          .filter((id): id is string => Boolean(id));
      }

      // Parent projects
      const detailParentIds = (fullProjectDetails?.parentProjects || [])
        .map((p: ProjectDto) => String(p.id))
        .filter(Boolean);

      const fallbackParentIds = (fullProjectDetails?.parentProjects || [])
        .map((id) => (id != null ? String(id) : null))
        .filter((id): id is string => Boolean(id));

      derivedParentProjectIds = detailParentIds.length > 0 ? detailParentIds : fallbackParentIds;

      const detailParentOptions = (fullProjectDetails?.parentProjects || [])
        .map(normalizeProjectOption)
        .filter((o: MultiSelectOption | null): o is MultiSelectOption => Boolean(o));

      // Labels -> normalize to options list (to show colored tags)
      const finalLabelOptions = (fullProjectDetails?.labels || [])
        .map(normalizeLabelOption)
        .filter((o): o is MultiSelectOption => Boolean(o));

      // Client
      const initialClientId: number | undefined = fullProjectDetails?.clientId ?? undefined;

      // Set form values

      form.setFieldsValue({
        code: fullProjectDetails?.code,
        title: fullProjectDetails?.title,
        plannedStartDate: fromMillis(fullProjectDetails?.plannedStartDate),
        plannedEndDate: fromMillis(fullProjectDetails?.plannedDeadline),
        plannedHours: fullProjectDetails?.plannedHours,
        startedAt: fromMillis(fullProjectDetails?.startedAt),
        endAt: fromMillis(fullProjectDetails?.endAt),
        status: normalizeStatus(fullProjectDetails?.status),
        priority: normalizePriority(fullProjectDetails?.priority),

        customer: initialClientId,
        parentProjects: derivedParentProjectIds,
        labels: derivedLabelIds,
      });


      // ensure we can display customer label
      ensureCustomerOption(
        initialClientId,
        fullProjectDetails?.client?.name || (projectData as any)?.Client?.Name || (projectData as any)?.ClientName || undefined
      );

      if (fullProjectDetails?.assignedUsers && Array.isArray(fullProjectDetails.assignedUsers)) {
        setSelectedUsers(
          fullProjectDetails.assignedUsers.map((u) => ({
            userId: String(u.userId),
            name: String(u.user?.name || u.userId),
            role: u.role,
          }))
        );
      } else {
        setSelectedUsers([]);
      }

      setSelectedParentProjects(derivedParentProjectIds);
      setSelectedLabels(derivedLabelIds);
      setLabelSelectOptions((prev) => (areOptionsEqual(prev, finalLabelOptions) ? prev : finalLabelOptions));

      const resolvedParentOptions = detailParentOptions.length > 0 ? detailParentOptions : derivedParentProjectIds.map((id) => ({
        value: id,
        label: `Proje ${id}`,
        key: id,
      })) as MultiSelectOption[];

      if (resolvedParentOptions.length > 0) handleParentOptionsSync(resolvedParentOptions);
    }
  }, [
    visible,
    isEditMode,
    isViewMode,
    projectData,
    fullProjectDetails,
    ensureCustomerOption,
    handleParentOptionsSync,
    form,
  ]);

  // reset on create open
  useEffect(() => {
    if (!visible) return;
    if (isEditMode || isViewMode) return;
    handleReset();
  }, [visible, isEditMode, isViewMode, handleReset]);

  // fetch details
  useEffect(() => {
    if (!visible || (!isEditMode && !isViewMode) || !projectData?.id) {
      setFullProjectDetails(null);
      setIsLoadingDetails(false);
      return;
    }
    const fetchProjectDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const details = (await getProjectById(String(projectData.id))) as DetailedProjectDto;
        setFullProjectDetails(details);
      } catch (error) {
        console.error("Proje detayları çekilirken hata:", error);
        showNotification.error("Hata", "Proje detayları yüklenirken bir hata oluştu.");
        setFullProjectDetails(null);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    fetchProjectDetails();
  }, [visible, isEditMode, isViewMode, projectData?.id]);

  /** Remote searches */
  const handleCustomerSearch = async (searchText: string) => {
    if (!searchText || searchText.trim().length < 2) {
      setCustomerOptions(defaultCustomerOptions);
      return;
    }
    setCustomerLoading(true);
    try {
      const res = await getClientsForSelect(searchText, "/Client");
      const apiList = res.data || [];
      const data = apiList
        .map((item: any) => {
          if (item?.id == null || !item?.name) return null;
          return { value: Number(item.id), label: String(item.name) };
        })
        .filter(Boolean) as Array<{ value: number; label: string }>;
      setCustomerOptions(data);
    } catch (err) {
      console.error("Müşteri veri çekme hatası:", err);
      setCustomerOptions([]);
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleUserSearch = async (searchText: string) => {
    if (!searchText || searchText.trim().length === 0) {
      setUserLoading(true);
      try {
        const response = await getMultiSelectSearch("", "/User");
        const apiResult = response.data || [];
        const formattedOptions: MultiSelectOption[] = apiResult.map((item: any) => {
          const id = item.id?.toString() || Math.random().toString();
          const name =
            item.name || item.title || `${item.firstName || ""} ${item.lastName || ""}`.trim() || `User ${id}`;
          return { value: id, label: name, key: id, ...item };
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
      const apiResult = response.data || [];
      const formattedOptions: MultiSelectOption[] = apiResult.map((item: any) => {
        const id = item.id?.toString() || Math.random().toString();
        const name =
          item.name || item.title || `${item.firstName || ""} ${item.lastName || ""}`.trim() || `User ${id}`;
        return { value: id, label: name, key: id, ...item };
      });
      setUserOptions(formattedOptions);
    } catch (error) {
      console.error("Kullanıcı arama hatası:", error);
      setUserOptions([]);
    } finally {
      setUserLoading(false);
    }
  };

  const handleAddUser = (userId: string) => {
    if (isViewMode) return;
    const userOption = userOptions.find((option) => option.value === userId);
    if (!userOption) return;
    if (selectedUsers.some((u) => u.userId === userId)) return;
    const newUser = {
      userId,
      name: typeof userOption.label === "string" ? userOption.label : String(userOption.label),
      role: "Member" as ProjectAssignmentRole,
    };
    setSelectedUsers((prev) => [...prev, newUser]);
  };

  const handleRemoveUser = (userId: string) => {
    if (isViewMode) return;
    setSelectedUsers((prev) => prev.filter((u) => u.userId !== userId));
  };

  const handleUserRoleChange = (userId: string, role: ProjectAssignmentRole) => {
    if (isViewMode) return;
    setSelectedUsers((prev) => prev.map((u) => (u.userId === userId ? { ...u, role } : u)));
  };

  const handleLabelCreateButtonClick = () => {
    setLabelModalMode("create");
    setEditingLabelData(null);
    setIsLabelModalVisible(true);
  };

  const handleLabelModalSuccess = (labelOption: MultiSelectOption) => {
    setLabelSelectOptions((prev) => mergeOptions(prev, [labelOption]));
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

  const handleParentProjectsChange = (values: string[]) => {
    if (isViewMode) return;
    setSelectedParentProjects(values);
    form.setFieldValue("parentProjects", values);
  };

  const handleLabelsChange = (values: string[]) => {
    if (isViewMode) return;
    setSelectedLabels(values);
    form.setFieldValue("labels", values);
  };

  const onChangeNumber: InputNumberProps["onChange"] = (value) => {
    form.setFieldValue("plannedHours", value);
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && projectData?.id) {
        const updateData = {
          title: values.title as string,
          plannedStartDate: toMillis(values.plannedStartDate),
          plannedDeadline: toMillis(values.plannedEndDate),
          plannedHours: values.plannedHours ?? null,
          startedAt: toMillis(values.startedAt),
          endAt: toMillis(values.endAt),
          status: (values.status as ProjectStatus) ?? null,
          priority: (values.priority as ProjectPriority) ?? undefined,
          parentProjectIds: coerceNumberArray(selectedParentProjects),
          labelIds: coerceNumberArray(selectedLabels),
          assignedUsers:
            selectedUsers.length > 0
              ? selectedUsers.map((u) => ({ userId: parseInt(u.userId, 10), role: u.role }))
              : undefined,
          clientId: typeof values.customer === "number" ? values.customer : null,
        } as const;


        await updateProject(projectData.id, updateData);
        showNotification.success("Proje Güncellendi", " Proje başarıyla güncellendi!");
      } else {
        const createData = {
          code: values.code as string,
          title: values.title as string,
          plannedStartDate: toMillis(values.plannedStartDate) ?? undefined,
          plannedDeadline: toMillis(values.plannedEndDate) ?? undefined,
          plannedHours: values.plannedHours ?? undefined,
          startedAt: toMillis(values.startedAt) ?? undefined,
          endAt: toMillis(values.endAt) ?? undefined,
          status: (values.status as ProjectStatus) ?? undefined,
          priority: (values.priority as ProjectPriority) ?? undefined,
          clientId: typeof values.customer === "number" ? values.customer : undefined,
          parentProjectIds: coerceNumberArray(selectedParentProjects) ?? undefined,
          labelIds: coerceNumberArray(selectedLabels) ?? undefined,
          assignedUsers:
            selectedUsers.length > 0
              ? selectedUsers.map((u) => ({ userId: parseInt(u.userId, 10), role: u.role }))
              : undefined,
        } as const;


        await createProject(createData);
        showNotification.success("Proje Oluşturuldu", " Proje başarıyla oluşturuldu!");
      }
      handleReset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(`Proje ${isEditMode ? "güncelleme" : "oluşturma"} hatası:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  return (
    <>
      <Modal
        title={
          isViewMode
            ? `Proje Detayları: ${fullProjectDetails?.code}`
            : isEditMode
              ? `Proje Güncelle: ${fullProjectDetails?.code}`
              : "Yeni Proje Oluştur"
        }
        open={visible}
        onCancel={handleModalClose}
        footer={null}
        width={1200}
        destroyOnHidden
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      >
        {isLoadingDetails ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Proje detayları yükleniyor..." />
          </div>
        ) : (
          <Form form={form} layout="vertical" onFinish={isViewMode ? undefined : handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-1">
              <Form.Item
                label="Proje Kodu"
                name="code"
                rules={[
                  { required: !isEditMode, message: "Proje kodu zorunludur!" },
                ]}
                style={formItemNoMarginStyle}
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
                style={formItemNoMarginStyle}
              >
                <Input
                  placeholder="Proje başlığını girin"
                  size="middle"
                  disabled={!!isViewMode}
                  style={viewModeFieldStyle}
                />
              </Form.Item>

              <Form.Item label="Planlanan Çalışma Saati" name="plannedHours" style={formItemNoMarginStyle}>
                <InputNumber
                  min={0}
                  max={10000}
                  placeholder="Saat"
                  onChange={onChangeNumber}
                  size="middle"
                  style={{ width: "100%", ...(viewModeFieldStyle || {}) }}
                  disabled={!!isViewMode}
                />
              </Form.Item>

              <Form.Item label="Planlanan Başlangıç Tarihi" name="plannedStartDate" style={formItemNoMarginStyle}>
                <DatePicker
                  placeholder="Başlangıç tarihi"
                  size="middle"
                  style={{ width: "100%", ...(viewModeFieldStyle || {}) }}
                  format="DD-MM-YYYY"
                  disabled={!!isViewMode}
                />
              </Form.Item>

              <Form.Item label="Planlanan Bitiş Tarihi" name="plannedEndDate" style={formItemNoMarginStyle}>
                <DatePicker
                  placeholder="Bitiş tarihi"
                  size="middle"
                  style={{ width: "100%", ...(viewModeFieldStyle || {}) }}
                  format="DD-MM-YYYY"
                  disabled={!!isViewMode}
                />
              </Form.Item>

              <Form.Item label="Başlangıç Zamanı" name="startedAt" style={formItemNoMarginStyle}>
                <DatePicker
                  placeholder="Başlangıç zamanı"
                  size="middle"
                  style={{ width: "100%", ...(viewModeFieldStyle || {}) }}
                  format="DD-MM-YYYY"
                  disabled={!!isViewMode}
                />
              </Form.Item>

              <Form.Item label="Bitiş Zamanı" name="endAt" style={formItemNoMarginStyle}>
                <DatePicker
                  placeholder="Bitiş zamanı"
                  size="middle"
                  style={{ width: "100%", ...(viewModeFieldStyle || {}) }}
                  format="DD-MM-YYYY"
                  disabled={!!isViewMode}
                />
              </Form.Item>

              <Form.Item label="Proje Durumu" name="status" style={formItemNoMarginStyle}>
                <Select
                  placeholder="Durum seçin"
                  allowClear
                  size="middle"
                  style={{ width: "100%", ...(viewModeFieldStyle || {}) }}
                  options={statusOptions}
                  disabled={!!isViewMode}
                />
              </Form.Item>

              <Form.Item label="Proje Önceliği" name="priority" style={formItemNoMarginStyle}>
                <Select
                  placeholder="Öncelik seçin"
                  allowClear
                  size="middle"
                  style={{ width: "100%", ...(viewModeFieldStyle || {}) }}
                  options={priorityOptions}
                  disabled={!!isViewMode}
                />
              </Form.Item>

              {/* Customer */}
              <Form.Item label="Müşteri" name="customer" style={formItemNoMarginStyle}>
                <Select
                  showSearch
                  placeholder="Müşteri seçin veya arayın..."
                  options={customerOptions}
                  loading={customerLoading}
                  filterOption={false}
                  onSearch={handleCustomerSearch}
                  allowClear
                  size="middle"
                  disabled={!!isViewMode}
                  style={{ width: "100%", ...(viewModeFieldStyle || {}) }}
                  optionFilterProp="label"
                  notFoundContent={
                    customerLoading ? (
                      <div className="flex justify-center items-center py-2">
                        <Spin size="small" />
                        <span className="ml-2">Müşteriler aranıyor...</span>
                      </div>
                    ) : (
                      "Müşteri bulunamadı"
                    )
                  }
                  onDropdownVisibleChange={(open) => {
                    if (open && customerOptions.length === 0) {
                      setCustomerOptions(defaultCustomerOptions);
                    }
                  }}
                />
              </Form.Item>

              <Form.Item label="Üst Projeler" name="parentProjects" style={formItemNoMarginStyle}>
                <MultiSelectSearch
                  placeholder="Üst proje ara ve seç..."
                  onChange={handleParentProjectsChange}
                  value={selectedParentProjects}
                  apiUrl="/Project"
                  size="middle"
                  className="w-full"
                  disabled={isViewMode}
                  style={{ width: "100%", ...(viewModeFieldStyle || {}) }}
                  initialOptions={parentProjectOptions}
                  onOptionsChange={handleParentOptionsSync}
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
                    style={{ width: "100%", ...(viewModeFieldStyle || {}) }}
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

            <Form.Item label="Proje Ekibi" style={formItemNoMarginStyle}>
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
                    style={{ width: "100%" }}
                    filterOption={false}
                    showSearch
                  />
                )}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedUsers.map((user) => {
                    const userOption = userOptions.find((option) => option.value === user.userId);
                    const userName = userOption?.label || user.name || `User ${user.userId}`;
                    return (
                      <div
                        key={user.userId}
                        className="flex items-center mt-1 p-1 pl-3 rounded-lg border border-gray-200 bg-white"
                      >
                        <div className="flex-1">
                          <span className="font-sm text-gray-900">{userName}</span>
                        </div>
                        <Select
                          value={user.role}
                          className="flex-1"
                          onChange={(value) => handleUserRoleChange(user.userId, value as ProjectAssignmentRole)}
                          options={userRoleOptions}
                          size="small"
                          style={{ minWidth: 140 }}
                          disabled={isViewMode}
                          placeholder="Rol seçin"
                        />
                        {!isViewMode && (
                          <Button
                            type="text"
                            danger
                            icon={<AiOutlinePlus style={{ transform: "rotate(45deg)" }} />}
                            onClick={() => handleRemoveUser(user.userId)}
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

            {(isEditMode || isViewMode) && (
              <Form.Item label="Proje Dosyaları" style={formItemNoMarginStyle}>
                <ProjectFiles
                  projectId={resolvedProjectId ?? null}
                  editable={isEditMode}
                />
              </Form.Item>
            )}
            <Form.Item style={formItemNoMarginStyle}>
              <div className="flex justify-end w-full gap-3 pt-3">
                <Button onClick={handleModalClose} size="middle" className="min-w-[100px]">
                  {isViewMode ? "Kapat" : "İptal"}
                </Button>
                {!isViewMode && (
                  <>
                    {!isEditMode && (
                      <Button onClick={handleReset} size="middle" className="min-w-[100px]">
                        Temizle
                      </Button>
                    )}
                    <Button type="primary" htmlType="submit" size="middle" className="min-w-[100px]" loading={isSubmitting}>
                      {isEditMode ? "Güncelle" : "Oluştur"}
                    </Button>
                  </>
                )}
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
      <CreateLabelModal
        visible={isLabelModalVisible}
        mode={labelModalMode}
        initialData={editingLabelData}
        onSuccess={handleLabelModalSuccess}
        onCancel={handleLabelModalCancel}
      />
    </>
  );
}
