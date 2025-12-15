import { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Card, Tabs, Select, Tag, DatePicker, InputNumber } from "antd";
import { UserAddOutlined, DeleteOutlined, ReloadOutlined, PlusOutlined, StopOutlined, DownloadOutlined } from "@ant-design/icons";
import { GetUsers, createUser, deleteUser, deactivateUser } from "@/services/user";
import { GetReports, createReport } from "@/services/reports";
import { GetClients, createClient, deleteClient, updateClient } from "@/services/clients";
import { UserDto, CreateUserPayload, Report, CreateReportPayload, ProjectDto, ClientDto, CreateClientPayload } from "@/types";
import { fromMillis, toMillis } from "@/utils/retype";
import { showNotification } from "@/utils/notification";
import { ProjectPriority, ProjectStatus } from "@/services/projects/get-projects";
import { TaskStatus } from "@/types/tasks/ui";
import MultiSelectSearch from "@/components/common/multi-select-search";
import getMultiSelectSearch from "@/services/projects/get-multi-select-search";
import type { SelectProps } from "antd";
import { EditOutlined } from "@ant-design/icons";



const REPORT_TYPE_LABELS: Record<string, string> = {
  "ProjectTimeLatency": "Proje Süre Gecikmesi Raporu",
  "TaskReport": "Görev Raporu",
  "EffortAndCapacityReport": "Efor ve Kapasite Raporu",
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

export const normalizeProjectOption = (project: ProjectDto): SelectOption | null => {
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

    </div>
  );
}
