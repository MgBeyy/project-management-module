import { Select, Spin } from "antd";
import { useState, useEffect } from "react";
import { GetTasks } from "../../services/tasks/get-tasks";

interface TaskSelectProps {
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function TaskSelect({
  value,
  onChange,
  placeholder = "Görev seçin...",
  style,
}: TaskSelectProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (search?: string) => {
    try {
      setLoading(true);
      const response = await GetTasks({
        query: {
          page: 1,
          pageSize: 50,
          Search: search || undefined,
        },
      });
      
      console.log("Tasks API response:", response);
      
      const result = response.result || response;
      const taskData = result.data || [];
      
      const formattedTasks = taskData.map((task: any) => {
        const taskCode = task?.code ?? task?.Code ?? "";
        const labelSuffix = taskCode ? `Kod: ${taskCode}` : `ID: ${task?.id}`;

        return {
          value: task.id,
          label: `${task.title} (${labelSuffix})`,
          title: task.title,
          id: task.id,
          code: taskCode,
          projectId: task.projectId,
        };
      });
      
      setTasks(formattedTasks);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    if (value.length >= 2 || value.length === 0) {
      fetchTasks(value);
    }
  };

  return (
    <Select
      showSearch
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      filterOption={false}
      onSearch={handleSearch}
      notFoundContent={
        loading ? (
          <div style={{ textAlign: "center", padding: "8px" }}>
            <Spin size="small" />
          </div>
        ) : (
          "Görev bulunamadı"
        )
      }
      options={tasks}
      allowClear
    />
  );
}
