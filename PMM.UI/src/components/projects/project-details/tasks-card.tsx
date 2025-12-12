import React, { useMemo, useState } from "react";
import { Tag, Progress, Input, Tooltip } from "antd";
import { TagsOutlined, SearchOutlined, RightOutlined, DownOutlined } from "@ant-design/icons";
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
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 transition-all hover:bg-white hover:shadow-sm hover:border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Left Side: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            {/* Toggle Button */}
            {hasChildren && (
              <button
                onClick={onToggle}
                className="mt-0.5 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors"
                aria-label={collapsed ? "Genişlet" : "Daralt"}
              >
                {collapsed ? <RightOutlined style={{ fontSize: '10px' }} /> : <DownOutlined style={{ fontSize: '10px' }} />}
              </button>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{highlight(task.code, query)}</span>
                <h4 className="font-semibold text-slate-800 truncate" title={task.title || ''}>
                  {highlight(task?.title, query)}
                </h4>
                {task.status && (
                  <Tag className="ml-2 mr-0 border-0" color={statusColor(task.status)}>
                    {statusLabelTR(task.status)}
                  </Tag>
                )}
              </div>

              {task.description && (
                <p className="text-sm text-slate-500 line-clamp-1 mb-2">
                  {highlight(task.description, query)}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {(task.assignedUsers ?? []).length > 0 && (
                  <div className="flex -space-x-2">
                    {(task.assignedUsers ?? []).map((u, i) => (
                      <Tooltip key={u.id || i} title={u.name}>
                        <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-medium shadow-sm z-10">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                )}

                {(task.labels ?? []).map((l) => (
                  <Tag key={l.id} className="mr-0 text-[10px] px-1.5 border-0 bg-white" icon={<TagsOutlined className="text-[10px]" />} color={l.color || "default"}>
                    {l.name}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Progress */}
        <div className="w-full sm:w-48 flex-shrink-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-100 sm:pl-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium">İlerleme</span>
            <span className="font-bold text-slate-700">{pct}%</span>
          </div>
          <Progress percent={pct} size="small" showInfo={false} strokeColor={pct === 100 ? "#10b981" : "#3b82f6"} trailColor="#e2e8f0" />
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>P: <strong className="text-slate-600">{task.plannedHours ?? 0}h</strong></span>
            <span>G: <strong className={task.actualHours && task.plannedHours && task.actualHours > task.plannedHours ? "text-red-500" : "text-slate-600"}>{task.actualHours ?? 0}h</strong></span>
          </div>
        </div>
      </div>

      {hasChildren && !collapsed && (
        <div className="mt-4 pt-4 border-t border-slate-200/60 pl-4 md:pl-8 space-y-2">
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
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
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
