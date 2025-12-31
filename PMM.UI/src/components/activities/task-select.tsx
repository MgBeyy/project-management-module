import { Select, Spin } from "antd";
import { useCallback, useEffect, useState } from "react";
import { GetTasks } from "../../services/tasks/get-tasks";

// src/components/activities/task-select.tsx

interface TaskSelectProps {
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  assignedUserId?: number | null;
  disabled?: boolean;
  ignoreUserCheck?: boolean;
}

export default function TaskSelect({
  value,
  onChange,
  placeholder = "Görev seçin...",
  style,
  assignedUserId,
  disabled = false,
  ignoreUserCheck = false,
}: TaskSelectProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTasks = useCallback(
    async (search?: string, userId?: number | null) => {
      // If we are NOT ignoring user check and have no userId, don't fetch
      if (!ignoreUserCheck && !userId) {
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
            // Only pass assignedUserId if we are NOT ignoring the check (or if we are ignoring but still have a userId we want to use optionally? 
            // Usually if ignoreUserCheck is true we want all tasks, but maybe we can still filter if userId is provided.
            // But based on logic, if ignoreUserCheck is true, userId might be null.
            assignedUserId: userId || undefined,
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
    [ignoreUserCheck]
  );

  useEffect(() => {
    // If we rely on user check and no user, clear.
    if (!ignoreUserCheck && !assignedUserId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    if (searchTerm.length >= 2 || searchTerm.length === 0) {
      fetchTasks(searchTerm, assignedUserId);
    }
  }, [assignedUserId, searchTerm, fetchTasks, ignoreUserCheck]);

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
          "Görev bulunamadı"
        )
      }
      options={tasks}
      allowClear
    />
  );
}
