import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Card, Tabs, Select, Tag } from "antd";
import { UserAddOutlined, DeleteOutlined, ReloadOutlined, PlusOutlined, StopOutlined, DownloadOutlined } from "@ant-design/icons";
import { GetUsers, createUser, deleteUser, deactivateUser } from "@/services/user";
import { GetReports, createReport } from "@/services/reports";
import { UserDto, CreateUserPayload, Report, CreateReportPayload } from "@/types";
import { fromMillis } from "@/utils/retype";
import { showNotification } from "@/utils/notification";

const REPORT_TYPE_LABELS: Record<string, string> = {
  "ProjectTimeLatency": "Proje Süre Gecikmesi Raporu",
  "TaskReport": "Görev Raporu",
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

  const handleCreateReport = async (values: CreateReportPayload) => {
    try {
      setReportsLoading(true);
      await createReport(values);
      message.success("Rapor başarıyla oluşturuldu");
      setIsReportModalVisible(false);
      reportForm.resetFields();
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
            <Select placeholder="Rapor türünü seçiniz">
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

          <Form.Item
            label="Açıklama"
            name="description"
          >
            <Input.TextArea placeholder="Rapor açıklaması" />
          </Form.Item>

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
    </div>
  );
}
