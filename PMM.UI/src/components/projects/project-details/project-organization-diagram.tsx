import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import type { GraphData, EdgeData, NodeData as G6NodeData } from '@antv/g6';
import { OrganizationChart } from '@ant-design/graphs';
import type { OrganizationChartOptions } from '@ant-design/graphs';

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
}

interface ChartNode {
  id: string;
  data: ChartNodeMeta;
  children?: ChartNode[];
}

interface ProjectOrganizationDiagramProps {
  project: any;
}

const NODE_TYPE_CONFIG: Record<ChartNodeType, { color: string; title: string }> = {
  program: { color: '#2563eb', title: 'Program' },
  project: { color: '#2563eb', title: 'Proje' },
  subproject: { color: '#2563eb', title: 'Alt Proje' },
  task: { color: '#f97316', title: 'Gorev' },
  subtask: { color: '#f97316', title: 'Alt Gorev' },
  activity: { color: '#f97316', title: 'Aktivite' },
};

const ProjectNodeCard = ({ datum }: { datum: G6NodeData }) => {
  const meta = (datum?.data ?? {}) as unknown as ChartNodeMeta;
  const config = NODE_TYPE_CONFIG[meta.type || 'project'];
  const metrics: Array<{ label: string; value: string }> = [];

  if (meta.priority) metrics.push({ label: 'Oncelik', value: meta.priority });
  if (meta.progress !== undefined) metrics.push({ label: 'Ilerleme', value: `${meta.progress}%` });
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
  const baseShadow = '0 14px 30px rgba(15, 23, 42, 0.08)';
  const highlightShadow = `0 20px 40px rgba(15, 23, 42, 0.16), 0 0 0 4px ${accentColor}33`;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 16,
        background: meta.isCurrent ? 'linear-gradient(180deg, #f8fafc 0%, #ffffff 80%)' : '#ffffff',
        border: `${borderWidth}px solid ${accentColor}`,
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

const buildSubtaskNode = (subtask: any): ChartNode => ({
  id: `subtask-${subtask.id}`,
  data: { label: subtask.title, name: subtask.status, status: subtask.status, type: 'subtask' },
});

const buildTaskNode = (task: any): ChartNode => {
  const children: ChartNode[] = [];
  if (Array.isArray(task.subtasks) && task.subtasks.length) {
    children.push(...task.subtasks.map((sub: any) => buildSubtaskNode(sub)));
  }
  return {
    id: `task-${task.id}`,
    data: {
      label: task.title,
      name: task.assignee,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      progress: toProgress(task.estimatedHours, task.loggedHours),
      estimatedHours: task.estimatedHours,
      loggedHours: task.loggedHours,
      type: 'task',
    },
    ...(children.length ? { children } : {}),
  };
};

interface BuildProjectNodeOptions {
  nodeType?: ChartNodeType;
  isCurrent?: boolean;
  extraChildren?: ChartNode[];
}

const buildProjectNode = (project: any, options: BuildProjectNodeOptions = {}) => {
  const { nodeType, isCurrent = false, extraChildren = [] } = options;
  const children: ChartNode[] = [];

  if (Array.isArray(project.subprojects) && project.subprojects.length) {
    children.push(...project.subprojects.map((sub: any) => buildProjectNode(sub, { nodeType: 'subproject' })));
  }

  if (Array.isArray(project.tasks) && project.tasks.length) {
    children.push(...project.tasks.map((task: any) => buildTaskNode(task)));
  }

  const combined = [...extraChildren, ...children];
  const deduped: ChartNode[] = [];
  const seen = new Set<string>();
  combined.forEach((child) => {
    if (!seen.has(child.id)) {
      deduped.push(child);
      seen.add(child.id);
    }
  });

  const projectId = project?.id ?? project?.code ?? 'root';

  return {
    id: `project-${projectId}`,
    data: {
      label: project.code || `PRJ-${projectId}`,
      name: project.name,
      type: nodeType ?? (project.parentProject ? 'project' : 'program'),
      status: project.status,
      priority: project.priority,
      progress: typeof project.progress === 'number' ? project.progress : undefined,
      startDate: project.startDate,
      endDate: project.endDate,
      owner: project.members?.[0]?.name,
      isCurrent,
    },
    ...(deduped.length ? { children: deduped } : {}),
  } as ChartNode;
};

const buildOrganizationChartData = (project: any): ChartNode => {
  if (!project) {
    return { id: 'empty-project', data: { label: 'Veri yok', name: 'Organizasyon icin veri tanimli degil', type: 'project' } as any };
  }

  let assembled = buildProjectNode(project, { nodeType: project.parentProject ? 'project' : 'program', isCurrent: true });
  let cursor = project.parentProject;
  while (cursor) {
    assembled = buildProjectNode(cursor, { nodeType: cursor.parentProject ? 'project' : 'program', extraChildren: [assembled] });
    cursor = cursor.parentProject;
  }
  return assembled;
};

/** Kökten current düğüme giden yolu bulur */
const findPathTo = (root: ChartNode, targetId?: string): ChartNode[] | null => {
  if (!targetId) return null;
  const stack: { node: ChartNode; path: ChartNode[] }[] = [{ node: root, path: [root] }];
  while (stack.length) {
    const { node, path } = stack.pop()!;
    if (node.id === targetId) return path;
    node.children?.forEach((ch) => stack.push({ node: ch, path: [...path, ch] }));
  }
  return null;
};

/** expandedIds içerisinde olanlar açık, diğer çocuklu düğümler kapalı başlar */
const convertToGraphData = (root: ChartNode, expandedIds: Set<string>): GraphData => {
  const nodes: G6NodeData[] = [];
  const edges: EdgeData[] = [];

  const walk = (node: ChartNode) => {
    const children = node.children ?? [];
    const childIds = children.map((c) => c.id);
    const isExpanded = expandedIds.has(node.id) || Boolean(node.data?.isCurrent);

    nodes.push({
      id: node.id,
      data: node.data as unknown as Record<string, unknown>,
      children: childIds.length ? childIds : undefined,
      ...(childIds.length ? { collapsed: !isExpanded } : {}),
    } as unknown as G6NodeData);

    children.forEach((child) => {
      edges.push({ id: `${node.id}-${child.id}`, source: node.id, target: child.id });
      walk(child);
    });
  };

  walk(root);
  return { nodes, edges };
};

const ProjectOrganizationDiagram = ({ project }: ProjectOrganizationDiagramProps) => {
  const chartTree = useMemo(() => buildOrganizationChartData(project), [project]);

  // current id ve yol
  const currentNodeId = useMemo(() => {
    const dfs = (n: ChartNode): string | undefined => {
      if (n.data?.isCurrent) return n.id;
      for (const c of n.children ?? []) {
        const h = dfs(c);
        if (h) return h;
      }
      return undefined;
    };
    return dfs(chartTree);
  }, [chartTree]);

  const pathExpanded = useMemo(() => {
    const s = new Set<string>();
    if (currentNodeId) {
      (findPathTo(chartTree, currentNodeId) || []).forEach((n) => s.add(n.id));
    }
    s.add(chartTree.id); // kök
    return s;
  }, [chartTree, currentNodeId]);

  // İlk veri (current’a kadar açık)
  const baseData = useMemo<GraphData>(() => convertToGraphData(chartTree, pathExpanded), [chartTree, pathExpanded]);

  const graphRef = useRef<any>(null);

  const config = useMemo<OrganizationChartOptions>(
    () => ({
      data: baseData,
      direction: 'vertical',
      layout: { type: 'dagre', rankdir: 'TB', ranksep: 80, nodesep: 32 },
      node: {
        type: 'react',
        style: { size: [320, 168], component: (datum: G6NodeData) => <ProjectNodeCard datum={datum} /> },
      },
      edge: { type: 'polyline', style: { stroke: '#cbd5f5', lineWidth: 1.4, endArrow: true } },

      // Düğüm başında ikon (buton) ile aç/kapa
      behaviors: [
        'drag-canvas',
        'zoom-canvas'
      ],

      containerStyle: { width: '100%', height: 740 },
      autoFit: { type: 'view' },
      fitCenter: true,
      transforms: [
        'translate-react-node-origin',
        {
          type: 'collapse-expand-react-node',
          key: 'collapse-expand-react-node',
          trigger: 'icon',
          iconType: 'plus-minus',
          iconPlacement: 'bottom',
          iconOffsetX: 8,
          iconOffsetY: 0,
          enable: (datum: any) => Array.isArray(datum.children) && datum.children.length > 0,
        },
      ],
      onReady: (graph: any) => {
        graphRef.current = graph;
        const refitAndFocus = () => {
          if (currentNodeId) {
            try {
              graph.focusItem(currentNodeId, false);
            } catch { /* ignore */ }
          }
        };
        graph.on('afterlayout', refitAndFocus);
        refitAndFocus();
      },
    }),
    [baseData, currentNodeId],
  );

  // --- UI ---
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Organizasyon Semasi</h2>
          <p className="text-sm text-slate-500">Program, proje, gorev ve ekip agacinin tamami</p>
        </div>
      </div>

      <div className="px-4 py-4">
        <OrganizationChart {...config} />
      </div>
    </div>
  );
};

export default ProjectOrganizationDiagram;
