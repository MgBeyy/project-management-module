import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Card, Tabs, Select } from "antd";
import { UserAddOutlined, DeleteOutlined, ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import { GetUsers, createUser, deleteUser } from "@/services/user";
import { GetReports, createReport } from "@/services/reports";
import { UserDto, CreateUserPayload, Report, CreateReportPayload } from "@/types";
import { fromMillis } from "@/utils/retype";

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

  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportForm] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    fetchReports();
  }, []);

  const fetchUsers = async (searchText?: string) => {
    try {
      setLoading(true);
      const response = await GetUsers({
        query: {
          search: searchText || "",
          page: pagination.current,
          pageSize: pagination.pageSize,
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
      const response = await GetReports({});
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

  const handleDeleteUser = async (userId: number) => {
    try {
      setLoading(true);
      await deleteUser(userId);
      message.success("Kullanıcı başarıyla silindi");
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Kullanıcı silinirken bir hata oluştu";
      message.error(errorMessage);
      console.error("Error deleting user:", error);
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
      title: "İşlemler",
      key: "actions",
      width: 120,
      render: (_: any, record: UserDto) => (
        <Space size="small">
          <Popconfirm
            title="Kullanıcıyı Sil"
            description="Bu kullanıcıyı silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Evet"
            cancelText="Hayır"
            okButtonProps={{ danger: true }}
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
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden p-6">
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Kullanıcı Yönetimi" key="1">
          <Card
            title={
              <div className="flex items-center justify-between">
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
              <Select.Option value="Proje Raporu">Proje Raporu</Select.Option>
              <Select.Option value="Kullanıcı Raporu">Kullanıcı Raporu</Select.Option>
              <Select.Option value="Görev Raporu">Görev Raporu</Select.Option>
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
    </div>
  );
}
