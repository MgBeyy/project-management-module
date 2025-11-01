import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import type { GraphData, EdgeData, NodeData as G6NodeData } from '@antv/g6';
import { OrganizationChart } from '@ant-design/graphs';
import type { OrganizationChartOptions } from '@ant-design/graphs';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

// ---- Tipler ----
type ChartNodeType = 'program' | 'project' | 'subproject' | 'task' | 'subtask' | 'activity';

interface ChartNodeMeta {
  label: string;
  name?: string;
  type: ChartNodeType;
  status?: string;
  priority?: string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  owner?: string;
  info?: string;
  estimatedHours?: number;
  loggedHours?: number;
  isCurrent?: boolean;
  originId?: string;
  isAlias?: boolean;
}

interface ChartNode {
  id: string;
  data: ChartNodeMeta;
}

interface ChartGraphResult {
  nodes: Map<string, ChartNode>;
  edges: Map<string, EdgeData>;
  children: Map<string, Set<string>>;
  parents: Map<string, Set<string>>;
  currentNodeId?: string;
}

interface DisplayGraphData {
  graphData: GraphData;
  originToDisplays: Map<string, string[]>;
  primaryDisplayIds: Map<string, string>;
  expandedDisplayIds: Set<string>;
}

interface ProjectOrganizationDiagramProps {
  project: any; // ProjectHierarchyDto
}

// ---- Görsel ayarlar ----
const NODE_TYPE_CONFIG: Record<ChartNodeType, { color: string; title: string }> = {
  program: { color: '#2563eb', title: 'Program' },
  project: { color: '#2563eb', title: 'Proje' },
  subproject: { color: '#2563eb', title: 'Alt Proje' },
  task: { color: '#f97316', title: 'Görev' },
  subtask: { color: '#f97316', title: 'Alt Görev' },
  activity: { color: '#f97316', title: 'Aktivite' },
};

const fmtDate = (ts?: number | null) =>
  typeof ts === 'number' && Number.isFinite(ts) ? new Date(ts).toISOString().slice(0, 10) : undefined;

const statusTR = (s?: string) => {
  switch (s) {
    case 'Active': return 'Aktif';
    case 'Inactive': return 'Pasif';
    case 'Completed': return 'Tamamlandı';
    case 'Planned': return 'Planlandı';
    case 'WaitingForApproval': return 'Onay Bekliyor';
    default: return s ?? '';
  }
};

const priorityTR = (p?: string) => {
  switch (p) {
    case 'High': return 'Yüksek';
    case 'Regular': return 'Normal';
    case 'Low': return 'Düşük';
    default: return p ?? '';
  }
};

