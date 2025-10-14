import { Card, Descriptions, Button } from "antd";
import { Link, useParams } from "react-router-dom";
import Spinner from "@/components/spinner";
import { useEffect, useState } from "react";
import { getProjectByCode, ProjectDetails } from "@/features/projects/services/get-project-by-code";
import { AiOutlineArrowLeft } from "react-icons/ai";

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

  return (
    <div className="h-full w-full p-4">
      <div className="mb-4">
        <Link to="/pm-module/projects">
          <Button type="dashed" icon={<AiOutlineArrowLeft />}>Projeler</Button>
        </Link>
      </div>

      <Card title={`Proje Detayı • ${project.Code}`} className="shadow-sm">
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Kod">{project.Code}</Descriptions.Item>
          <Descriptions.Item label="Başlık">{project.Title}</Descriptions.Item>
          <Descriptions.Item label="Durum">{project.Status}</Descriptions.Item>
          <Descriptions.Item label="Öncelik">{project.Priority}</Descriptions.Item>
          <Descriptions.Item label="Planlanan Başlangıç">
            {project.PlannedStartDate || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Planlanan Bitiş">
            {project.PlannedDeadLine || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Planlanan Saat">
            {project.PlannedHourse} saat
          </Descriptions.Item>
          <Descriptions.Item label="Başlangıç Zamanı">
            {project.StartedAt || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Bitiş Zamanı">
            {project.EndAt || "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
