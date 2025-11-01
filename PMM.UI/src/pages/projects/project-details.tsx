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

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [projectData, setProjectData] = useState<DetailedProjectDto>();
  const [projectHierarchy, setProjectHierarchy] = useState<ProjectHierarchyDto>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchProject = async () => {
    if (!id) {
      setError('Proje ID bulunamadı');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getProjectById(id);
      setProjectData(response);
      setError(null);
    } catch (err: any) {
      console.error('Proje yüklenirken hata:', err);
      setError(err?.message || 'Proje yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectHierarchy = async () => {
    if (!id) {
      setError('Proje ID bulunamadı');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await getProjectHierarchy(id);
      setProjectHierarchy(response);
      setError(null);
    } catch (err: any) {
      console.error('Proje yüklenirken hata:', err);
      setError(err?.message || 'Proje yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectHierarchy();
    fetchProject();
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
        <div className="max-w-7xl mx-auto">
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
                {projectData.childProjects && projectData.childProjects.length > 0 && (
                  <ProjectHierarchyTree
                    projectHierarchy={projectHierarchy as ProjectHierarchyDto}
                    currentProjectId={projectData.id}
                  />
                )}

                {projectData.tasks && projectData.tasks.length > 0 && (
                  <TasksStatusCard
                    title="Görevler Durumu"
                    tasks={projectData.tasks}
                    className="mb-6"
                    defaultCollapsed={true}
                  />
                )}

                {(!projectData.tasks || projectData.tasks.length === 0) &&
                  (!projectData.childProjects || projectData.childProjects.length === 0) && (
                    <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-gray-500">
                      <p>Bu projede henüz alt proje veya görev bulunmamaktadır.</p>
                    </div>
                  )}
              </div>

              {/* Sağ kolon: Proje Detayları */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Proje Bilgileri</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Kod:</span>
                      <span className="ml-2 font-medium">{projectData.code}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Durum:</span>
                      <span className="ml-2 font-medium">{projectData.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Öncelik:</span>
                      <span className="ml-2 font-medium">{projectData.priority}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Planlanan Saatler:</span>
                      <span className="ml-2 font-medium">{projectData.plannedHours || '-'} h</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Gerçekleşen Saatler:</span>
                      <span className="ml-2 font-medium">{projectData.actualHours || '-'} h</span>
                    </div>
                  </div>
                </div>
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
          <ProjectOrganizationDiagram project={projectData} />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <Tabs
          defaultActiveKey="overview"
          tabBarGutter={16}
          items={tabItems}
          className="project-details-tabs"
        />
      </div>
    </div>
  );
}