const ProjectNodeCard = ({ datum }: { datum: G6NodeData }) => {
  const meta = (datum?.data ?? {}) as unknown as ChartNodeMeta;
  const config = NODE_TYPE_CONFIG[meta.type || 'project'];
  const metrics: Array<{ label: string; value: string }> = [];

  if (meta.priority) metrics.push({ label: 'Öncelik', value: meta.priority });
  if (typeof meta.progress === 'number') metrics.push({ label: 'İlerleme', value: `${meta.progress}%` });
  if (meta.dueDate) metrics.push({ label: 'Termin', value: meta.dueDate });
  if (meta.startDate && meta.endDate) metrics.push({ label: 'Takvim', value: `${meta.startDate} - ${meta.endDate}` });
  if (meta.owner) metrics.push({ label: 'Sorumlu', value: meta.owner });
  if (meta.info) metrics.push({ label: 'Not', value: meta.info });
  if (meta.estimatedHours !== undefined && meta.loggedHours !== undefined) {
    metrics.push({ label: 'Saat', value: `${meta.loggedHours}/${meta.estimatedHours}` });
  }

  const showTopStripe = meta.type !== 'subtask' && meta.type !== 'activity';
  const topStripeColor = meta.type === 'task' ? NODE_TYPE_CONFIG.task.color : NODE_TYPE_CONFIG.project.color;

  const accentColor = config.color;
  const borderWidth = meta.isCurrent ? 3 : 1;
  const borderStyle = meta.isAlias ? 'dashed' : 'solid';
  const baseShadow = '0 14px 30px rgba(15, 23, 42, 0.08)';
  const highlightShadow = `0 20px 40px rgba(15, 23, 42, 0.16), 0 0 0 4px ${accentColor}33`;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 16,
        background: meta.isCurrent ? 'linear-gradient(180deg, #eef2ff 0%, #ffffff 75%)' : '#ffffff',
        border: `${borderWidth}px ${borderStyle} ${accentColor}`,
        boxShadow: meta.isCurrent ? highlightShadow : baseShadow,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {showTopStripe && <div style={{ height: meta.isCurrent ? 8 : 6, width: '100%', background: topStripeColor }} />}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: accentColor }}>
            {NODE_TYPE_CONFIG[meta.type || 'project'].title}
          </span>
          {meta.status && <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{meta.status}</span>}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{meta.label}</div>
        {meta.name && <div style={{ fontSize: 13, lineHeight: 1.4, color: '#475569', marginBottom: 12 }}>{meta.name}</div>}
        {metrics.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 'auto' }}>
            {metrics.slice(0, 4).map((item) => (
              <div key={`${meta.label}-${item.label}`} style={{ minHeight: 38 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 12, color: '#475569' }}>{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const toProgress = (estimated?: number, logged?: number) => {
  if (!estimated || estimated <= 0) return undefined;
  const ratio = Math.min(100, Math.round(((logged ?? 0) / estimated) * 100));
  return Number.isFinite(ratio) ? ratio : undefined;
};

// ---- Kimlik yardımcıları (hierarchy uyumlu) ----
const getProjectIdentifier = (project: any): string | undefined => {
  if (!project || typeof project !== 'object') return undefined;
  if (project.code && `${project.code}`.trim()) return `${project.code}`;
  if (project.id !== null && project.id !== undefined) return `${project.id}`;
  if (project.title && `${project.title}`.trim()) return `${project.title}`.trim();
  return undefined;
};

const makeProjectNodeId = (value: any): string | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string' || typeof value === 'number') {
    const text = `${value}`.trim();
    return text ? `project-${text}` : undefined;
  }
  const identifier = getProjectIdentifier(value);
  return identifier ? `project-${identifier}` : undefined;
};

const normalizeProjectRef = (value: any): any | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'object') return value; // ProjectDto
  if (typeof value === 'string' || typeof value === 'number') return { id: value };
  return undefined;
};

const collectParentRefs = (project: any): string[] => {
  const refs = new Set<string>();

  if (Array.isArray(project?.parentProjectIds)) {
    project.parentProjectIds.forEach((pid: any) => {
      if (pid !== null && pid !== undefined) refs.add(`${pid}`);
    });
  }

  if (Array.isArray(project?.parentProjects)) {
    project.parentProjects.forEach((parent: any) => {
      const norm = normalizeProjectRef(parent);
      const idf = getProjectIdentifier(norm);
      if (idf) refs.add(idf);
    });
  }

  return Array.from(refs);
};

const NODE_TYPE_PRIORITY: Record<ChartNodeType, number> = {
  program: 1,
  project: 2,
  subproject: 3,
  task: 4,
  subtask: 5,
  activity: 6,
};

const pickNodeType = (left?: ChartNodeType, right?: ChartNodeType): ChartNodeType | undefined => {
  if (left && right) return NODE_TYPE_PRIORITY[left] <= NODE_TYPE_PRIORITY[right] ? left : right;
  return left ?? right;
};

const mergeNodeMeta = (existing: ChartNodeMeta, incoming: ChartNodeMeta): ChartNodeMeta => {
  const { type: incomingType, ...restIncoming } = incoming;
  const merged: ChartNodeMeta = { ...existing };
  (Object.entries(restIncoming) as Array<[keyof ChartNodeMeta, ChartNodeMeta[keyof ChartNodeMeta]]>).forEach(([key, value]) => {
    if (value !== undefined && value !== null) (merged as any)[key] = value;
  });
  merged.isCurrent = Boolean(existing.isCurrent || incoming.isCurrent);
  merged.type = pickNodeType(existing.type, incomingType) ?? existing.type ?? incomingType ?? 'project';
  return merged;
};

