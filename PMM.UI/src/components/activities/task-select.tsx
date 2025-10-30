import { Select, Spin } from "antd";
import { useCallback, useEffect, useState } from "react";
import { GetTasks } from "../../services/tasks/get-tasks";

interface TaskSelectProps {
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  assignedUserId?: number | null;
  disabled?: boolean;
}

export default function TaskSelect({
  value,
  onChange,
  placeholder = "örev seçin...",
  style,
  assignedUserId,
  disabled = false,
}: TaskSelectProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTasks = useCallback(
    async (search?: string, userId?: number | null) => {
      if (!userId) {
        setTasks([]);
        return;
      }

      try {
        setLoading(true);
        const response = await GetTasks({
          query: {
            page: 1,
            pageSize: 50,
            search: search || undefined,
            assignedUserId: userId,
          },
        });

        const result = response;
        const taskData = result.data || [];

        const formattedTasks = taskData.map((task: any) => {
          const taskCode = task?.code;
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
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!assignedUserId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    if (searchTerm.length >= 2 || searchTerm.length === 0) {
      fetchTasks(searchTerm, assignedUserId);
    }
  }, [assignedUserId, searchTerm, fetchTasks]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
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
      disabled={disabled}
      notFoundContent={
        disabled ? (
          "Önce kullanıcı seçiniz"
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "8px" }}>
            <Spin size="small" />
          </div>
        ) : (
          "örev bulunamadı"
        )
      }
      options={tasks}
      allowClear
    />
  );
}
