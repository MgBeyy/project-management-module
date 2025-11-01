import React, { useMemo, useState } from "react";
import { Tag, Progress, Input, Tooltip } from "antd";
import { ProjectOutlined, UserOutlined, TagsOutlined, SearchOutlined } from "@ant-design/icons";
import { TaskDto } from "@/types";

const statusColor = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s.includes("active") || s.includes("inprogress") || s.includes("progress")) return "blue";
  if (s.includes("done") || s.includes("completed")) return "green";
  if (s.includes("blocked") || s.includes("onhold")) return "orange";
  return "default";
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

const computeProgress = (task: TaskDto): number => {
  const planned = task.plannedHours ?? 0;
  const actual = task.actualHours ?? 0;

  if (planned > 0) {
    return clamp((actual / planned) * 100);
  }

  return 0;
};
const statusLabelTR = (status?: string) => {
  if (!status) return "Durum yok";
  const s = status.toLowerCase().replace(/\s|_/g, "");
  switch (s) {
    case "todo":
      return "Yapılacak";
    case "inactive":
      return "Pasif";
    case "active":
      return "Aktif";
    case "inprogress":
    case "progress":
      return "Devam ediyor";
    case "done":
    case "completed":
      return "Tamamlandı";
    default:
      return status;
  }
};

const matchesQuery = (t: TaskDto, q: string): boolean => {
  if (!q) return true;
  const needle = q.toLowerCase();
  const hay = [
    t.code,
    t.title,
    t.description,
    ...(t.assignedUsers ?? []).map((u) => u.name),
    ...(t.labels ?? []).map((l) => l.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
};

const highlight = (text: string | null | undefined, q: string) => {
  if (!text || !q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
};

const TaskRow: React.FC<{
  task: TaskDto;
  depth?: number;
  collapsed?: boolean;
  onToggle?: () => void;
  query?: string;
}> = ({ task, depth = 0, collapsed = true, onToggle, query = "" }) => {
  const pct = computeProgress(task);
  const hasChildren = (task.subTasks?.length ?? 0) > 0;

  return (
    <div className="bg-white border rounded-lg p-3 mb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={onToggle}
                className="text-sm px-2 py-1 rounded border hover:bg-gray-50 cursor-pointer"
                aria-label={collapsed ? "Genişlet" : "Daralt"}
              >
                {collapsed ? "➕" : "➖"}
              </button>
            )}
            <h4 className="font-medium text-gray-900">
              <span className="text-gray-500 mr-1">{highlight(task.code, query)}</span>
              {highlight(task?.title, query)}
            </h4>
          </div>

          {task.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{highlight(task.description, query)}</p>}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {task.status && <Tag color={statusColor(task.status)}>{statusLabelTR(task.status)}</Tag>}

            {(task.labels ?? []).map((l) => (
              <Tooltip key={l.id} title={l.description || l.name} placement="top">
                <Tag icon={<TagsOutlined />} color={l.color || "default"}>
                  {l.name}
                </Tag>
              </Tooltip>
            ))}

            {(task.assignedUsers ?? []).length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <UserOutlined />
                {(task.assignedUsers ?? [])
                  .map((u) => u.name)
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}
          </div>
        </div>

        <div className="w-48">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">İlerleme</span>
            <span className="font-medium text-gray-900">{pct}%</span>
          </div>
          <Progress percent={pct} size="small" />
          <div className="text-[11px] text-gray-500 mt-1">
            Planlanan: {task.plannedHours ?? 0}h · Gerçekleşen: {task.actualHours ?? 0}h
          </div>
        </div>
      </div>

      {hasChildren && !collapsed && (
        <div className="mt-3 pl-4 md:pl-6 border-l">
          {(task.subTasks ?? []).map((st) => (
            <CollapsibleTask key={st.id} task={st} depth={depth + 1} query={query} />
          ))}
        </div>
      )}
    </div>
  );
};

const CollapsibleTask: React.FC<{ task: TaskDto; depth?: number; query?: string }> = ({ task, depth = 0, query = "" }) => {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <TaskRow
      task={task}
      depth={depth}
      collapsed={collapsed}
      onToggle={() => setCollapsed((c) => !c)}
      query={query}
    />
  );
};

interface TasksStatusCardProps {
  title?: string;
  tasks?: TaskDto[] | null;
  className?: string;
  defaultCollapsed?: boolean;
}

export const TasksStatusCard: React.FC<TasksStatusCardProps> = ({
  title = "Görevler Durumu",
  tasks = [],
  className = "",
  defaultCollapsed = true,
}) => {
  const [q, setQ] = useState("");

  const WrappedTask: React.FC<{ t: TaskDto }> = ({ t }) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    return (
      <TaskRow
        task={t}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        query={q}
      />
    );
  };

  const filtered = useMemo(
    () => (tasks ?? []).filter((t) => matchesQuery(t, q)),
    [tasks, q]
  );

  const overall = useMemo(() => {
    if (filtered.length === 0) return 0;
    const vals = filtered.map(computeProgress);
    return clamp(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [filtered]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ProjectOutlined className="text-purple-600" />
          {title}
        </h2>

        <div className="mt-3 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Görev, kod, açıklama, etiket veya kullanıcı ara…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              allowClear
            />
          </div>
          <div className="w-full md:w-64">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Genel İlerleme</span>
            </div>
            <Progress percent={overall} size="small" strokeColor="#8b5cf6" />
          </div>
        </div>
      </div>

      <div className="p-6">
        {filtered.length === 0 ? (
          <div className="text-sm text-gray-500">Gösterilecek görev bulunamadı.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => (
              <WrappedTask key={t.id} t={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