// ---- Meta üreticileri ----
const createProjectMeta = (project: any, options: { nodeType?: ChartNodeType; isCurrent?: boolean }) => {
  const identifier = getProjectIdentifier(project);
  // Başlık: title varsa başlıkta title göster; yoksa code; o da yoksa fallback
  const label = (project?.title && `${project.title}`.trim())
    ? `${project.title}`.trim()
    : (project?.code ?? (identifier ? `PRJ-${identifier}` : 'PRJ-UNKNOWN'));

  // Alt satır: varsa code'u gösterelim
  const secondaryName = (project?.code && `${project.code}`.trim()) ? `${project.code}`.trim() : undefined;

  const firstAssigneeName =
    Array.isArray(project?.assignedUsers) && project.assignedUsers.length
      ? (project.assignedUsers.find((x: any) => x?.role === 'Manager')?.user?.name ??
         project.assignedUsers[0]?.user?.name)
      : undefined;

  return {
    label,
    name: secondaryName ?? project?.title ?? undefined,
    type: options.nodeType ?? (collectParentRefs(project).length ? 'project' : 'program'),
    status: statusTR(project?.status),
    priority: priorityTR(project?.priority),
    progress:
      typeof project?.plannedHours === 'number' && project.plannedHours > 0
        ? Math.min(100, Math.round(((project?.actualHours ?? 0) / project.plannedHours) * 100))
        : undefined,
    startDate: fmtDate(project?.plannedStartDate),
    endDate: fmtDate(project?.plannedDeadline),
    owner: firstAssigneeName,
    isCurrent: options.isCurrent ?? Boolean(project?.isCurrent),
  } as ChartNodeMeta;
};

const createFallbackProjectMeta = (rawId: string): ChartNodeMeta => ({
  label: `PRJ-${rawId}`,
  type: 'program',
});

const statusTRTask = (s?: string) => {
  const v = (s ?? '').toLowerCase();
  if (v === 'todo') return 'Yapılacak';
  if (v === 'inactive') return 'Pasif';
  if (v === 'active') return 'Aktif';
  if (v === 'inprogress' || v === 'progress') return 'Devam ediyor';
  if (v === 'completed' || v === 'done') return 'Tamamlandı';
  if (v === 'blocked') return 'Engellendi';
  if (v === 'onhold') return 'Beklemede';
  return s ?? '';
};

const createTaskMeta = (task: any): ChartNodeMeta => ({
  label: task?.title ?? `Task-${task?.id ?? ''}`,
  name: task?.assignee,
  status: statusTRTask(task?.status),
  priority: priorityTR(task?.priority),
  dueDate: task?.dueDate,
  progress: toProgress(task?.plannedHours ?? task?.estimatedHours, task?.actualHours ?? task?.loggedHours),
  estimatedHours: task?.plannedHours ?? task?.estimatedHours,
  loggedHours: task?.actualHours ?? task?.loggedHours,
  type: 'task',
});

const createSubtaskMeta = (subtask: any): ChartNodeMeta => ({
  label: subtask?.title ?? `Subtask-${subtask?.id ?? ''}`,
  name: subtask?.description ?? subtask?.status,
  status: statusTRTask(subtask?.status),
  type: 'subtask',
});

const createActivityMeta = (activity: any): ChartNodeMeta => ({
  label: activity?.description ?? `Activity-${activity?.id ?? ''}`,
  name: activity?.date,
  info: activity?.duration,
  type: 'activity',
});

// ---- Graph Builder ----
class ChartGraphBuilder {
  nodes = new Map<string, ChartNode>();
  edges = new Map<string, EdgeData>();
  children = new Map<string, Set<string>>();
  parents = new Map<string, Set<string>>();
  pendingParents = new Map<string, Set<string>>();
  currentNodeId?: string;

  upsertNode(node: ChartNode) {
    const existing = this.nodes.get(node.id);
    if (existing) this.nodes.set(node.id, { id: node.id, data: mergeNodeMeta(existing.data, node.data) });
    else this.nodes.set(node.id, node);
  }

  addEdge(sourceId: string, targetId: string) {
    if (!sourceId || !targetId || sourceId === targetId) return;
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) return;
    const edgeId = `${sourceId}-${targetId}`;
    if (this.edges.has(edgeId)) return;

    this.edges.set(edgeId, { id: edgeId, source: sourceId, target: targetId });

