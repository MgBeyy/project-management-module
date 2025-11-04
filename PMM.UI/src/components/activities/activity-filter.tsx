import { useTasksStore } from "@/store/zustand/tasks-store";
import { useEffect, useState } from "react";
import UserSelect from "./user-select";
import TaskSelect from "./task-select";
import { Button, Select, Spin } from "antd";
import { GetProjects } from "@/services/projects/get-projects";
import { ProjectDto, TaskDto } from "@/types";
import { GetTasks } from "@/services/tasks/get-tasks";



export const ActivityFilter: React.FC = () => {
  const { filters, setFilters } = useTasksStore();

  // Project Select State
  const [projectOptions, setProjectOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [projectLoading, setProjectLoading] = useState(false);

  // Task Select State
  const [taskOptions, setTaskOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [taskLoading, setTaskLoading] = useState(false);

  const handleProjectSearch = (value: string) => {
    setProjectLoading(true);
    GetProjects({ query: { search: value } }).then((response) => {
      const options = response.data.map((project: ProjectDto) => ({
        label: `${project.code} - ${project.title}`,
        value: project.id,
        code: project.code,
      }));
      setProjectOptions(options);
      setProjectLoading(false);
    }
    ).catch(() => {
      setProjectLoading(false);
    });
  };

  const handleTaskSearch = (value: string) => {
    setTaskLoading(true);
    GetTasks({ query: { search: value, projectId: filters.projectId || null } }).then((response) => {
      const options = response.data.map((task: TaskDto) => ({
        label: `${task.code} - ${task.title}`,
        value: task.id,
        code: task.code,
      }));
      setTaskOptions(options);
      setTaskLoading(false);
    }
    ).catch(() => {
      setTaskLoading(false);
    });
  };

  useEffect(() => {
    handleProjectSearch("");
    handleTaskSearch("");
  }, []);

  useEffect(() => {
    setFilters({ ...filters, taskId: null });
    handleTaskSearch("");
  }, [filters.projectId]);

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <Select
          showSearch
          placeholder="Proje seçin veya arayın..."
          options={projectOptions}
          loading={projectLoading}
          filterOption={false}
          onSearch={handleProjectSearch}
          allowClear
          onChange={(projectId) => {
            setFilters({ ...filters, projectId: projectId || null, taskId: null });
          }}
          size="middle"
          style={{ width: "100%"}}
          optionFilterProp="label"
          notFoundContent={
            projectLoading ? (
              <div className="flex justify-center items-center py-2">
                <Spin size="small" />
                <span className="ml-2">Projeler aranıyor...</span>
              </div>
            ) : (
              "Proje bulunamadı"
            )
          }
                  />
         <Select
          showSearch
          placeholder="Görev seçin veya arayın..."
          options={taskOptions}
          loading={taskLoading}
          filterOption={false}
          onSearch={handleTaskSearch}
          allowClear 
          value={filters.taskId ?? undefined}
          onChange={(taskId) => setFilters({ ...filters, taskId: taskId || null })}
          size="middle"
          style={{ width: "100%"}}
          optionFilterProp="label"
          notFoundContent={
            projectLoading ? (
              <div className="flex justify-center items-center py-2">
                <Spin size="small" />
                <span className="ml-2">Projeler aranıyor...</span>
              </div>
            ) : (
              "Proje bulunamadı"
            )
          }
        />
        <UserSelect
          value={filters.userId ?? undefined}
          onChange={(userId) => setFilters({ ...filters, userId: userId || null })}
          placeholder="Kullanıcı Seç"
          style={{ width: "100%"}}
        />
      <div>
        <Button onClick={() => setFilters({ projectId: null, taskId: null, userId: null })}>
          Filtreleri Temizle
        </Button>
      </div>
      </div>
    </div>
  );
}