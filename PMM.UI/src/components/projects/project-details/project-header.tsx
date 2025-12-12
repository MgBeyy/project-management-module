import { DetailedProjectDto, LabelDto } from "@/types";
import { Progress, Tag } from "antd";
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from "dayjs";

export const ProjectHeader = ({ projectData }: { projectData: DetailedProjectDto }) => {

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 mb-6">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{projectData.code} - {projectData.title}</h1>
            <Tag color="blue" className="text-sm mr-0">{projectData.status}</Tag>
            <Tag color={projectData.priority === 'Regular' ? 'orange' : projectData.priority === 'High' ? 'red' : 'green'} className="text-sm">
              {projectData.priority}
            </Tag>
          </div>
          {projectData.labels && projectData.labels.length > 0 && (
            <div className="mb-2">
              {projectData.labels.map((label: LabelDto) => (
                <Tag key={label.id} color={label.color || "#1890ff"} className="text-xs">
                  {label.name}
                </Tag>
              ))}
            </div>
          )}
          {projectData.parentProjects && projectData.parentProjects.length > 0 && (
            <div className="mb-2">
              <span className="text-sm text-gray-500">Üst Proje: </span>
              <Tag color="purple" className="text-xs">{projectData.parentProjects[0].code} - {projectData.parentProjects[0].title}</Tag>
            </div>
          )}
          {projectData.startedAt && <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <CalendarOutlined />
              <span>{dayjs(projectData.startedAt).format("DD MMM YYYY")} - {projectData.endAt ? dayjs(projectData.endAt).format("DD MMM YYYY") : "Devam Ediyor"}</span>
            </div>
          </div>}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Completion Stat */}
          <div className="flex flex-col items-center justify-center bg-blue-50/50 rounded-2xl p-4 border border-blue-100 min-w-[120px]">
            <Progress
              type="circle"
              percent={Math.min(100, Math.round(((projectData.actualHours || 0) / (projectData.plannedHours || 1)) * 100))}
              size={60}
              strokeWidth={8}
              strokeColor="#2563eb"
              format={(percent) => (
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-blue-700">{percent}%</span>
                </div>
              )}
            />
            <span className="text-xs font-semibold text-blue-600 mt-2">Tamamlanma</span>
          </div>

          {/* Time Stats */}
          <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                  <span className="text-xs font-bold">P</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Planlanan</span>
                  <span className="text-sm font-bold text-slate-700">{projectData.plannedHours || 0}s</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <span className="text-xs font-bold">G</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Gerçekleşen</span>
                  <span className="text-sm font-bold text-slate-700">{projectData.actualHours || 0}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}