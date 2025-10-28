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
  Image,
} from "antd";
import { useState, useEffect, useCallback } from "react";
import type { CSSProperties, MouseEvent, KeyboardEvent } from "react";
import {
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineCloudUpload,
  AiOutlineFile,
  AiOutlineFilePdf,
  AiOutlineFileWord,
  AiOutlineFileExcel,
  AiOutlineFileZip,
  AiOutlineFileText,
} from "react-icons/ai";
import type { InputNumberProps, SelectProps } from "antd";
import MultiSelectSearch, { MultiSelectOption } from "../multi-select-search";
import { getClientsForSelect } from "@/services/projects/get-clients-for-select";
import { createProject } from "@/services/projects/create-project";
import { showNotification } from "@/utils/notification";
import getMultiSelectSearch from "@/services/projects/get-multi-select-search";
import { updateProject, UpdateProjectData } from "@/services/projects/update-project";
import { ProjectPriority } from "@/services/projects/get-projects";
import { getProjectById } from "../../../services/projects/get-project-by-code";
import type { ProjectModalProps } from "@/types/projects";
import CreateLabelModal from "./create-label-modal";
import { parseDate } from "@/utils/retype";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { getProjectFiles } from "@/services/files/get-project-files";
import { uploadProjectFile } from "@/services/files/upload-project-file";
import { downloadProjectFile } from "@/services/files/download-project-file";
import type { ProjectFileDto } from "@/types";
import { saveAs } from "file-saver";

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "bmp",
  "webp",
  "svg",
  "tiff",
  "ico",
]);

