import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  message,
  Divider,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
  UserAddOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  StopOutlined,
  DownloadOutlined,
  EyeOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import { GetUsers, createUser, deleteUser, deactivateUser } from "@/services/user";
import { GetReports, createReport, deleteReport } from "@/services/reports";
import { GetClients, createClient, deleteClient, updateClient } from "@/services/clients";
import { GetMachines, createMachine, deleteMachine, updateMachine } from "@/services/machines";
import { UserDto, CreateUserPayload, Report, CreateReportPayload, ProjectDto, ClientDto, CreateClientPayload, MachineDto, CreateMachineForm } from "@/types";
import { fromMillis, toMillis } from "@/utils/retype";
import { showNotification } from "@/utils/notification";
import { ProjectPriority, ProjectStatus } from "@/services/projects/get-projects";
import { TaskStatus } from "@/types/tasks/ui";
import MultiSelectSearch from "@/components/common/multi-select-search";
import getMultiSelectSearch from "@/services/projects/get-multi-select-search";
import type { SelectProps } from "antd";
import { ResizableTitle } from "@/components/common/resizable";


const REPORT_TYPE_LABELS: Record<string, string> = {
  "ProjectTimeLatency": "Proje Zaman Raporu",
  "TaskReport": "Görev Raporu",
  "EffortAndCapacityReport": "Efor ve Kapasite Raporu",
  "TeamPerformanceReport": "Takım Performans Raporu",
};

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

const normalizeProjectOption = (project: ProjectDto): SelectOption | null => {
  if (!project) return null;
  return {
    value: project.id,
    label: [project.code, project.title].filter(Boolean).join(" - ").trim(),
    key: String(project.id),
    raw: project,
  };
};

