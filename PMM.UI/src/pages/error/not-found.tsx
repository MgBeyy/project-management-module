import { ConfigProvider, Button, theme } from "antd";
import { HomeOutlined } from "@ant-design/icons";

export default function NotFoundPage() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm, // light theme
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 8,
        },
      }}
    >
      <div className="min-h-screen grid place-items-center bg-white p-6">
        <div className="text-center">
          <h1 className="text-7xl font-extrabold tracking-tight text-gray-900">404</h1>
          <p className="mt-2 text-gray-500">Aradığınız sayfa bulunamadı.</p>
          <div className="mt-6">
            <Button type="primary" size="large" icon={<HomeOutlined />} href="/">
              Ana sayfaya dön
            </Button>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