    if (!this.children.has(sourceId)) this.children.set(sourceId, new Set());
    this.children.get(sourceId)!.add(targetId);

    if (!this.parents.has(targetId)) this.parents.set(targetId, new Set());
    this.parents.get(targetId)!.add(sourceId);
  }

  queueParentLinks(childId: string, parentRefs: string[]) {
    if (!childId || !parentRefs.length) return;
    const bucket = this.pendingParents.get(childId) ?? new Set<string>();
    parentRefs.forEach((ref) => { if (ref !== undefined && ref !== null) bucket.add(ref); });
    if (bucket.size) this.pendingParents.set(childId, bucket);
  }

  resolveParentLinks(resolveProject: (rawId: string) => any) {
    this.pendingParents.forEach((parentIds, childId) => {
      parentIds.forEach((rawId) => {
        const parentNodeId = makeProjectNodeId(rawId);
        if (!parentNodeId) return;

        if (!this.nodes.has(parentNodeId)) {
          const projectData = resolveProject(rawId);
          if (projectData) {
            this.upsertNode({ id: parentNodeId, data: createProjectMeta(projectData, { nodeType: collectParentRefs(projectData).length ? 'project' : 'program' }) });
          } else {
            this.upsertNode({ id: parentNodeId, data: createFallbackProjectMeta(rawId) });
          }
        }

        this.addEdge(parentNodeId, childId);
      });
    });

    this.pendingParents.clear();
  }

  toResult(): ChartGraphResult {
    return { nodes: this.nodes, edges: this.edges, children: this.children, parents: this.parents, currentNodeId: this.currentNodeId };
  }
}

interface RegisterProjectOptions {
  nodeType?: ChartNodeType;
  isCurrent?: boolean;
  visited: Set<string>;
}

// ---- Alt öğeler ----
const registerActivity = (builder: ChartGraphBuilder, activity: any, parentId: string) => {
  if (!activity) return;
  const key = activity?.id ?? `${parentId}-activity-${activity?.description ?? 'activity'}-${activity?.date ?? ''}`;
  const nodeId = `activity-${key}`;
  builder.upsertNode({ id: nodeId, data: createActivityMeta(activity) });
  builder.addEdge(parentId, nodeId);
};

const registerSubtask = (builder: ChartGraphBuilder, subtask: any, parentId: string) => {
  if (!subtask) return;
  const identifier = subtask?.id ?? subtask?.code ?? subtask?.title;
  if (identifier === undefined || identifier === null) return;
  const nodeId = `subtask-${identifier}`;
  builder.upsertNode({ id: nodeId, data: createSubtaskMeta(subtask) });
  builder.addEdge(parentId, nodeId);

  // iç içe alt görevler (subTasks / subtasks) desteklenir
  const nested = (Array.isArray(subtask?.subTasks) ? subtask.subTasks : [])
    .concat(Array.isArray(subtask?.subtasks) ? subtask.subtasks : []);
  nested.forEach((st: any) => registerSubtask(builder, st, nodeId));
};

const registerTask = (builder: ChartGraphBuilder, task: any, parentId: string) => {
  if (!task) return;
  const identifier = task?.id ?? task?.code ?? task?.title;
  if (identifier === undefined || identifier === null) return;
  const nodeId = `task-${identifier}`;
  builder.upsertNode({ id: nodeId, data: createTaskMeta(task) });
  builder.addEdge(parentId, nodeId);

  // hem subTasks (DTO) hem subtasks (eski) destekle
  const subs = (Array.isArray(task?.subTasks) ? task.subTasks : [])
    .concat(Array.isArray(task?.subtasks) ? task.subtasks : []);
  subs.forEach((sub: any) => registerSubtask(builder, sub, nodeId));

  if (Array.isArray(task?.activities)) task.activities.forEach((activity: any) => registerActivity(builder, activity, nodeId));
};

