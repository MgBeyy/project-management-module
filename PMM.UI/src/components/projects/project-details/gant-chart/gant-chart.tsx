// 🔻 SADECE İLGİLİ KISIMLAR DEĞİŞTİ — dosyanın tamamını bu sürümle değiştirmen yeterli
import React, { useMemo, useRef, useState, useLayoutEffect, useCallback } from "react";
import { Card, Row, Col, Tooltip, Typography, Space, Divider, Empty, Select, DatePicker } from "antd";
import { CaretRightOutlined, CaretDownOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isBetween from "dayjs/plugin/isBetween";

import type {  ProjectHierarchyDto } from "src/types/projects/api";
import type { TaskDto } from "src/types/tasks";
import type { Nullable } from "src/types/common";

dayjs.extend(localizedFormat);
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface GanttTaskDto extends TaskDto {
  subTasks: Nullable<GanttTaskDto[]>;
}
type GanttProjectLike = {
  id: number;
  title: string;
  code?: string | null;
  tasks?: GanttTaskDto[];
  childProjects?: GanttProjectLike[];
};

interface TaskRow {
  id: string;
  projectId: number;
  projectTitle: string;
  projectCode?: string | null;
  title: string;
  code?: string | null;
  status: string;
  start: number | null;       // ⬅️ null olabilir
  end: number | null;         // ⬅️ null olabilir
  plannedHours: number;
  actualHours: number;
  level: number;
  seq: number;
  hasRange: boolean;          // ⬅️ bu satırda bar çizilecek mi?
}

interface ProjectGroup {
  projectId: number;
  title: string;
  code?: string | null;
  level: number;
}

const STATUS_COLOR: Record<string, string> = {
  Active: "#1677ff",
  Planned: "#2f54eb",
  Inactive: "#d9d9d9",
  Completed: "#52c41a",
  WaitingForApproval: "#faad14",
  Todo: "#bfbfbf",
  Done: "#52c41a",
};
const LEFT_COL_WIDTH = 420;

function normalizeRange(
  plannedStart?: number | null,
  plannedEnd?: number | null,
  actualStart?: number | null,
  actualEnd?: number | null,
): { start?: number; end?: number } {
  const start = plannedStart ?? actualStart ?? undefined;
  const end = plannedEnd ?? actualEnd ?? undefined;
  if (start && end && start <= end) return { start, end };
  return { start: undefined, end: undefined };
}
function getTaskRange(t: GanttTaskDto) {
  return normalizeRange(t.plannedStartDate, t.plannedEndDate, t.actualStartDate, t.actualEndDate);
}
function sumTaskHours(t: GanttTaskDto): { planned: number; actual: number } {
  const plannedSelf = Number(t.plannedHours ?? 0) || 0;
  const actualSelf = Number(t.actualHours ?? 0) || 0;
  const subs: GanttTaskDto[] = t.subTasks ?? [];
  const sums = subs.reduce(
    (acc, s) => {
      const child = sumTaskHours(s);
      return { planned: acc.planned + child.planned, actual: acc.actual + child.actual };
    },
    { planned: 0, actual: 0 }
  );
  return { planned: plannedSelf + sums.planned, actual: actualSelf + sums.actual };
}

function collectTasksHier(root: GanttProjectLike) {
  const rows: TaskRow[] = [];
  const itemsByProject = new Map<number, TaskRow[]>();
  const groups: ProjectGroup[] = [];

  const parentByTaskId = new Map<string, string | null>();
  const childrenByTaskId = new Map<string, string[]>();
  const tasksWithChildren = new Set<string>();

  let seq = 0;

  function pushTask(
    t: GanttTaskDto,
    projectId: number,
    projectTitle: string,
    projectCode: string | null | undefined,
    level: number,
    parentTaskId: string | null
  ) {
    const tr = getTaskRange(t);
    const id = `task-${t.id}`;

    // ⬇️ Tarih olmasa bile satırı ekle
    if (t.title) {
      const sums = sumTaskHours(t);
      const start = tr.start ?? null;
      const end = tr.end ?? null;
      const row: TaskRow = {
        id,
        projectId,
        projectTitle,
        projectCode,
        title: t.title,
        code: t.code,
        status: t.status,
        start,
        end,
        plannedHours: sums.planned,
        actualHours: sums.actual,
        level,
        seq: seq++,
        hasRange: Boolean(start && end),
      };
      rows.push(row);
      if (!itemsByProject.has(projectId)) itemsByProject.set(projectId, []);
      itemsByProject.get(projectId)!.push(row);
    }

    parentByTaskId.set(id, parentTaskId ?? null);

    const subs = t.subTasks ?? [];
    if (subs.length) {
      tasksWithChildren.add(id);
      childrenByTaskId.set(id, subs.map((s) => `task-${s.id}`));
    }
    for (const s of subs) {
      pushTask(s, projectId, projectTitle, projectCode, level + 1, id);
    }
  }

  function pushFromProject(p: GanttProjectLike, level: number) {
    const projectId = p.id;
    const projectTitle = p.title ?? "(Başlıksız)";
    const projectCode = p.code ?? undefined;

    groups.push({ projectId, title: projectTitle, code: projectCode, level });

    for (const t of p.tasks ?? []) {
      pushTask(t, projectId, projectTitle, projectCode, 0, null);
    }
    for (const c of p.childProjects ?? []) {
      pushFromProject(c, level + 1);
    }
  }

  pushFromProject(root, 0);

  return { rows, groups, itemsByProject, parentByTaskId, childrenByTaskId, tasksWithChildren };
}

function useMeasureWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      setW(entry.contentRect.width);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function buildMonthTicks(startMs: number, endMs: number) {
  const months: { d: Dayjs; key: string }[] = [];
  const s = dayjs(startMs).startOf("month");
  const e = dayjs(endMs).endOf("month");
  let cur = s;
  while (cur.isBefore(e, "month") || cur.isSame(e, "month")) {
    months.push({ d: cur, key: cur.format("YYYY-MM") });
    cur = cur.add(1, "month");
  }
  return months;
}
function createScale(startMs: number, endMs: number, width: number) {
  const span = Math.max(1, endMs - startMs);
  const pxPerMs = width / span;
  const x = (ms: number) => (ms - startMs) * pxPerMs;
  return { x, pxPerMs };
}

export const ProjectTaskGantt: React.FC<{ project: ProjectHierarchyDto }> = ({ project }) => {
  const castedProject = project as GanttProjectLike;

  const {
    rows,
    groups,
    itemsByProject,
    parentByTaskId,
    childrenByTaskId,
    tasksWithChildren,
  } = useMemo(() => collectTasksHier(castedProject), [castedProject]);

  // ⬇️ Yalnızca tarihi olan satırlar grafik için anlamlı
  const rangedRows = useMemo(() => rows.filter(r => r.hasRange), [rows]);
  const hasData = rangedRows.length > 0;

  // Varsayılan görünüm aralığı — sadece rangedRows üzerinden
  const initialStart = hasData ? Math.min(...rangedRows.map((r) => dayjs(r.start!).startOf("month").valueOf())) : dayjs().startOf("month").valueOf();
  const initialEnd = hasData ? Math.max(...rangedRows.map((r) => dayjs(r.end!).endOf("month").valueOf())) : dayjs().add(6, "month").endOf("month").valueOf();

  const [viewStart, setViewStart] = useState<number>(initialStart);
  const [viewEnd, setViewEnd] = useState<number>(initialEnd);

  const [collapsedProjects, setCollapsedProjects] = useState<Set<number>>(new Set());
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());

  const toggleProject = useCallback((pid: number) => {
    setCollapsedProjects(prev => {
      const n = new Set(prev);
      if (n.has(pid)) n.delete(pid);
      else n.add(pid);
      return n;
    });
  }, []);
  const toggleTask = useCallback((tid: string) => {
    setCollapsedTasks(prev => {
      const n = new Set(prev);
      if (n.has(tid)) n.delete(tid);
      else n.add(tid);
      return n;
    });
  }, []);

  // Sadece ATALAR’ı kontrol et (kendisi hariç)
  const isHiddenByAncestor = useCallback((taskId: string) => {
    let cur: string | null = parentByTaskId.get(taskId) ?? null;
    while (cur) {
      if (collapsedTasks.has(cur)) return true;
      cur = parentByTaskId.get(cur) ?? null;
    }
    return false;
  }, [collapsedTasks, parentByTaskId]);

  const filterVisible = useCallback((pid: number, list: TaskRow[]) => {
    if (collapsedProjects.has(pid)) return [] as TaskRow[];
    return list.filter(r => !isHiddenByAncestor(r.id));
  }, [collapsedProjects, isHiddenByAncestor]);

  const onRangeChange = useCallback((val: null | [Dayjs | null, Dayjs | null]) => {
    if (!val || !val[0] || !val[1]) return;
    setViewStart(val[0].startOf("month").valueOf());
    setViewEnd(val[1].endOf("month").valueOf());
  }, []);

  const [wrapRef, width] = useMeasureWidth<HTMLDivElement>();
  const chartWidth = Math.max(300, width - LEFT_COL_WIDTH - 16);

  const { x } = useMemo(() => createScale(viewStart, viewEnd, chartWidth), [viewStart, viewEnd, chartWidth]);
  const ticks = useMemo(() => buildMonthTicks(viewStart, viewEnd), [viewStart, viewEnd]);

  const today = dayjs();
  const showToday = today.isBetween(dayjs(viewStart), dayjs(viewEnd), "millisecond", "[]");
  const todayX = x(today.valueOf());

  return (
    <Card ref={wrapRef} bodyStyle={{ padding: 12 }}>
      <Row align="middle" justify="space-between" style={{ marginBottom: 12 }}>
        <Col>
          <Space size={8} align="center">
            <Text strong style={{ fontSize: 16 }}>📅 Görev Gantt Çizelgesi</Text>
            <Text type="secondary">(ana proje + tüm alt projeler)</Text>
          </Space>
        </Col>
        <Col>
          <Space>
            <RangePicker
              picker="month"
              value={[dayjs(viewStart), dayjs(viewEnd)] as [Dayjs, Dayjs]}
              onChange={onRangeChange}
              allowClear={false}
            />
            <Select
              style={{ width: 170 }}
              defaultValue="fit"
              options={[
                { label: "Veriye Sığdır", value: "fit" },
                { label: "Bu Yıl", value: "year" },
                { label: "Sonraki 6 Ay", value: "h2" },
              ]}
              onChange={(v) => {
                if (v === "fit" && hasData) {
                  setViewStart(Math.min(...rangedRows.map((r) => dayjs(r.start!).startOf("month").valueOf())));
                  setViewEnd(Math.max(...rangedRows.map((r) => dayjs(r.end!).endOf("month").valueOf())));
                } else if (v === "year") {
                  setViewStart(dayjs().startOf("year").valueOf());
                  setViewEnd(dayjs().endOf("year").valueOf());
                } else if (v === "h2") {
                  setViewStart(dayjs().startOf("month").valueOf());
                  setViewEnd(dayjs().add(6, "month").endOf("month").valueOf());
                }
              }}
            />
          </Space>
        </Col>
      </Row>

      {/* LISTE + CHART */}
      {rows.length === 0 ? (
        <Empty description="Tarih aralığı olsun olmasın görev bulunamadı." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: `${LEFT_COL_WIDTH}px 1fr`, gap: 8, minWidth: width }}>
          {/* Sol panel */}
          <div style={{ minWidth: LEFT_COL_WIDTH }}>
            <div style={{ height: 44, padding: "8px 8px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
              <Text type="secondary" strong>Görevler / Projeler</Text>
            </div>

            {groups.map((g) => {
              const allItems = itemsByProject.get(g.projectId) ?? [];
              const items = filterVisible(g.projectId, allItems);
              const projectCollapsed = collapsedProjects.has(g.projectId);

              return (
                <React.Fragment key={g.projectId}>
                  <div
                    style={{
                      height: 40,
                      padding: "8px 8px",
                      background: "#fafafa",
                      borderBottom: "1px solid #f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                    onClick={() => toggleProject(g.projectId)}
                  >
                    <div style={{ width: g.level * 12 }} />
                    {projectCollapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
                    <Text strong>
                      {g.title}
                      {g.code ? <Text type="secondary"> &nbsp;({g.code})</Text> : null}
                    </Text>
                  </div>

                  {!projectCollapsed && items.map((r) => {
                    const hasChildren = tasksWithChildren.has(r.id);
                    const collapsed = collapsedTasks.has(r.id);
                    return (
                      <div key={r.id} style={{ height: 44, padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: r.level * 16 }} />
                          {hasChildren ? (
                            <span
                              onClick={(e) => { e.stopPropagation(); toggleTask(r.id); }}
                              style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                            >
                              {collapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
                            </span>
                          ) : (
                            <span style={{ width: 14, display: "inline-block" }} />
                          )}
                          <Text style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {r.title}{r.code ? <Text type="secondary"> &nbsp;({r.code})</Text> : null}
                          </Text>
                          {!r.hasRange && (
                            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>(tarih/saat yok)</Text>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>

          {/* Sağ panel */}
          <div style={{ overflowX: "hidden", minWidth: chartWidth }}>
            {/* Üst ölçek */}
            <div style={{ position: "relative", height: 44, borderBottom: "1px solid #f0f0f0" }}>
              {hasData && ticks.map((t) => (
                <div
                  key={t.key}
                  style={{
                    position: "absolute",
                    left: x(t.d.valueOf()),
                    top: 0,
                    width: x(t.d.add(1, "month").valueOf()) - x(t.d.valueOf()),
                    height: "100%",
                    borderLeft: "1px solid #f0f0f0",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ position: "absolute", top: 4, left: 4, fontSize: 12, color: "#8c8c8c" }}>
                    {t.d.format("MMM YYYY")}
                  </div>
                </div>
              ))}
              {hasData && showToday && (
                <Tooltip title={`Bugün: ${today.format("LL")}`}>
                  <div
                    style={{
                      position: "absolute",
                      left: todayX,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: "#ff4d4f",
                      zIndex: 10,
                      pointerEvents: "none",
                    }}
                  />
                </Tooltip>
              )}
            </div>

            {/* Satırlar (sol ile aynı dizilim) */}
            <div>
              {groups.map((g) => {
                const allItems = itemsByProject.get(g.projectId) ?? [];
                const items = filterVisible(g.projectId, allItems);

                return (
                  <React.Fragment key={g.projectId}>
                    <div style={{ height: 40, borderBottom: "1px solid #f0f0f0", background: "#fafafa" }} />
                    {items.map((r) => {
                      // Eğer tarih yoksa boş satır bırak (bar çizme)
                      if (!r.hasRange) {
                        return <div key={r.id} style={{ height: 44, borderBottom: "1px solid #f0f0f0" }} />;
                      }

                      const left = Math.max(0, x(r.start!));
                      const right = Math.max(0, x(r.end!));
                      const widthPx = Math.max(2, right - left);
                      const color = STATUS_COLOR[r.status] ?? "#1677ff";
                      const planned = r.plannedHours;
                      const actual = r.actualHours;
                      const pct = planned > 0 ? (actual / planned) * 100 : undefined;
                      const pctCap = Math.max(0, Math.min(pct ?? 0, 100));

                      return (
                        <div key={r.id} style={{ position: "relative", height: 44, borderBottom: "1px solid #f0f0f0" }}>
                          <Tooltip
                            title={
                              <div>
                                <div><b>{r.title}</b>{r.code ? ` (${r.code})` : ""}</div>
                                <div><b>Durum:</b> {r.status}</div>
                                <div><b>Tarih Aralığı:</b> {dayjs(r.start!).format("LL")} – {dayjs(r.end!).format("LL")}</div>
                                <div><b>Planlanan/Tamamlanan:</b> {planned.toFixed(1)} / {actual.toFixed(1)} saat</div>
                                {planned > 0 ? <div><b>İlerleme:</b> {Math.round(pct ?? 0)}%</div> : null}
                              </div>
                            }
                          >
                            <div
                              style={{
                                position: "absolute",
                                left,
                                top: 8,
                                height: 28,
                                width: widthPx,
                                background: "#999999",
                                borderRadius: 6,
                                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
                                overflow: "hidden",
                                cursor: "pointer",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${pctCap}%`,
                                  background: color,
                                  opacity: 0.9,
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "0 8px",
                                  color: "#fff",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <span>{planned > 0 ? `${Math.round(pct ?? 0)}%` : `${actual.toFixed(1)}h`}</span>
                                {planned > 0 ? <span>{`${actual.toFixed(1)} / ${planned.toFixed(1)}h`}</span> : null}
                              </div>
                            </div>
                          </Tooltip>
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Divider style={{ marginTop: 16 }} />
      <Text type="secondary">
        ℹ️ Not: Tarih/çalışma saati olmayan görevler listede görünür, ancak grafikte bar çizilmez.
      </Text>
    </Card>
  );
};
