import { DetailedProjectDto, LabelDto } from "@/types";
import { Progress, Tag } from "antd";
import {CalendarOutlined} from '@ant-design/icons';
import dayjs from "dayjs";

export const ProjectHeader = ({projectData}: {projectData: DetailedProjectDto}) => {

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-start justify-between">
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
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 mb-1">{50}%</div>
                <div className="w-24">
                  <Progress percent={50} showInfo={false} strokeColor="#2563eb" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Tamamlanma</p>
              </div>
            </div>
          </div>

    );
}