// ---- Parent lookup (hierarchy) ----
const buildParentLookup = (project: any): Map<string, any> => {
  const lookup = new Map<string, any>();
  if (!project) return lookup;

  const visited = new Set<string>();
  const queue: Array<{ value: any; source: 'root' | 'sub' | 'parent' }> = [];

  const enqueue = (value: any, source: 'root' | 'sub' | 'parent') => {
    const normalized = normalizeProjectRef(value);
    if (!normalized) return;
    const identifier = getProjectIdentifier(normalized);
    if (!identifier) return;
    const key = `${source}::${identifier}`;
    if (visited.has(key)) return;
    visited.add(key);
    queue.push({ value: normalized, source });
  };

  const registerParentCandidate = (candidate: any) => {
    const normalized = normalizeProjectRef(candidate);
    if (!normalized) return;
    const identifier = getProjectIdentifier(normalized);
    if (!identifier) return;
    const existing = lookup.get(identifier);
    lookup.set(identifier, existing ? { ...existing, ...normalized } : normalized);
    enqueue(normalized, 'parent');
  };

  enqueue(project, 'root');

  while (queue.length) {
    const { value } = queue.shift()!;
    if (!value || typeof value !== 'object') continue;

    if (Array.isArray(value?.childProjects)) value.childProjects.forEach((sub: any) => enqueue(sub, 'sub'));
    if (Array.isArray(value?.parentProjects)) value.parentProjects.forEach((parent: any) => registerParentCandidate(parent));
  }

  const rootIdentifier = getProjectIdentifier(project);
  if (rootIdentifier) lookup.delete(rootIdentifier);

  return lookup;
};

// ---- Proje kaydı (hierarchy) ----
const registerProject = (builder: ChartGraphBuilder, project: any, options: RegisterProjectOptions): string | undefined => {
  const identifier = getProjectIdentifier(project);
  if (!identifier) return undefined;
  const nodeId = `project-${identifier}`;
  const nodeType = options.nodeType ?? (collectParentRefs(project).length ? 'project' : 'program');

  builder.upsertNode({ id: nodeId, data: createProjectMeta(project, { nodeType, isCurrent: options.isCurrent }) });

  if (options.isCurrent) builder.currentNodeId = nodeId;

  const alreadyVisited = options.visited.has(nodeId);
  if (!alreadyVisited) {
    options.visited.add(nodeId);
    if (Array.isArray(project?.tasks)) project.tasks.forEach((task: any) => registerTask(builder, task, nodeId));
  }

  if (Array.isArray(project?.childProjects)) {
    project.childProjects.forEach((sub: any) => {
      const childId = registerProject(builder, sub, { nodeType: 'subproject', visited: options.visited });
      if (childId) builder.addEdge(nodeId, childId);
    });
  }

  builder.queueParentLinks(nodeId, collectParentRefs(project));
  return nodeId;
};

// ---- Graph kurucular ----
const buildOrganizationChartGraph = (project: any): ChartGraphResult => {
  const builder = new ChartGraphBuilder();

  if (!project) {
    builder.upsertNode({ id: 'empty-project', data: { label: 'Veri yok', name: 'Organizasyon için veri tanımlı değil', type: 'project' } as ChartNodeMeta });
    return builder.toResult();
  }

  const parentLookup = buildParentLookup(project);
  const visitedProjects = new Set<string>();

  parentLookup.forEach((parentProject) => {
    registerProject(builder, parentProject, { visited: visitedProjects });
  });

  registerProject(builder, project, { visited: visitedProjects, isCurrent: true, nodeType: collectParentRefs(project).length ? 'project' : 'program' });

  builder.resolveParentLinks((rawId) => parentLookup.get(rawId));

  return builder.toResult();
};

const collectAncestors = (graph: ChartGraphResult, startId?: string): Set<string> => {
  const result = new Set<string>();
  if (!startId) return result;

  const stack = [...(graph.parents.get(startId) ?? [])];
  while (stack.length) {
    const nodeId = stack.pop()!;
    if (result.has(nodeId)) continue;
    result.add(nodeId);

    const parents = graph.parents.get(nodeId);
    if (parents) parents.forEach((parentId) => stack.push(parentId));
  }

  return result;
};

const collectDescendants = (graph: ChartGraphResult, startId?: string): Set<string> => {
  const result = new Set<string>();
  if (!startId) return result;

  const stack = [...(graph.children.get(startId) ?? [])];
  while (stack.length) {
    const nodeId = stack.pop()!;
    if (result.has(nodeId)) continue;
    result.add(nodeId);

    const children = graph.children.get(nodeId);
    if (children) children.forEach((childId) => stack.push(childId));
  }

  return result;
};