export default function SupportPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(true);
  const [searchText, setSearchText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserRowKeys, setSelectedUserRowKeys] = useState<React.Key[]>([]);


  // Delete confirmation state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserDto | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportForm] = Form.useForm();
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);

  // Client Management State
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [isClientModalVisible, setIsClientModalVisible] = useState(false);
  const [clientForm] = Form.useForm();
  const [clientPagination, setClientPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [clientSearchText, setClientSearchText] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [editingClient, setEditingClient] = useState<ClientDto | null>(null);

  // Machine Management State
  const [machines, setMachines] = useState<MachineDto[]>([]);
  const [machineLoading, setMachineLoading] = useState(false);
  const [isMachineModalVisible, setIsMachineModalVisible] = useState(false);
  const [machineForm] = Form.useForm();
  const [machinePagination, setMachinePagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [machineSearchText, setMachineSearchText] = useState("");
  const [machineSearchTerm, setMachineSearchTerm] = useState("");
  const [editingMachine, setEditingMachine] = useState<MachineDto | null>(null);

  // Machine Delete State
  const [deleteMachineModalVisible, setDeleteMachineModalVisible] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState<MachineDto | null>(null);

  // Machine Selection & View
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);
  const [machineModalMode, setMachineModalMode] = useState<'create' | 'edit' | 'view'>('create');

  // Machine Sorting
  const [machineSortBy, setMachineSortBy] = useState<string | null>(null);
  const [machineSortDesc, setMachineSortDesc] = useState(false);

  // Machine Columns State (for resizing)
  const [machineColumns, setMachineColumns] = useState<any[]>([
    { title: "ID", dataIndex: "id", key: "id", width: 80, sorter: true },
    { title: "İsim", dataIndex: "name", key: "name", width: 200, sorter: true },
    { title: "Kategori", dataIndex: "category", key: "category", width: 150, sorter: true },
    { title: "Marka", dataIndex: "brand", key: "brand", width: 150, sorter: true },
    { title: "Model", dataIndex: "model", key: "model", width: 150, sorter: true },
    { title: "Varsayılan Ömür", dataIndex: "usefulLife", key: "usefulLife", width: 150, sorter: true },
    { title: "Saatlik Maliyet", dataIndex: "hourlyCost", key: "hourlyCost", width: 150, sorter: true, render: (val: any, record: MachineDto) => val ? `${val} ${record.currency || 'TL'}` : '-' },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      width: 120,
      sorter: true,
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          'Available': 'Müsait',
          'InUse': 'Kullanımda',
          'OutOfService': 'Servis Dışı',
          'Maintenance': 'Bakımda'
        };
        return <Tag>{statusMap[status] || status}</Tag>;
      }
    },
  ]);


  // Project Search Logic
  const [projectOptions, setProjectOptions] = useState<SelectOption[]>([]);
  const [defaultProjectOptions, setDefaultProjectOptions] = useState<SelectOption[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const MIN_SEARCH_LENGTH = 2;

  const fetchProjects = useCallback(
    async (
      searchTerm: string,
      options: { updateDefaults?: boolean; errorMessage?: string } = {}
    ) => {
      const { updateDefaults = false, errorMessage = "Proje arama hatası:" } = options;

      setProjectLoading(true);
      try {
        const projectsRaw = await getMultiSelectSearch(searchTerm, "/Project");
        const projectList = extractArrayFromResponse(projectsRaw)
          .map(normalizeProjectOption)
          .filter((option): option is SelectOption => Boolean(option));

        setProjectOptions(projectList);

        if (updateDefaults) {
          setDefaultProjectOptions(projectList);
        }
      } catch (error) {
        console.error(errorMessage, error);
      } finally {
        setProjectLoading(false);
      }
    },
    []
  );

  const loadInitialProjectData = useCallback(async () => {
    await fetchProjects("", {
      updateDefaults: true,
      errorMessage: "Proje seçenekleri yüklenirken hata:",
    });
  }, [fetchProjects]);

  useEffect(() => {
    loadInitialProjectData();
  }, [loadInitialProjectData]);

  const handleProjectSearch = useCallback(
    async (searchText: string) => {
      const trimmed = searchText.trim();

      if (trimmed === "") {
        await fetchProjects("", { updateDefaults: true });
        return;
      }

      if (trimmed.length > 0 && trimmed.length < MIN_SEARCH_LENGTH) {
        setProjectOptions(defaultProjectOptions);
        return;
      }

      await fetchProjects(trimmed);
    },
    [defaultProjectOptions, fetchProjects]
  );

  const handleProjectChange = useCallback(
    async (value: number | undefined) => {
      if (value === undefined) {
        await fetchProjects("", { updateDefaults: true });
      }
    },
    [fetchProjects]
  );

  const ensureProjectOptions = useCallback(
    (open: boolean) => {
      if (open && projectOptions.length === 0 && defaultProjectOptions.length > 0) {
        setProjectOptions(defaultProjectOptions);
      }
    },
    [defaultProjectOptions, projectOptions.length]
  );

  const projectStatusOptions = [
    { value: ProjectStatus.ACTIVE, label: "Aktif" },
    { value: ProjectStatus.INACTIVE, label: "Pasif" },
    { value: ProjectStatus.COMPLETED, label: "Tamamlandı" },
    { value: ProjectStatus.PLANNED, label: "Planlandı" },
  ];
  const projectPriorityOptions = [
    { value: ProjectPriority.YUKSEK, label: "Yüksek" },
    { value: ProjectPriority.ORTA, label: "Orta" },
    { value: ProjectPriority.DUSUK, label: "Düşük" },
  ];

  const taskStatusOptions = [
    { value: TaskStatus.TODO, label: "Yapılacak" },
    { value: TaskStatus.IN_PROGRESS, label: "Devam Ediyor" },
    { value: TaskStatus.INACTIVE, label: "Pasif" },
    { value: TaskStatus.DONE, label: "Tamamlandı" },
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchText(searchTerm);
      setPagination(prev => ({ ...prev, current: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, isActiveFilter, searchText]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await GetUsers({
        query: {
          search: searchText,
          page: pagination.current,
          pageSize: pagination.pageSize,
          isActive: isActiveFilter === null ? undefined : isActiveFilter,
        },
      });

      setUsers(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.totalRecords || 0,
      }));
    } catch (error) {
      message.error("Kullanıcılar yüklenirken bir hata oluştu");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const response = await GetReports({
        query: {
          SortBy: 'createdAt',
          SortDesc: true
        }
      });
      setReports(response.data || []);
    } catch (error) {
      message.error("Raporlar yüklenirken bir hata oluştu");
      console.error("Error fetching reports:", error);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleCreateUser = async (values: CreateUserPayload) => {
    try {
      setLoading(true);
      await createUser(values);
      message.success("Kullanıcı başarıyla eklendi");
      setIsModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Kullanıcı eklenirken bir hata oluştu";
      message.error(errorMessage);
      console.error("Error creating user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: UserDto) => {
    setUserToDelete(user);
    setDeleteConfirmationText("");
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    if (deleteConfirmationText !== userToDelete.name) {
      message.error("Girilen isim eşleşmiyor!");
      return;
    }

    try {
      setLoading(true);
      await deleteUser(userToDelete.id);
      message.success("Kullanıcı başarıyla silindi");
      setDeleteModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Kullanıcı silinirken bir hata oluştu";
      message.error(errorMessage);
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
      setUserToDelete(null);
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    try {
      setLoading(true);
      await deactivateUser(userId);
      showNotification.success("İşlem Başarılı", "Kullanıcı başarıyla pasife alındı");
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Kullanıcı pasife alınırken bir hata oluştu";
      message.error(errorMessage);
      console.error("Error deactivating user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Client Handlers
  useEffect(() => {
    const timer = setTimeout(() => {
      setClientSearchText(clientSearchTerm);
      setClientPagination(prev => ({ ...prev, current: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [clientSearchTerm]);

  useEffect(() => {
    fetchClients();
  }, [clientPagination.current, clientPagination.pageSize, clientSearchText]);

  const fetchClients = async () => {
    try {
      setClientLoading(true);
      const response = await GetClients({
        query: {
          search: clientSearchText,
          page: clientPagination.current,
          pageSize: clientPagination.pageSize,
          sortBy: "id",
          sortDesc: false,
        },
      });


      setClients(response.data || []);
      setClientPagination(prev => ({
        ...prev,
        total: response.totalRecords || 0,
      }));
    } catch (error) {
      message.error("Müşteriler yüklenirken bir hata oluştu");
      console.error("Error fetching clients:", error);
    } finally {
      setClientLoading(false);
    }
  };

  const handleCreateOrUpdateClient = async (values: CreateClientPayload) => {
    try {
      setClientLoading(true);

      if (editingClient) {
        await updateClient(editingClient.id, values);
        message.success("Müşteri başarıyla güncellendi");
      } else {
        await createClient(values);
        message.success("Müşteri başarıyla eklendi");
      }

      setIsClientModalVisible(false);
      clientForm.resetFields();
      setEditingClient(null);
      fetchClients();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "İşlem sırasında bir hata oluştu";
      message.error(errorMessage);
    } finally {
      setClientLoading(false);
    }
  };

  const handleEditClientClick = (client: ClientDto) => {
    setEditingClient(client);
    clientForm.setFieldsValue({
      name: client.name,
    });
    setIsClientModalVisible(true);
  };

  const handleDeleteClient = async (id: number) => {
    try {
      setClientLoading(true);
      await deleteClient(id);
      message.success("Müşteri başarıyla silindi");
      fetchClients();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Müşteri silinirken bir hata oluştu";
      message.error(errorMessage);
    } finally {
      setClientLoading(false);
    }
  };

  // Machine Handlers
  useEffect(() => {
    const timer = setTimeout(() => {
      setMachineSearchText(machineSearchTerm);
      setMachinePagination(prev => ({ ...prev, current: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [machineSearchTerm]);

  useEffect(() => {
    fetchMachines();
  }, [machinePagination.current, machinePagination.pageSize, machineSearchText, machineSortBy, machineSortDesc]);

  const fetchMachines = useCallback(async () => {
    try {
      setMachineLoading(true);
      const result = await GetMachines({
        query: {
          Search: machineSearchText,
          Page: machinePagination.current,
          PageSize: machinePagination.pageSize,
          SortBy: machineSortBy,
          SortDesc: machineSortDesc
        }
      });
      setMachines(result.data || []);
      setMachinePagination((prev) => ({
        ...prev,
        total: result.totalRecords,
      }));
    } catch (error) {
      message.error("Makineler yüklenirken hata oluştu");
    } finally {
      setMachineLoading(false);
    }
  }, [machineSearchText, machinePagination.current, machinePagination.pageSize, machineSortBy, machineSortDesc]);

  const handleCreateOrUpdateMachine = async (values: any) => {
    try {
      setMachineLoading(true);

      const payload = {
        ...values,
        purchaseDate: values.purchaseDate ? toMillis(values.purchaseDate) : undefined,
      };

      if (editingMachine) {
        await updateMachine(editingMachine.id, payload);
        message.success("Makine başarıyla güncellendi");
      } else {
        await createMachine(payload);
        message.success("Makine başarıyla eklendi");
      }

      setIsMachineModalVisible(false);
      machineForm.resetFields();
      setEditingMachine(null);
      fetchMachines();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "İşlem sırasında bir hata oluştu";
      message.error(errorMessage);
    } finally {
      setMachineLoading(false);
    }
  };

  const handleViewMachineClick = () => {
    if (!selectedMachineId) return;
    const machine = machines.find(m => m.id === selectedMachineId);
    if (machine) {
      setEditingMachine(machine);
      setMachineModalMode('view');
      machineForm.setFieldsValue({
        ...machine,
        purchaseDate: fromMillis(machine.purchaseDate),
      });
      setIsMachineModalVisible(true);
    }
  };

  const handleEditMachineClick = () => {
    if (!selectedMachineId) return;
    const machine = machines.find(m => m.id === selectedMachineId);
    if (machine) {
      setEditingMachine(machine);
      setMachineModalMode('edit');
      machineForm.setFieldsValue({
        ...machine,
        purchaseDate: fromMillis(machine.purchaseDate),
      });
      setIsMachineModalVisible(true);
    }
  };

  const handleMachineResize =
    (index: number) =>
      (_: any, { size }: { size: { width: number; height: number } }) => {
        setMachineColumns((prev) => {
          const next = [...prev];
          next[index] = {
            ...next[index],
            width: size.width,
          };
          return next;
        });
      };

  const handleMachineSort = (dataIndex: string) => {
    if (machineSortBy === dataIndex) {
      if (machineSortDesc) {
        setMachineSortBy(null);
        setMachineSortDesc(false);
      } else {
        setMachineSortDesc(true);
      }
    } else {
      setMachineSortBy(dataIndex);
      setMachineSortDesc(false);
    }
  };

  const MachineSortableHeader = ({ title, dataIndex }: { title: string; dataIndex: string }) => {
    const isActive = machineSortBy === dataIndex;
    const currentOrder = isActive ? (machineSortDesc ? "descend" : "ascend") : null;

    return (
      <div
        onClick={() => handleMachineSort(dataIndex)}
        style={{ display: "flex", alignItems: "center", cursor: "pointer", height: '100%' }}
      >
        <span style={{ flex: 1 }}>{title}</span>
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 8 }}>
          <CaretUpOutlined
            style={{ fontSize: 11, color: currentOrder === "ascend" ? "#1890ff" : "#bfbfbf" }}
          />
          <CaretDownOutlined
            style={{ fontSize: 11, color: currentOrder === "descend" ? "#1890ff" : "#bfbfbf" }}
          />
        </div>
      </div>
    );
  };

  const machineTableColumns = machineColumns.map((col, index) => ({
    ...col,
    title: col.sorter ? <MachineSortableHeader title={col.title} dataIndex={col.dataIndex} /> : col.title,
    sorter: false,
    onHeaderCell: (column: any) => ({
      width: column.width,
      onResize: handleMachineResize(index),
    }),
  }));

  const handleDeleteMachineClick = () => {
    if (!selectedMachineId) return;
    const machine = machines.find(m => m.id === selectedMachineId);
    if (machine) {
      setMachineToDelete(machine);
      setDeleteMachineModalVisible(true);
    }
  };

  const confirmDeleteMachine = async () => {
    if (!machineToDelete) return;

    try {
      setMachineLoading(true);
      await deleteMachine(machineToDelete.id);
      message.success("Makine başarıyla silindi");
      setDeleteMachineModalVisible(false);
      setSelectedMachineId(null);
      fetchMachines();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Makine silinirken bir hata oluştu";
      message.error(errorMessage);
    } finally {
      setMachineLoading(false);
      setMachineToDelete(null);
    }
  };



  const handleDeleteReport = async (id: number) => {
    try {
      setReportsLoading(true);
      await deleteReport(id);
      message.success("Rapor başarıyla silindi");
      fetchReports();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Rapor silinirken bir hata oluştu";
      message.error(errorMessage);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleCreateReport = async (values: any) => {
    try {
      setReportsLoading(true);

      let filters: Record<string, any> = {};

      if (values.type === "ProjectTimeLatency") {
        filters = {
          Code: values.code || undefined,
          Title: values.title || undefined,
          PlannedStartDate: toMillis(values.plannedStartDate) ?? undefined,
          PlannedDeadLine: toMillis(values.plannedDeadline) ?? undefined,
          StartedAt: values.startedAt ? toMillis(values.startedAt) : undefined,
          EndAt: values.endAt ? toMillis(values.endAt) : undefined,
          PlannedHours: values.plannedHours || undefined,
          Status: values.status || undefined,
          Priority: values.priority || undefined,
          LabelIds: values.labelIds && values.labelIds.length > 0
            ? values.labelIds.map((id: string) => parseInt(id, 10))
            : undefined,
        };
      } else if (values.type === "TaskReport" || values.type === "EffortAndCapacityReport") {
        filters = {
          Code: values.code || undefined,
          Title: values.title || undefined,
          Description: values.description || undefined,
          ProjectId: values.projectId || undefined,
          Status: values.status || undefined,
          PlannedHoursMin: values.plannedHoursMin || undefined,
          PlannedHoursMax: values.plannedHoursMax || undefined,
          CreatedAtMin: values.createdAtMin ? values.createdAtMin.valueOf() : undefined,
          CreatedAtMax: values.createdAtMax ? values.createdAtMax.valueOf() : undefined,
          LabelIds: values.labelIds && values.labelIds.length > 0
            ? values.labelIds.map((id: string) => parseInt(id, 10))
            : undefined,
        };
      } else if (values.type === "TeamPerformanceReport") {
        filters = {
          Search: values.userSearch || undefined,
          IsActive: values.userIsActive,
        };
      }

      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== undefined && value !== null && value !== ""
        )
      );

      const payload: CreateReportPayload = {
        type: values.type,
        name: values.name,
        filters: cleanedFilters,
      };

      await createReport(payload);
      message.success("Rapor başarıyla oluşturuldu");
      setIsReportModalVisible(false);
      reportForm.resetFields();
      setSelectedReportType(null);
      fetchReports();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Rapor oluşturulurken bir hata oluştu";
      message.error(errorMessage);
      console.error("Error creating report:", error);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "İsim",
      dataIndex: "name",
      key: "name",
      render: (name: string | null) => name || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string | null) => email || "-",
    },
    {
      title: "Saatlik Ücret",
      dataIndex: "hourlyRate",
      key: "hourlyRate",
      render: (val: number | undefined, record: UserDto) => val != null ? `${val} ${record.currency || 'TL'}` : "-",
    },
    {
      title: "Durum",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Aktif" : "Pasif"}
        </Tag>
      ),
    },
    {
      title: "Kapasite %",
      dataIndex: "capacityPercent",
      key: "capacityPercent",
      render: (val: number | undefined) => val != null ? `%${val}` : "-",
    },
    {
      title: (
        <div className="flex flex-col">
          <span>Müsait Saat</span>
          <span className="text-xs font-normal text-gray-500">(önümüzdeki bir ay için)</span>
        </div>
      ),
      dataIndex: "availableWorkHoursForOneMonth",
      key: "availableWorkHoursForOneMonth",
      render: (val: number | undefined) => val != null ? val : "-",
    },
    {
      title: (
        <div className="flex flex-col">
          <span>Dolu Saat</span>
          <span className="text-xs font-normal text-gray-500">(önümüzdeki bir ay için)</span>
        </div>
      ),
      dataIndex: "allocatedWorkHoursForOneMonth",
      key: "allocatedWorkHoursForOneMonth",
      render: (val: number | undefined) => val != null ? val : "-",
    },
    {
      title: "Aktif Görevler",
      dataIndex: "activeTasksCount",
      key: "activeTasksCount",
      render: (val: number | undefined) => val != null ? val : "-",
    },
    {
      title: "Yapılacak Görevler",
      dataIndex: "todoTasksCount",
      key: "todoTasksCount",
      render: (val: number | undefined) => val != null ? val : "-",
    },
    {
      title: "İşlemler",
      key: "actions",
      width: 120,
      render: (_: any, record: UserDto) => (
        <Space size="small">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteClick(record)}
          />
          <Popconfirm
            title="Kullanıcıyı Pasife Al"
            description="Bu kullanıcıyı pasife almak istediğinizden emin misiniz?"
            onConfirm={() => handleDeactivateUser(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button
              type="text"
              icon={<StopOutlined />}
              size="small"
              className="text-orange-500 hover:text-orange-600"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden p-6">
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Kullanıcı Yönetimi" key="1">
          <Card
            title={
              <div className="flex items-center justify-between">
                <Space>
                  <Select
                    value={isActiveFilter}
                    onChange={(value) => {
                      setIsActiveFilter(value);
                      setPagination(prev => ({ ...prev, current: 1 }));
                    }}
                    style={{ width: 150 }}
                    options={[
                      { label: "Aktif Kullanıcılar", value: true },
                      { label: "Pasif Kullanıcılar", value: false },
                      { label: "Tüm Kullanıcılar", value: null },
                    ]}
                  />
                  <Input.Search
                    placeholder="İsim veya email ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={(value) => {
                      setSearchTerm(value);
                      setSearchText(value);
                      setPagination(prev => ({ ...prev, current: 1 }));
                    }}
                    style={{ width: 250 }}
                    allowClear
                  />
                </Space>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchUsers()}
                    loading={loading}
                  >
                    Yenile
                  </Button>
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => setIsModalVisible(true)}
                  >
                    Yeni Kullanıcı Ekle
                  </Button>
                </Space>
              </div>
            }
            bordered={false}
            className="flex-1 flex flex-col"
          >
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} kullanıcı`,
              }}
              onChange={handleTableChange}
              scroll={{ y: "calc(100vh - 300px)" }}
            />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Rapor Yönetimi" key="2">
          <Card
            title={
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold">Rapor Yönetimi</span>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchReports()}
                    loading={reportsLoading}
                  >
                    Yenile
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsReportModalVisible(true)}
                  >
                    Yeni Rapor Oluştur
                  </Button>
                </Space>
              </div>
            }
            bordered={false}
            className="flex-1 flex flex-col"
          >
            <Table
              columns={[
                {
                  title: "ID",
                  dataIndex: "id",
                  key: "id",
                  width: 80,
                },
                {
                  title: "Tür",
                  dataIndex: "type",
                  key: "type",
                  render: (type: string) => REPORT_TYPE_LABELS[type] || type,
                },
                {
                  title: "İsim",
                  dataIndex: "name",
                  key: "name",
                },
                {
                  title: "Oluşturulma Tarihi",
                  dataIndex: "createdAt",
                  key: "createdAt",
                  render: (createdAt: string) => fromMillis(createdAt)?.format("DD.MM.YYYY - HH:mm") || "-",
                },
                {
                  title: "Dosya",
                  key: "file",
                  render: (_: any, record: Report) => {
                    if (!record.file) return null;
                    const baseUrl = import.meta.env.VITE_APP_API_URL || "";
                    const fileUrl = `${baseUrl}${record.file}`;
                    return (
                      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button icon={<DownloadOutlined />} type="link">
                          İndir
                        </Button>
                      </a>
                    );
                  },
                },
                {
                  title: "İşlemler",
                  key: "actions",
                  width: 100,
                  render: (_: any, record: Report) => (
                    <Popconfirm
                      title="Raporu Sil"
                      description="Bu raporu silmek istediğinizden emin misiniz?"
                      onConfirm={() => handleDeleteReport(record.id)}
                      okText="Evet"
                      cancelText="Hayır"
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                      />
                    </Popconfirm>
                  ),
                },
              ]}
              dataSource={reports}
              rowKey="id"
              loading={reportsLoading}
              pagination={false}
            />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Müşteri Yönetimi" key="3">
          <Card
            title={
              <div className="flex items-center justify-between">
                <Space>
                  <Input.Search
                    placeholder="Müşteri ismi ara..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    onSearch={(value) => {
                      setClientSearchTerm(value);
                      setClientSearchText(value);
                      setClientPagination(prev => ({ ...prev, current: 1 }));
                    }}
                    style={{ width: 250 }}
                    allowClear
                  />
                </Space>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchClients()}
                    loading={clientLoading}
                  >
                    Yenile
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingClient(null);
                      clientForm.resetFields();
                      setIsClientModalVisible(true);
                    }}
                  >
                    Yeni Müşteri Ekle
                  </Button>
                </Space>
              </div>
            }
            bordered={false}
            className="flex-1 flex flex-col"
          >
            <Table
              columns={[
                {
                  title: "ID",
                  dataIndex: "id",
                  key: "id",
                  width: 80,
                },
                {
                  title: "İsim",
                  dataIndex: "name",
                  key: "name",
                },
                {
                  title: "İşlemler",
                  key: "actions",
                  width: 120,
                  render: (_: any, record: ClientDto) => (
                    <Space size="small">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditClientClick(record)}
                        className="text-blue-500 hover:text-blue-600"
                      />
                      <Popconfirm
                        title="Müşteriyi Sil"
                        description="Bu müşteriyi silmek istediğinizden emin misiniz?"
                        onConfirm={() => handleDeleteClient(record.id)}
                        okText="Evet"
                        cancelText="Hayır"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                        />
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
              dataSource={clients}
              rowKey="id"
              loading={clientLoading}
              pagination={{
                ...clientPagination,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} müşteri`,
                onChange: (page, pageSize) => setClientPagination(prev => ({ ...prev, current: page, pageSize })),
              }}
              scroll={{ y: "calc(100vh - 300px)" }}
            />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Makine Yönetimi" key="4">
          <div className="flex flex-col gap-4">
            <Card bordered={false} className="flex-1 flex flex-col" bodyStyle={{ padding: 0 }}>
              <div className="flex items-center justify-between p-4 ">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-lg text-gray-700">Makineler</span>
                  <Divider type="vertical" className="h-6 bg-gray-300 mx-0" />
                  <Space>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingMachine(null);
                        setMachineModalMode('create');
                        machineForm.resetFields();
                        setIsMachineModalVisible(true);
                      }}
                    />
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      disabled={!selectedMachineId}
                      onClick={handleEditMachineClick}
                    />
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      disabled={!selectedMachineId}
                      onClick={handleViewMachineClick}
                    />
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      disabled={!selectedMachineId}
                      onClick={handleDeleteMachineClick}
                    />
                  </Space>
                </div>

                <Space>
                  <Input.Search
                    placeholder="Makine ara..."
                    value={machineSearchTerm}
                    onChange={(e) => setMachineSearchTerm(e.target.value)}
                    onSearch={(value) => {
                      setMachineSearchTerm(value);
                      setMachineSearchText(value);
                      setMachinePagination(prev => ({ ...prev, current: 1 }));
                    }}
                    style={{ width: 250 }}
                    allowClear
                  />
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchMachines()}
                    loading={machineLoading}
                  >
                    Yenile
                  </Button>
                </Space>
              </div>
              <Table
                components={{
                  header: {
                    cell: ResizableTitle,
                  },
                }}
                bordered
                onRow={(record) => ({
                  onClick: () => setSelectedMachineId(record.id),
                  className: `cursor-pointer ${selectedMachineId === record.id ? 'bg-blue-50' : ''}`,
                })}
                columns={machineTableColumns}
                dataSource={machines}
                rowKey="id"
                loading={machineLoading}
                pagination={{
                  ...machinePagination,
                  showSizeChanger: true,
                  showTotal: (total) => `Toplam ${total} makine`,
                  onChange: (page, pageSize) => setMachinePagination(prev => ({ ...prev, current: page, pageSize })),
                }}
                scroll={{ y: "calc(100vh - 350px)" }}
              />
            </Card>
          </div>
        </Tabs.TabPane>

      </Tabs>

      <Modal
        title="Yeni Kullanıcı Ekle"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateUser}
          autoComplete="off"
        >
          <Form.Item
            label="İsim"
            name="name"
            rules={[
              { required: true, message: "Lütfen isim giriniz" },
              { min: 2, message: "İsim en az 2 karakter olmalıdır" },
            ]}
          >
            <Input placeholder="Kullanıcı adını giriniz" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Lütfen email giriniz" },
              { type: "email", message: "Geçerli bir email adresi giriniz" },
            ]}
          >
            <Input placeholder="ornek@email.com" />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Ekle
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Yeni Rapor Oluştur"
        open={isReportModalVisible}
        onCancel={() => {
          setIsReportModalVisible(false);
          reportForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={reportForm}
          layout="vertical"
          onFinish={handleCreateReport}
          autoComplete="off"
        >
          <Form.Item
            label="Rapor Türü"
            name="type"
            rules={[{ required: true, message: "Lütfen rapor türünü seçiniz" }]}
          >
            <Select
              placeholder="Rapor türünü seçiniz"
              onChange={(value) => setSelectedReportType(value)}
            >
              {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Rapor Adı"
            name="name"
            rules={[{ required: true, message: "Lütfen rapor adını giriniz" }]}
          >
            <Input placeholder="Rapor adını giriniz" />
          </Form.Item>

          {/* Project Time Latency Filters */}
          {selectedReportType === "ProjectTimeLatency" && (
            <div className="border-t pt-4 mt-4">
              <h3 className="mb-4 font-semibold text-gray-700">Filtreler</h3>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item label="Kod" name="code">
                  <Input placeholder="Kod" />
                </Form.Item>
                <Form.Item label="Başlık" name="title">
                  <Input placeholder="Başlık" />
                </Form.Item>
                <Form.Item label="Etiketler" name="labelIds">
                  <MultiSelectSearch
                    placeholder="Etiket ara..."
                    apiUrl="/Label"
                  />
                </Form.Item>
                <Form.Item label="Durum" name="status">
                  <Select
                    placeholder="Durum seçin"
                    allowClear
                    options={projectStatusOptions}
                  />
                </Form.Item>
                <Form.Item label="Öncelik" name="priority">
                  <Select
                    placeholder="Öncelik seçin"
                    allowClear
                    options={projectPriorityOptions}
                  />
                </Form.Item>
                <Form.Item label="Planlanan Başlangıç" name="plannedStartDate">
                  <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
                </Form.Item>
                <Form.Item label="Planlanan Bitiş" name="plannedDeadline">
                  <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
                </Form.Item>
                <Form.Item label="Gerçekleşen Başlangıç" name="startedAt">
                  <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
                </Form.Item>
                <Form.Item label="Gerçekleşen Bitiş" name="endAt">
                  <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
                </Form.Item>
                <Form.Item label="Planlanan Saat" name="plannedHours">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </div>
            </div>
          )}

          {/* Task Report & Effort Capacity Filters */}
          {(selectedReportType === "TaskReport" || selectedReportType === "EffortAndCapacityReport") && (
            <div className="border-t pt-4 mt-4">
              <h3 className="mb-4 font-semibold text-gray-700">Filtreler</h3>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item label="Kod" name="code">
                  <Input placeholder="Kod" />
                </Form.Item>
                <Form.Item label="Başlık" name="title">
                  <Input placeholder="Başlık" />
                </Form.Item>
                <Form.Item label="Açıklama" name="description">
                  <Input placeholder="Açıklama" />
                </Form.Item>
                <Form.Item label="Etiketler" name="labelIds">
                  <MultiSelectSearch
                    placeholder="Etiket ara..."
                    apiUrl="/Label"
                  />
                </Form.Item>
                <Form.Item label="Durum" name="status">
                  <Select
                    placeholder="Durum seçin"
                    allowClear
                    options={taskStatusOptions}
                  />
                </Form.Item>

                <Form.Item label="Proje" name="projectId">
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

                <Form.Item label="Plan. Saat (Min)" name="plannedHoursMin">
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
                <Form.Item label="Plan. Saat (Max)" name="plannedHoursMax">
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>

                <Form.Item label="Oluşturulma (Min)" name="createdAtMin">
                  <DatePicker showTime style={{ width: "100%" }} format="DD-MM-YYYY HH:mm" />
                </Form.Item>
                <Form.Item label="Oluşturulma (Max)" name="createdAtMax">
                  <DatePicker showTime style={{ width: "100%" }} format="DD-MM-YYYY HH:mm" />
                </Form.Item>
              </div>
            </div>
          )}

          {/* Team Performance Report Filters */}
          {selectedReportType === "TeamPerformanceReport" && (
            <div className="border-t pt-4 mt-4">
              <h3 className="mb-4 font-semibold text-gray-700">Filtreler</h3>
              <div className="grid grid-cols-1 gap-4">
                <Form.Item label="Kullanıcı Durumu" name="userIsActive" initialValue={true}>
                  <Select
                    options={[
                      { label: "Aktif Kullanıcılar", value: true },
                      { label: "Pasif Kullanıcılar", value: false },
                      { label: "Tüm Kullanıcılar", value: null },
                    ]}
                  />
                </Form.Item>
                <Form.Item label="Arama" name="userSearch">
                  <Input placeholder="İsim veya email ara..." />
                </Form.Item>
              </div>
            </div>
          )}



          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button
                onClick={() => {
                  setIsReportModalVisible(false);
                  reportForm.resetFields();
                }}
              >
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={reportsLoading}>
                Oluştur
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Kullanıcıyı Sil"
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setUserToDelete(null);
          setDeleteConfirmationText("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setDeleteModalVisible(false);
              setUserToDelete(null);
              setDeleteConfirmationText("");
            }}
          >
            İptal
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={loading}
            onClick={confirmDelete}
            disabled={userToDelete?.name !== deleteConfirmationText}
          >
            Sil
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-4">
          <div className="bg-red-50 p-4 rounded-md border border-red-100 text-red-600">
            <p className="font-medium">Dikkat: Bu işlem geri alınamaz!</p>
            <p className="text-sm mt-1 select-none">
              <b className="select-none">{userToDelete?.name}</b> isimli kullanıcıyı silmek üzeresiniz.
            </p>
          </div>
          <div>
            <p className="mb-2 text-gray-600 select-none">
              Onaylamak için lütfen kullanıcının adını <b className="select-none">{userToDelete?.name}</b> yazınız:
            </p>
            <Input
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder={userToDelete?.name || ""}
              status={
                deleteConfirmationText && deleteConfirmationText !== userToDelete?.name
                  ? "error"
                  : ""
              }
            />
          </div>
        </div>
      </Modal>

      <Modal
        title={editingClient ? "Müşteri Düzenle" : "Yeni Müşteri Ekle"}
        open={isClientModalVisible}
        onCancel={() => {
          setIsClientModalVisible(false);
          clientForm.resetFields();
          setEditingClient(null);
        }}
        footer={null}
        width={500}
      >
        <Form
          form={clientForm}
          layout="vertical"
          onFinish={handleCreateOrUpdateClient}
          autoComplete="off"
        >
          <Form.Item
            label="İsim"
            name="name"
            rules={[
              { required: true, message: "Lütfen isim giriniz" },
              { min: 2, message: "İsim en az 2 karakter olmalıdır" },
            ]}
          >
            <Input placeholder="Müşteri adını giriniz" />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button
                onClick={() => {
                  setIsClientModalVisible(false);
                  clientForm.resetFields();
                  setEditingClient(null);
                }}
              >
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={clientLoading}>
                {editingClient ? "Güncelle" : "Ekle"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={machineModalMode === 'view' ? "Makine Detayları" : (editingMachine ? "Makine Düzenle" : "Yeni Makine Ekle")}
        open={isMachineModalVisible}
        onCancel={() => {
          setIsMachineModalVisible(false);
          machineForm.resetFields();
          setEditingMachine(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={machineForm}
          layout="vertical"
          onFinish={handleCreateOrUpdateMachine}
          autoComplete="off"
          disabled={machineModalMode === 'view'}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="İsim"
              name="name"
              rules={[{ required: true, message: "Lütfen isim giriniz" }]}
            >
              <Input placeholder="Makine ismi" />
            </Form.Item>
            <Form.Item label="Kategori" name="category">
              <Input placeholder="Kategori" />
            </Form.Item>
            <Form.Item label="Marka" name="brand">
              <Input placeholder="Marka" />
            </Form.Item>
            <Form.Item label="Model" name="model">
              <Input placeholder="Model" />
            </Form.Item>
            <Form.Item label="Saatlik Maliyet" name="hourlyCost">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item label="Varsayılan Ömür" name="usefulLife">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item label="Para Birimi" name="currency">
              <Select options={[{ label: 'TL', value: 'TL' }, { label: 'USD', value: 'USD' }, { label: 'EUR', value: 'EUR' }]} />
            </Form.Item>
            <Form.Item label="Satın Alma Fiyatı" name="purchasePrice">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item label="Satın Alma Tarihi" name="purchaseDate">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Durumu" name="status">
              <Select options={[
                { label: 'Müsait', value: 'Available' },
                { label: 'Kullanımda', value: 'InUse' },
                { label: 'Servis Dışı', value: 'OutOfService' },
                { label: 'Bakımda', value: 'Maintenance' }
              ]} />
            </Form.Item>
            <Form.Item label="Aktif mi?" name="isActive" valuePropName="checked" initialValue={true}>
              {/* Simplified Checkbox since Switch is not imported yet, or I can use Checkbox from Antd */}
              <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" disabled={machineModalMode === 'view'} />
            </Form.Item>
          </div>

          {machineModalMode !== 'view' && (
            <Form.Item className="mb-0 flex justify-end">
              <Space>
                <Button
                  onClick={() => {
                    setIsMachineModalVisible(false);
                    machineForm.resetFields();
                    setEditingMachine(null);
                  }}
                >
                  İptal
                </Button>
                <Button type="primary" htmlType="submit" loading={machineLoading}>
                  {editingMachine ? "Güncelle" : "Ekle"}
                </Button>
              </Space>
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-[#faad14] text-lg" />
            <span>Makine Silme Onayı</span>
          </div>
        }
        open={deleteMachineModalVisible}
        onCancel={() => {
          setDeleteMachineModalVisible(false);
          setMachineToDelete(null);
        }}
        okText="Evet, Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true, loading: machineLoading }}
        onOk={confirmDeleteMachine}
        centered
      >
        <div className="p-4">
          <p className="text-lg mb-2">
            <strong>"{machineToDelete?.name}"</strong> makinesini silmek istediğinizden emin misiniz?
          </p>
          <p className="text-gray-500 mb-0">
            Bu işlem geri alınamaz.
          </p>
        </div>
      </Modal>

    </div>
  );
}
