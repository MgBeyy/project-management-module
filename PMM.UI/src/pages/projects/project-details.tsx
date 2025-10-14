import { Card, Descriptions, Button, Tag, Divider, Badge, Space } from "antd";
import { Link, useParams } from "react-router-dom";
import Spinner from "@/components/spinner";
import { useEffect, useState } from "react";
import { getProjectByCode, ProjectDetails } from "@/features/projects/services/get-project-by-code";
import { AiOutlineArrowLeft, AiOutlineCalendar, AiOutlineClockCircle, AiOutlineUser } from "react-icons/ai";
import { formatDateTime } from "@/helpers/utils";

export default function ProjectDetailsPage() {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        if (!code) {
          throw new Error("Geçersiz proje kodu");
        }
        const data = await getProjectByCode(code);
        if (mounted) {
          if (!data) {
            setError("Proje bulunamadı");
          }
          setProject(data);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || "Bilinmeyen hata");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, [code]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-4">
        <div className="mb-4">
          <Link to="/pm-module/projects">
            <Button type="dashed" icon={<AiOutlineArrowLeft />}>Projeler</Button>
          </Link>
        </div>
        <Card title={`Hata`}>{error || "Proje bulunamadı"}</Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      Active: "green",
      Inactive: "default",
      Completed: "blue",
      Planned: "orange",
    };
    return statusMap[status] || "default";
  };

  const getPriorityColor = (priority: string) => {
    const priorityMap: Record<string, string> = {
      High: "red",
      Medium: "orange",
      Low: "green",
    };
    return priorityMap[priority] || "default";
  };


  return (
    <div className="h-full w-full p-6 bg-gray-50">
      <div className="mb-4">
        <Link to="/pm-module/projects">
          <Button type="default" icon={<AiOutlineArrowLeft />} size="large">
            Projeler
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Header Card */}
        <Card className="shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {project.Title}
              </h1>
              <Space size="middle">
                <Tag color="blue" className="text-sm px-3 py-1">
                  {project.Code}
                </Tag>
                <Badge 
                  status={getStatusColor(project.Status) as any} 
                  text={project.Status} 
                />
                <Tag color={getPriorityColor(project.Priority)}>
                  {project.Priority} Öncelik
                </Tag>
              </Space>
            </div>
          </div>

          {/* Labels */}
          {project.Labels && project.Labels.length > 0 && (
            <div className="mt-4">
              <Divider orientation="left" style={{ margin: "16px 0" }}>
                Etiketler
              </Divider>
              <Space size={[8, 8]} wrap>
                {project.Labels.map((label) => (
                  <Tag
                    key={label.id}
                    color={label.color}
                    style={{
                      fontSize: "14px",
                      padding: "4px 12px",
                      borderRadius: "6px",
                    }}
                  >
                    {label.name}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </Card>

        {/* Main Details Card */}
        <Card title="Proje Bilgileri" className="shadow-md">
          <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size="middle">
            <Descriptions.Item label={<><AiOutlineCalendar className="inline mr-2" />Planlanan Başlangıç</>}>
              {project.PlannedStartDate || "-"}
            </Descriptions.Item>
            <Descriptions.Item label={<><AiOutlineCalendar className="inline mr-2" />Planlanan Bitiş</>}>
              {project.PlannedDeadLine || "-"}
            </Descriptions.Item>
            <Descriptions.Item label={<><AiOutlineClockCircle className="inline mr-2" />Planlanan Saat</>}>
              {project.PlannedHourse !== null ? `${project.PlannedHourse} saat` : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Başlangıç Zamanı">
              {formatDateTime(project.StartedAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Bitiş Zamanı">
              {formatDateTime(project.EndAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Müşteri ID">
              {project.ClientId || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Additional Info Card */}
        <Card title="Ek Bilgiler" className="shadow-md">
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Üst Proje ID'leri">
              {project.ParentProjectIds && project.ParentProjectIds.length > 0 ? (
                <Space size={[8, 8]} wrap>
                  {project.ParentProjectIds.map((id) => (
                    <Tag key={id} color="purple">
                      ID: {id}
                    </Tag>
                  ))}
                </Space>
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label={<><AiOutlineUser className="inline mr-2" />Oluşturan Kullanıcı ID</>}>
              {project.CreatedById}
            </Descriptions.Item>
            <Descriptions.Item label="Oluşturulma Tarihi">
              {formatDateTime(project.CreatedAt)}
            </Descriptions.Item>
            <Descriptions.Item label={<><AiOutlineUser className="inline mr-2" />Güncelleyen Kullanıcı ID</>}>
              {project.UpdatedById || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Güncellenme Tarihi">
              {formatDateTime(project.UpdatedAt)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
}
