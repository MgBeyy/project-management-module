import { Tabs, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { DetailedProjectDto, ProjectHierarchyDto } from '@/types';
import { getProjectById } from '@/services/projects/get-project-by-code';
import { useParams } from 'react-router-dom';
import { ProjectHeader } from '@/components/projects/project-details/project-header';
import { TasksStatusCard } from '@/components/projects/project-details/tasks-card';
import { ProjectHierarchyTree } from '@/components/projects/project-details/project-hierarchy';
import ProjectOrganizationDiagram from '@/components/projects/project-details/project-organization-diagram';
import { getProjectHierarchy } from '@/services/projects/get-project-hierarchy';
import ProjectTeamCard from '@/components/projects/project-details/project-team';
import { ProjectTaskGantt } from '@/components/projects/project-details/gant-chart/gant-chart';
import { BurnUpChart } from '@/components/projects/project-details/charts/burn-up-chart';

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [projectData, setProjectData] = useState<DetailedProjectDto>();
  const [projectHierarchy, setProjectHierarchy] = useState<ProjectHierarchyDto>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchAllData = async () => {
    if (!id) {
      setError('Proje ID bulunamadı');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [projectResponse, hierarchyResponse] = await Promise.all([
        getProjectById(id),
        getProjectHierarchy(id)
      ]);

      setProjectData(projectResponse);
      setProjectHierarchy(hierarchyResponse);
      setError(null);
    } catch (err: any) {
      console.error('Veri yüklenirken hata:', err);
      setError(err?.message || 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-red-600">
            <h2 className="text-lg font-semibold">Hata</h2>
            <p>{error || 'Proje bulunamadı'}</p>
          </div>
        </div>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'overview',
      label: 'Genel Bakış',
      children: (
        <>
          <div className="space-y-6">
            <ProjectHeader projectData={projectData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sol kolon: Proje Ağacı ve Görevler */}
              <div className="lg:col-span-2 space-y-6">
                {/* Proje Hiyerarşi Ağacı */}
                <ProjectHierarchyTree
                  projectHierarchy={projectHierarchy as ProjectHierarchyDto}
                  currentProjectId={projectData.id}
                />

                <TasksStatusCard
                  title="Görevler Durumu"
                  tasks={projectData.tasks || []}
                  className="mb-6"
                  defaultCollapsed={true}
                />

                {/* BurnUp Grafiği */}
                <BurnUpChart data={projectData.burnUpChart || []} />
              </div>

              {/* Sağ kolon: Proje Detayları */}
              <div className="space-y-4">
                {/* Ekip */}
                <ProjectTeamCard
                  assignedUsers={projectData?.assignedUsers}
                />
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      key: 'organization',
      label: 'Organizasyon Şeması',
      children: (
        <div className="py-1">
          <ProjectOrganizationDiagram {...projectData} />
        </div>
      ),
    },
    {
      key: 'gant_chart',
      label: 'Gantt Şeması',
      children: (
        <div className="py-1">
          {projectHierarchy ? (
            <ProjectTaskGantt project={projectHierarchy} />
          ) : (
            <div className="text-center text-gray-500">Proje hiyerarşi verisi yükleniyor...</div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto">
        <Tabs
          defaultActiveKey="overview"
          tabBarGutter={16}
          items={tabItems}
          className='w-full'
        />
      </div>
    </div>
  );
}