const buildDisplayGraphData = (graph: ChartGraphResult, expandedOriginIds: Set<string>): DisplayGraphData => {
  const originToDisplays = new Map<string, string[]>();
  const primaryDisplayIds = new Map<string, string>();
  const expandedDisplayIds = new Set<string>();
  const primaryParent = new Map<string, string | undefined>();
  const displayNodes = new Map<string, G6NodeData>();

  const assignPrimaryParents = (startIds: string[]) => {
    const queue: string[] = [];
    startIds.forEach((startId) => {
      if (!graph.nodes.has(startId)) return;
      if (!primaryParent.has(startId)) {
        primaryParent.set(startId, undefined);
        queue.push(startId);
      }
    });

    while (queue.length) {
      const parentId = queue.shift()!;
      const childSet = graph.children.get(parentId);
      if (!childSet) continue;
      childSet.forEach((childId) => {
        if (!graph.nodes.has(childId)) return;
        if (!primaryParent.has(childId)) {
          primaryParent.set(childId, parentId);
          queue.push(childId);
        }
      });
    }
  };

  const roots: string[] = [];
  graph.nodes.forEach((_, nodeId) => { if ((graph.parents.get(nodeId)?.size ?? 0) === 0) roots.push(nodeId); });
  if (!roots.length && graph.currentNodeId) roots.push(graph.currentNodeId);
  if (!roots.length) roots.push(...Array.from(graph.nodes.keys()));

  assignPrimaryParents(roots);

  graph.nodes.forEach((_, nodeId) => { if (!primaryParent.has(nodeId)) assignPrimaryParents([nodeId]); });

  graph.nodes.forEach((node, originId) => {
    const data = { ...node.data, originId } as unknown as Record<string, unknown>;
    const displayNode: G6NodeData = { id: originId, data };
    displayNodes.set(originId, displayNode);
    originToDisplays.set(originId, [originId]);
    primaryDisplayIds.set(originId, originId);
    if (expandedOriginIds.has(originId)) expandedDisplayIds.add(originId);
  });

  primaryParent.forEach((parentId, childId) => {
    if (!parentId) return;
    const parentNode = displayNodes.get(parentId);
    const childNode = displayNodes.get(childId);
    if (!parentNode || !childNode) return;
    const children = Array.isArray(parentNode.children) ? [...(parentNode.children as string[])] : [];
    children.push(childId);
    parentNode.children = children;
  });

  displayNodes.forEach((node, originId) => {
    if (Array.isArray(node.children) && node.children.length) node.style = { ...(node.style ?? {}), collapsed: !expandedOriginIds.has(originId) } as any;
  });

  const edges: EdgeData[] = [];
  let edgeIndex = 0;

  primaryParent.forEach((parentId, childId) => {
    if (!parentId) return;
    edges.push({ id: `edge-${parentId}-${childId}-${edgeIndex++}`, source: parentId, target: childId });
  });

  const seenExtra = new Set<string>();
  graph.parents.forEach((parentSet, childId) => {
    parentSet.forEach((parentId) => {
      if (primaryParent.get(childId) === parentId) return;
      if (!displayNodes.has(parentId) || !displayNodes.has(childId)) return;
      const key = `${parentId}-${childId}`;
      if (seenExtra.has(key)) return;
      seenExtra.add(key);
      edges.push({ id: `edge-extra-${key}-${edgeIndex++}`, source: parentId, target: childId, style: { stroke: '#94a3b8', lineDash: [6, 4], endArrow: true, opacity: 0.8 } as any });
    });
  });

  return { graphData: { nodes: Array.from(displayNodes.values()), edges }, originToDisplays, primaryDisplayIds, expandedDisplayIds };
};