const extractExtension = (value?: string | null): string | null => {
  if (!value || typeof value !== "string") return null;
  const sanitized = value.split(/[?#]/)[0];
  const match = /\.([a-zA-Z0-9]+)$/.exec(sanitized);
  return match ? match[1].toLowerCase() : null;
};

const resolveFileExtension = (file: ProjectFileDto): string | null => {
  return extractExtension(file.file) ?? extractExtension(file.title) ?? null;
};

const isImageFile = (file: ProjectFileDto): boolean => {
  const ext = resolveFileExtension(file);
  return Boolean(ext && IMAGE_EXTENSIONS.has(ext));
};

const getFileIconByExtension = (extension: string | null) => {
  const baseClass = "h-8 w-8";
  switch (extension) {
    case "pdf":
      return <AiOutlineFilePdf className={baseClass} />;
    case "doc":
    case "docx":
      return <AiOutlineFileWord className={baseClass} />;
    case "xls":
    case "xlsx":
    case "csv":
      return <AiOutlineFileExcel className={baseClass} />;
    case "zip":
    case "rar":
    case "7z":
      return <AiOutlineFileZip className={baseClass} />;
    case "txt":
    case "md":
    case "json":
      return <AiOutlineFileText className={baseClass} />;
    default:
      return <AiOutlineFile className={baseClass} />;
  }
};

const mergeOptions = (existing: MultiSelectOption[], incoming: MultiSelectOption[]) => {
  const map = new Map<string, MultiSelectOption>();
  existing.forEach(o => map.set(String(o.value), o));
  incoming.forEach(o => map.set(String(o.value), o));
  return Array.from(map.values());
};

const resolveLabelColor = (label: any): string | undefined =>
  label?.color ??
  label?.Color ??
  label?.hexColor ??
  label?.HexColor ??
  label?.hex ??
  label?.Hex ??
  label?.colour ??
  label?.Colour;

const resolveLabelDescription = (label: any): string | undefined =>
  label?.description ?? label?.Description ?? label?.desc ?? label?.Desc;

const normalizeLabelOption = (label: any): MultiSelectOption | null => {
  if (!label) return null;
  const id = label?.id ?? label?.Id ?? label?.labelId ?? label?.value ?? label?.key;
  if (id === undefined || id === null) return null;

  const stringId = String(id);
  const resolvedName =
    label?.name || label?.title || label?.label || label?.Label || `Label ${stringId}`;

  return {
    value: stringId,
    label: resolvedName,
    key: stringId,
    color: resolveLabelColor(label),
    description: resolveLabelDescription(label),
    name: resolvedName,
    ...label,
  };
};

const normalizeProjectOption = (project: any): MultiSelectOption | null => {
  if (!project) return null;

  const id =
    project?.id ??
    project?.Id ??
    project?.projectId ??
    project?.ProjectId ??
    project?.value ??
    project?.key;

  if (id === undefined || id === null) return null;

  const stringId = String(id);
  const resolvedCode =
    project?.code ??
    project?.Code ??
    project?.projectCode ??
    project?.ProjectCode ??
    project?.project_code ??
    project?.Project_code;

  const resolvedTitle =
    project?.title ??
    project?.Title ??
    project?.name ??
    project?.Name ??
    project?.label ??
    project?.Label;

  const resolvedLabel =
    resolvedCode && resolvedTitle
      ? `${resolvedCode} - ${resolvedTitle}`
      : resolvedTitle ?? resolvedCode ?? `Project ${stringId}`;

  return {
    value: stringId,
    label: resolvedLabel,
    key: stringId,
    code: resolvedCode ?? project?.code ?? project?.Code,
    title: resolvedTitle ?? project?.title ?? project?.Title,
    ...project,
  };
};

const resolveProjectId = (project: any): string | null => {
  const rawId =
    project?.id ??
    project?.Id ??
    project?.projectId ??
    project?.ProjectId ??
    project?.value ??
    project?.key;
  if (rawId == null) return null;
  return String(rawId);
};

const extractIdsFromArray = (rawIds: any): string[] => {
  if (!Array.isArray(rawIds)) return [];
  const unique = new Set<string>();
  rawIds.forEach((v: string | number | null | undefined) => {
    if (v == null) return;
    unique.add(String(v));
  });
  return Array.from(unique);
};

const extractIdsFromProjects = (projects: any): string[] => {
  if (!Array.isArray(projects)) return [];
  const unique = new Set<string>();
  projects.forEach(p => {
    const id = resolveProjectId(p);
    if (id) unique.add(id);
  });
  return Array.from(unique);
};

const resolveParentProjectsArray = (source: any): any[] => {
  if (!source) return [];
  const candidates = [
    source?.ParentProjects,
    source?.parentProjects,
    source?.ParentProjectList,
    source?.parentProjectList,
  ];
  for (const c of candidates) if (Array.isArray(c) && c.length > 0) return c;
  return [];
};

const resolveParentProjectIds = (source: any): string[] => {
  if (!source) return [];
  const candidates = [source?.ParentProjectIds, source?.parentProjectIds, source?.parent_project_ids];
  for (const c of candidates) {
    const ids = extractIdsFromArray(c);
    if (ids.length > 0) return ids;
  }
  const arr = resolveParentProjectsArray(source);
  if (arr.length > 0) return extractIdsFromProjects(arr);
  return [];
};

const resolveParentProjectOptions = (source: any): MultiSelectOption[] => {
  const projects = resolveParentProjectsArray(source);
  if (projects.length === 0) return [];
  return projects
    .map(normalizeProjectOption)
    .filter((o): o is MultiSelectOption => Boolean(o));
};

const extractArrayFromResponse = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  const candidates = [
    payload?.result?.data,
    payload?.data?.result?.data,
    payload?.data?.data,
    payload?.data,
    payload?.result,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
};

export default function CreateProjectModal({
  visible,
  onClose,
  onSuccess,
  projectData,
  mode = "create",
}: ProjectModalProps) {
  const [form] = Form.useForm();

  // --- CUSTOMER (CLIENT) STATE: searchable Select with numeric id values ---
  const [customerOptions, setCustomerOptions] = useState<Array<{ value: number; label: string }>>([]);
  const [defaultCustomerOptions, setDefaultCustomerOptions] = useState<Array<{ value: number; label: string }>>([]);
  const [customerLoading, setCustomerLoading] = useState(false);

  const [selectedParentProjects, setSelectedParentProjects] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [parentProjectOptions, setParentProjectOptions] = useState<MultiSelectOption[]>([]);
  const [labelSelectOptions, setLabelSelectOptions] = useState<MultiSelectOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User assignment state
  const [selectedUsers, setSelectedUsers] = useState<{ userId: string; role: string; name: string }[]>([]);
  const [userOptions, setUserOptions] = useState<MultiSelectOption[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearchValue, setUserSearchValue] = useState("");

  // Label modal state
  const [isLabelModalVisible, setIsLabelModalVisible] = useState(false);
  const [labelModalMode, setLabelModalMode] = useState<"create" | "edit">("create");
  const [editingLabelData, setEditingLabelData] = useState<any>(null);

  // Project details state
  const [fullProjectDetails, setFullProjectDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [projectFiles, setProjectFiles] = useState<ProjectFileDto[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const isEditMode = mode === "edit" && !!projectData;
  const isViewMode = mode === "view" && !!projectData;
  const resolvedProjectId = fullProjectDetails?.Id ?? projectData?.Id ?? null;

  const viewModeFieldStyle: CSSProperties | undefined = isViewMode
    ? { backgroundColor: "#f7f9fc", color: "#1f1f1f", borderColor: "#d9d9d9" }
    : undefined;
  const formItemNoMarginStyle: CSSProperties = { marginBottom: 0 };

  const areOptionsEqual = (first: MultiSelectOption[], second: MultiSelectOption[]) => {
    if (first.length !== second.length) return false;
    const map = new Map<string, MultiSelectOption>();
    first.forEach(o => map.set(String(o.value), o));
    return second.every(option => {
      const key = String(option.value);
      const matched = map.get(key);
      if (!matched) return false;
      const matchedLabel = typeof matched.label === "string" ? matched.label : String(matched.label);
      const optionLabel = typeof option.label === "string" ? option.label : String(option.label);
      return (
        matchedLabel === optionLabel &&
        (matched as any)?.color === (option as any)?.color &&
        (matched as any)?.description === (option as any)?.description
      );
    });
  };

  const handleLabelOptionsSync = useCallback((options: MultiSelectOption[]) => {
    if (options.length === 0) {
      setLabelSelectOptions(prev => (prev.length === 0 ? prev : []));
      return;
    }
    setLabelSelectOptions(prev => {
      const merged = mergeOptions(prev, options);
      return areOptionsEqual(prev, merged) ? prev : merged;
    });
  }, []);

  const handleParentOptionsSync = useCallback((options: MultiSelectOption[]) => {
    if (options.length === 0) return;
    setParentProjectOptions(prev => {
      const merged = mergeOptions(prev, options);
      return areOptionsEqual(prev, merged) ? prev : merged;
    });
  }, []);

  // Ensure selected customer id is present in options so label is shown
  const ensureCustomerOption = useCallback(
    (id: number | undefined | null, labelHint?: string) => {
      if (id == null) return;
      const exists =
        customerOptions.some(o => o.value === id) ||
        defaultCustomerOptions.some(o => o.value === id);
      if (!exists) {
        const item = { value: id, label: labelHint || `Müşteri #${id}` };
        setCustomerOptions(prev => [item, ...prev]);
        setDefaultCustomerOptions(prev => [item, ...prev]);
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

      const clientOptions = extractArrayFromResponse(clientsRaw)
        .map((item: any) => {
          if (item?.id == null || !item?.name) return null;
          return { value: Number(item.id), label: String(item.name) };
        })
        .filter(Boolean) as Array<{ value: number; label: string }>;

      setCustomerOptions(clientOptions);
      setDefaultCustomerOptions(clientOptions);

      const normalizedLabelOptions = extractArrayFromResponse(labelsRaw)
        .map(normalizeLabelOption)
        .filter((o): o is MultiSelectOption => Boolean(o));
      if (normalizedLabelOptions.length > 0) handleLabelOptionsSync(normalizedLabelOptions);

      const normalizedProjectOptions = extractArrayFromResponse(projectsRaw)
        .map(normalizeProjectOption)
        .filter((o): o is MultiSelectOption => Boolean(o));
      if (normalizedProjectOptions.length > 0) {
        setParentProjectOptions(prev => {
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

  const loadProjectFiles = useCallback(async (projectId: number) => {
    setIsLoadingFiles(true);
    try {
      const { files } = await getProjectFiles({ projectId, pageSize: 100 });
      setProjectFiles(files);
    } catch (error) {
      console.error("Proje dosyaları yüklenirken hata:", error);
      showNotification.error("Dosyalar yüklenemedi", "Proje dosyaları yüklenirken bir hata oluştu.");
      setProjectFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    form.resetFields();
    setCustomerOptions([]);
    setDefaultCustomerOptions([]);
    setSelectedParentProjects([]);
    setSelectedLabels([]);
    setParentProjectOptions([]);
    setLabelSelectOptions(prev => (prev.length === 0 ? prev : []));
    setSelectedUsers([]);
    setUserOptions([]);
    setUserSearchValue("");
    setLabelModalMode("create");
    setEditingLabelData(null);
    setIsLabelModalVisible(false);
    setProjectFiles([]);
    setIsLoadingFiles(false);
    setIsUploadingFile(false);
    setUploadProgress(0);
    setIsDragOver(false);
    console.log("Form temizlendi");
  }, [form]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!resolvedProjectId) {
        showNotification.error("Proje bulunamadı", "Dosya yüklemek için önce projeyi seçin.");
        return;
      }
      setIsUploadingFile(true);
      setUploadProgress(0);
      try {
        const uploaded = await uploadProjectFile({
          projectId: resolvedProjectId,
          file,
          title: file.name,
          onProgress: progress => setUploadProgress(progress),
        });
        showNotification.success("Dosya yüklendi", `"${uploaded.title}" başarıyla yüklendi.`);
        await loadProjectFiles(resolvedProjectId);
      } catch (error) {
        console.error("Dosya yükleme hatası:", error);
        showNotification.error("Dosya yüklenemedi", "Dosya yüklenirken bir hata oluştu.");
      } finally {
        setIsUploadingFile(false);
        setUploadProgress(0);
      }
    },
    [resolvedProjectId, loadProjectFiles]
  );

  const handleFileDownload = useCallback(async (file: ProjectFileDto) => {
    try {
      const { blob, fileName } = await downloadProjectFile(file.id);
      const resolvedName = fileName || file.title || `project-file-${file.id}`;
      saveAs(blob, resolvedName);
    } catch (error) {
      console.error("Dosya indirme hatası:", error);
      showNotification.error("Dosya indirilemedi", "Dosya indirilirken bir hata oluştu.");
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) handleFileUpload(files[0]);
    },
    [handleFileUpload]
  );
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) handleFileUpload(files[0]);
      e.target.value = "";
    },
    [handleFileUpload]
  );

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

      const labelOption = labelSelectOptions.find(opt => opt.value === String(value));
      const labelData = {
        id: String(value),
        name: labelOption?.name || labelOption?.label || "",
        description: (labelOption as any)?.description || "",
        color: (labelOption as any)?.color || "#1890ff",
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
        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginInlineEnd: 4, paddingInlineEnd: isViewMode ? 8 : 4 }}
      >
        <span>{label}</span>
        {!isViewMode && (
          <Button type="text" size="small" icon={<AiOutlineEdit />} onClick={handleEditClick} />
        )}
      </Tag>
    );
  };

  // mount
  useEffect(() => {
    if (!visible) return;
    loadInitialSelectData();
  }, [visible, loadInitialSelectData]);

  // fill form (edit/view)
  useEffect(() => {
    if (!visible) return;
    if ((isEditMode || isViewMode) && projectData) {
      let derivedLabelIds: string[] = [];
      let derivedParentProjectIds: string[] = [];

      if (fullProjectDetails) {
        interface Label { id: string | number; [key: string]: any }
        derivedLabelIds = fullProjectDetails.Labels
          ? (fullProjectDetails.Labels as Label[]).map(l => String(l.id))
          : [];
      } else {
        derivedLabelIds =
          projectData.LabelIds && projectData.LabelIds.length > 0
            ? projectData.LabelIds
                .map(id => (id !== null && id !== undefined ? String(id) : null))
                .filter((id): id is string => Boolean(id))
            : [];
      }

      const detailParentIds = resolveParentProjectIds(fullProjectDetails);
      const fallbackParentIds = resolveParentProjectIds(projectData);
      derivedParentProjectIds = detailParentIds.length > 0 ? detailParentIds : fallbackParentIds;

      const detailParentOptions = resolveParentProjectOptions(fullProjectDetails);
      const projectParentOptions = resolveParentProjectOptions(projectData);
      const resolvedParentOptions = mergeOptions(detailParentOptions, projectParentOptions);

      const normalizedLabelAccumulator: MultiSelectOption[] = [];
      const pushNormalizedLabels = (labelsSource: any) => {
        if (!Array.isArray(labelsSource)) return;
        labelsSource.forEach(labelItem => {
          const normalized = normalizeLabelOption(labelItem);
          if (normalized) normalizedLabelAccumulator.push(normalized);
        });
      };
      pushNormalizedLabels(fullProjectDetails?.Labels);
      pushNormalizedLabels((fullProjectDetails as any)?.labels);
      pushNormalizedLabels(projectData?.Labels);
      pushNormalizedLabels((projectData as any)?.labels);

      if (labelSelectOptions.length > 0 && derivedLabelIds.length > 0) {
        const matchedExisting = labelSelectOptions.filter(option => derivedLabelIds.includes(String(option.value)));
        normalizedLabelAccumulator.push(...matchedExisting);
      }

      const normalizedLabelOptions = mergeOptions([], normalizedLabelAccumulator);
      const fallbackLabelOptions = derivedLabelIds
        .filter(id => !normalizedLabelOptions.some(option => String(option.value) === id))
        .map(id => {
          const existing =
            normalizedLabelOptions.find(option => String(option.value) === id) ||
            labelSelectOptions.find(option => String(option.value) === id);
          if (existing) return existing;
          return { value: id, label: id, key: id } as MultiSelectOption;
        });
      const combinedOptions = mergeOptions(normalizedLabelOptions, fallbackLabelOptions);

      const initialClientId: number | undefined =
        (fullProjectDetails?.ClientId ?? projectData.ClientId) ?? undefined;

      form.setFieldsValue({
        code: fullProjectDetails?.Code || projectData.Code,
        title: fullProjectDetails?.Title || projectData.Title,
        plannedStartDate: parseDate(fullProjectDetails?.PlannedStartDate) || parseDate(projectData.rawPlannedStartDate),
        plannedEndDate: parseDate(fullProjectDetails?.PlannedDeadLine) || parseDate(projectData.rawPlannedDeadline),
        plannedHours: fullProjectDetails?.PlannedHours ?? projectData.PlannedHours,
        startedAt: parseDate(fullProjectDetails?.StartedAt) || parseDate(projectData.rawStartedAt),
        endAt: parseDate(fullProjectDetails?.EndAt) || parseDate(projectData.rawEndAt),
        status: fullProjectDetails?.Status ? statusStringToNumber(fullProjectDetails.Status) : projectData.rawStatus ?? 0,
        priority: fullProjectDetails?.Priority || projectData.Priority,
        customer: initialClientId, // numeric id
        parentProjects: derivedParentProjectIds,
        labels: derivedLabelIds,
      });

      // ensure we can display customer label
      ensureCustomerOption(
        initialClientId,
        (fullProjectDetails as any)?.Client?.Name ||
          (projectData as any)?.Client?.Name ||
          (projectData as any)?.ClientName ||
          undefined
      );

      if (fullProjectDetails?.AssignedUsers && Array.isArray(fullProjectDetails.AssignedUsers)) {
        setSelectedUsers(
          fullProjectDetails.AssignedUsers.map((user: any) => ({
            userId: String(user.userId || user.id),
            name: String(user.user?.name || user.id),
            role: user.role || "Member",
          }))
        );
      } else {
        setSelectedUsers([]);
      }

      setSelectedParentProjects(derivedParentProjectIds);
      setSelectedLabels(derivedLabelIds);
      setLabelSelectOptions(prev => (areOptionsEqual(prev, combinedOptions) ? prev : combinedOptions));
      setLabelModalMode("create");
      setEditingLabelData(null);

      if (resolvedParentOptions.length > 0) {
        handleParentOptionsSync(resolvedParentOptions);
      } else if (derivedParentProjectIds.length > 0) {
        const normalizedParentOptions = derivedParentProjectIds.map(id => ({
          value: id,
          label: `Proje ${id}`,
          key: id,
        })) as MultiSelectOption[];
        if (normalizedParentOptions.length > 0) handleParentOptionsSync(normalizedParentOptions);
      }
    }
  }, [
    visible,
    isEditMode,
    isViewMode,
    projectData,
    fullProjectDetails,
    labelSelectOptions,
    ensureCustomerOption,
    handleParentOptionsSync,
  ]);

  // reset on create open
  useEffect(() => {
    if (!visible) return;
    if (isEditMode || isViewMode) return;
    handleReset();
  }, [visible, isEditMode, isViewMode, handleReset]);

  // fetch details
  useEffect(() => {
    if (!visible || (!isEditMode && !isViewMode) || !projectData?.Id) {
      setFullProjectDetails(null);
      setIsLoadingDetails(false);
      return;
    }
    const fetchProjectDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const details = await getProjectById(String(projectData.Id));
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
  }, [visible, isEditMode, isViewMode, projectData?.Id]);

  // files
  useEffect(() => {
    if (!visible || !resolvedProjectId || (!isEditMode && !isViewMode)) {
      setProjectFiles([]);
      setIsLoadingFiles(false);
      return;
    }
    loadProjectFiles(resolvedProjectId);
  }, [visible, resolvedProjectId, isEditMode, isViewMode, loadProjectFiles]);

  // --- CUSTOMER search (remote) ---
  const handleCustomerSearch = async (searchText: string) => {
    if (!searchText || searchText.trim().length < 2) {
      setCustomerOptions(defaultCustomerOptions);
      return;
    }
    setCustomerLoading(true);
    try {
      const res = await getClientsForSelect(searchText, "/Client");
      const apiList = extractArrayFromResponse(res);
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
        const apiResult = extractArrayFromResponse(response.data);
        const formattedOptions: MultiSelectOption[] = apiResult.map((item: any) => {
          const id = item.id?.toString() || Math.random().toString();
          const name =
            item.name ||
            item.title ||
            `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
            `User ${id}`;
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
      const apiResult = extractArrayFromResponse(response.data);
      const formattedOptions: MultiSelectOption[] = apiResult.map((item: any) => {
        const id = item.id?.toString() || Math.random().toString();
        const name =
          item.name ||
          item.title ||
          `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
          `User ${id}`;
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
    const userOption = userOptions.find(option => option.value === userId);
    if (!userOption) return;
    if (selectedUsers.some(u => u.userId === userId)) return;
    const newUser = {
      userId,
      name: typeof userOption.label === "string" ? userOption.label : String(userOption.label),
      role: "Member",
    };
    setSelectedUsers(prev => [...prev, newUser]);
  };

  const handleRemoveUser = (userId: string) => {
    if (isViewMode) return;
    setSelectedUsers(prev => prev.filter(u => u.userId !== userId));
  };

  const handleUserRoleChange = (userId: string, role: string) => {
    if (isViewMode) return;
    setSelectedUsers(prev => prev.map(u => (u.userId === userId ? { ...u, role } : u)));
  };

  const handleLabelCreateButtonClick = () => {
    setLabelModalMode("create");
    setEditingLabelData(null);
    setIsLabelModalVisible(true);
  };

  const handleLabelModalSuccess = (labelOption: MultiSelectOption) => {
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

  const onChangeNumber: InputNumberProps["onChange"] = value => {
    form.setFieldValue("plannedHours", value);
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      
      if (isEditMode && projectData?.Id) {
        const updateData: UpdateProjectData = {
          title: values.title,
          plannedStartDate: values.plannedStartDate
            ? dayjs.utc(dayjs(values.plannedStartDate).format("YYYY-MM-DD")).valueOf()
            : null,
          plannedDeadline: values.plannedEndDate
            ? dayjs.utc(dayjs(values.plannedEndDate).format("YYYY-MM-DD")).valueOf()
            : null,
          plannedHours: values.plannedHours || null,
          startedAt: values.startedAt
            ? dayjs.utc(dayjs(values.startedAt).format("YYYY-MM-DD")).valueOf()
            : null,
          labelIds: selectedLabels,
          parentProjectIds: selectedParentProjects,
          endAt: values.endAt ? dayjs.utc(dayjs(values.endAt).format("YYYY-MM-DD")).valueOf() : null,
          status: statusNumberToString(values.status),
          priority: values.priority,
          assignedUsers: selectedUsers.map(u => ({ UserId: parseInt(u.userId, 10), Role: u.role })),
          clientId: values.customer ?? null, // <-- number id
        };
        await updateProject(projectData.Id, updateData);
        showNotification.success("Proje Güncellendi", " Proje başarıyla güncellendi!");
      } else {
        const createData = {
          Code: values.code || undefined,
          Title: values.title || undefined,
          PlannedHours: values.plannedHours || undefined,
          PlannedStartDate: values.plannedStartDate
            ? dayjs.utc(dayjs(values.plannedStartDate).format("YYYY-MM-DD")).valueOf()
            : undefined,
          PlannedDeadLine: values.plannedEndDate
            ? dayjs.utc(dayjs(values.plannedEndDate).format("YYYY-MM-DD")).valueOf()
            : undefined,
          StartedAt: values.startedAt
            ? dayjs.utc(dayjs(values.startedAt).format("YYYY-MM-DD")).valueOf()
            : undefined,
          EndAt: values.endAt
            ? dayjs.utc(dayjs(values.endAt).format("YYYY-MM-DD")).valueOf()
            : undefined,
          Status: statusNumberToString(values.status) || undefined,
          Priority: values.priority || undefined,
          clientId: values.customer || undefined, // <-- number id
          ParentProjectIds: selectedParentProjects || [],
          LabelIds: selectedLabels || [],
          AssignedUsers: selectedUsers.map(u => ({ UserId: parseInt(u.userId, 10), Role: u.role })),
        };
        const cleanedData = Object.fromEntries(
          Object.entries(createData).filter(
            ([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)
          )
        );
        await createProject(cleanedData);
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

  const statusStringToNumber = (status: string): number => {
    switch (status) {
      case "Planned":
        return 0;
      case "Active":
        return 1;
      case "Completed":
        return 2;
      case "InActive":
        return 3;
      default:
        return 0;
    }
  };

  const statusNumberToString = (status: number): string => {
    switch (status) {
      case 0:
        return "Planned";
      case 1:
        return "Active";
      case 2:
        return "Completed";
      case 3:
        return "InActive";
      default:
        return "Planned";
    }
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

  const userRoleOptions = [
    { value: "Manager", label: "Yöneticisi" },
    { value: "Member", label: "Üye" },
    { value: "Reviewer", label: "Gözlemci" },
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
        destroyOnClose
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
                rules={[{ required: !isEditMode, message: "Proje kodu zorunludur!" }]}
                style={formItemNoMarginStyle}
              >
                <Input placeholder="Örn: PRJ-001" size="middle" disabled={!!isEditMode || !!isViewMode} style={viewModeFieldStyle} />
              </Form.Item>

              <Form.Item
                label="Proje Başlığı"
                name="title"
                rules={[{ required: true, message: "Proje başlığı zorunludur!" }]}
                style={formItemNoMarginStyle}
              >
                <Input placeholder="Proje başlığını girin" size="middle" disabled={!!isViewMode} style={viewModeFieldStyle} />
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

              {/* --- UPDATED: Searchable Select for Customer --- */}
              <Form.Item label="Müşteri" name="customer" style={formItemNoMarginStyle}>
                <Select
                  showSearch
                  placeholder="Müşteri seçin veya arayın..."
                  options={customerOptions}
                  loading={customerLoading}
                  filterOption={false}              // remote search
                  onSearch={handleCustomerSearch}   // fetch as user types
                  allowClear
                  size="middle"
                  disabled={!!isViewMode}
                  style={{ width: "100%", ...(viewModeFieldStyle || {}) }}
                  optionFilterProp="label"          // in case filterOption toggled later
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
                    const userOption = userOptions.find(option => option.value === user.userId);
                    const userName = userOption?.label || user.name || `User ${user.userId}`;
                    return (
                      <div key={user.userId} className="flex items-center mt-1 p-1 pl-3 rounded-lg border border-gray-200 bg-white">
                        <div className="flex-1">
                          <span className="font-sm text-gray-900">{userName}</span>
                        </div>
                        <Select
                          value={user.role}
                          className="flex-1"
                          onChange={value => handleUserRoleChange(user.userId, value)}
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
                  {selectedUsers.length === 0 && <div className="text-center py-2 text-gray-500">Henüz ekip üyesi eklenmemiş</div>}
                </div>
              </div>
            </Form.Item>

            {(isEditMode || isViewMode) && (
              <Form.Item label="Proje Dosyaları" style={formItemNoMarginStyle}>
                <div
                  className="border-2 border-dashed rounded-lg p-2 pt-0 transition-colors duration-200"
                  style={{
                    borderColor: isDragOver ? "#1890ff" : "#d9d9d9",
                    backgroundColor: isDragOver ? "#f0f8ff" : "transparent",
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isUploadingFile && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Dosya yükleniyor...</span>
                        <span className="text-sm text-gray-500">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {isEditMode && !isUploadingFile && (
                    <div className="text-center">
                      <AiOutlineCloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-0" />
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Dosyalarınızı sürükleyip bırakın veya</p>
                        <div className="flex justify-center mb-0">
                          <Button type="primary" size="small" onClick={() => document.getElementById("file-input")?.click()}>
                            Dosya Seç
                          </Button>
                        </div>
                        <input id="file-input" type="file" className="hidden" onChange={handleFileSelect} accept="*/*" />
                      </div>
                    </div>
                  )}

                  <div className="mt-2">
                    {isLoadingFiles ? (
                      <div className="flex items-center justify-center py-6">
                        <Spin size="small" />
                        <span className="ml-2">Dosyalar yükleniyor...</span>
                      </div>
                    ) : projectFiles.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {isEditMode ? "Henüz dosya yüklenmemiş" : "Dosya bulunmuyor"}
                      </div>
                    ) : (
                      <div className="flex gap-3 overflow-x-auto">
                        {projectFiles.map(file => {
                          const extension = resolveFileExtension(file);
                          const displayName = file.title || `Dosya #${file.id}`;
                          const imagePreview = isImageFile(file);
                          const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleFileDownload(file);
                            }
                          };
                          return (
                            <div
                              key={file.id}
                              role="button"
                              tabIndex={0}
                              className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-blue-500 hover:shadow-md focus:border-blue-500 focus:shadow-md focus:outline-none flex-shrink-0 w-32"
                              onClick={() => handleFileDownload(file)}
                              onKeyDown={handleKeyDown}
                            >
                              <div className="flex items-center justify-center">
                                {imagePreview ? (
                                  <Image
                                    src={`${import.meta.env.VITE_APP_API_URL}${file.file}`}
                                    alt={displayName}
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 rounded-md object-cover"
                                    preview={false}
                                  />
                                ) : (
                                  <span className="flex h-16 w-16 items-center justify-center rounded-md bg-blue-50 text-blue-500">
                                    {getFileIconByExtension(extension)}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="truncate text-sm font-medium text-gray-900" title={displayName}>
                                  {displayName}
                                </span>
                                {extension && <span className="text-xs uppercase text-gray-500">.{extension}</span>}
                                {file.description && <span className="text-xs text-gray-500">{file.description}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
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
                      {isSubmitting ? (isEditMode ? "Güncelleniyor..." : "Oluşturuluyor...") : isEditMode ? "Proje Güncelle" : "Proje Oluştur"}
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