// ---- Ana bileşen ----
const ProjectOrganizationDiagram = ({ project }: ProjectOrganizationDiagramProps) => {
  const chartGraph = useMemo(() => buildOrganizationChartGraph(project), [project]);
  const currentNodeId = chartGraph.currentNodeId;
  const focusPathCandidates = project?.focusPathCandidates;
  const graphRef = useRef<any>(null);

  const ancestors = useMemo(() => collectAncestors(chartGraph, currentNodeId), [chartGraph, currentNodeId]);
  const descendants = useMemo(() => collectDescendants(chartGraph, currentNodeId), [chartGraph, currentNodeId]);

  const expandedOriginIds = useMemo(() => {
    const expanded = new Set<string>();
    ancestors.forEach((id) => expanded.add(id));
    if (currentNodeId) expanded.add(currentNodeId);
    descendants.forEach((id) => expanded.add(id));
    if (Array.isArray(focusPathCandidates)) {
      focusPathCandidates.forEach((path: any) => {
        if (!Array.isArray(path)) return;
        path.forEach((ref) => { const nodeId = makeProjectNodeId(ref); if (nodeId) expanded.add(nodeId); });
      });
    }
    return expanded;
  }, [ancestors, descendants, currentNodeId, focusPathCandidates]);

  const displayGraph = useMemo(() => buildDisplayGraphData(chartGraph, expandedOriginIds), [chartGraph, expandedOriginIds]);
  const baseData = displayGraph.graphData;
  const expandedDisplayIds = displayGraph.expandedDisplayIds;

  const applyPathExpansion = useCallback((graph: any) => {
    if (!graph) return;
    try {
      const nodes = graph.getNodes?.() ?? [];
      let changed = false;
      nodes.forEach((node: any) => {
        const model = node.getModel?.() ?? {};
        const nodeId = model.id;
        if (!nodeId) return;
        const hasChildren = Array.isArray(model.children) && model.children.length > 0;
        if (!hasChildren) return;
        const targetCollapsed = !expandedDisplayIds.has(nodeId);
        const currentCollapsed = model?.style?.collapsed === true;
        if (currentCollapsed === targetCollapsed) return;
        try { targetCollapsed ? graph.collapseElement?.(nodeId) : graph.expandElement?.(nodeId); } catch {}
        try { const nextStyle = { ...(model.style ?? {}), collapsed: targetCollapsed }; graph.updateItem?.(node, { style: nextStyle }); } catch {}
        changed = true;
      });
      if (changed) { graph.layout?.(); graph.fitView?.({ padding: 24 }); }
    } catch {}
  }, [expandedDisplayIds]);

  useEffect(() => {
    const graph = (graphRef as any).current;
    if (!graph) return;
    applyPathExpansion(graph);
  }, [applyPathExpansion, baseData]);

  const config = useMemo<OrganizationChartOptions>(() => ({
    data: baseData,
    direction: 'vertical',
    animate: false,
    animation: false,
    layout: { type: 'dagre', rankdir: 'TB', ranksep: 80, nodesep: 32 },
    node: { type: 'react', style: { size: [320, 168], component: (datum: G6NodeData) => <ProjectNodeCard datum={datum} /> } },
    edge: { type: 'polyline', style: { stroke: '#cbd5f5', lineWidth: 1.4, endArrow: true } as any },
    behaviors: ['drag-canvas', 'zoom-canvas',     'drag-element'],
    containerStyle: { width: '100%', height: 740 },
    autoFit: { type: 'view' },
    fitCenter: true,
    transforms: [
      'translate-react-node-origin',
      {
        type: 'collapse-expand-react-node',
        trigger: 'icon',
        direction: 'out',
        iconType: 'plus-minus',
        iconPlacement: 'bottom',
        iconOffsetX: 8,
        iconOffsetY: 0,
        enable: (model: any) => Array.isArray(model?.children) && model.children.length > 0,
        refreshLayout: true,
        onChange: (item: any, collapsed: boolean, graph: any) => {
          try { const model = item?.getModel?.() ?? {}; const nextStyle = { ...(model.style ?? {}), collapsed }; graph.updateItem(item, { style: nextStyle }); } catch {}
          setTimeout(() => { try { graph.layout(); graph.fitView?.({ padding: 24 }); } catch {} }, 0);
          return true;
        },
      } as any,
    ],
    onReady: (graph: any) => { (graphRef as any).current = graph; },
  }), [baseData, expandedDisplayIds]);

  

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="border-b border-slate-200 px-6 py-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Organizasyon Şeması</h2>
          <p className="text-sm text-slate-500">Program, proje, görev ve ekip ağacının tamamı</p>
        </div>
      </div>
      <div className="px-4 py-4">
        <OrganizationChart {...config} />
      </div>
    </div>
  );
};

export default ProjectOrganizationDiagram;