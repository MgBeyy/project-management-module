import { useMemo } from "react";
import { Tree, Tag, Progress } from "antd";
import type { TreeDataNode } from "antd";
import type { ProjectHierarchyDto } from "@/types/projects/api";
import type { TaskDto } from "@/types/tasks";


const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  inactive: "Pasif",
  completed: "Tamamlandı",
  planned: "Planlandı",
  waitingforapproval: "Onay Bekliyor",
  todo: "Yapılacak",
  inprogress: "Devam Ediyor",
  done: "Bitti",
  waiting: "Beklemede",
};

const PRIORITY_LABEL: Record<string, string> = {
  low: "Düşük",
  regular: "Normal",
  high: "Yüksek",
};

const statusColor = (status?: string) => {
  if (!status) return "default" as const;
  const s = status.toLowerCase();
  if (s.includes("active")) return "green" as const;
  if (s.includes("inactive")) return "default" as const;
  if (s.includes("completed")) return "blue" as const;
  if (s.includes("planned")) return "cyan" as const;
  if (s.includes("waiting")) return "orange" as const;
  return "default" as const;
};

const priorityColor = (priority?: string) => {
  if (!priority) return "default" as const;
  const p = priority.toLowerCase();
  if (p.includes("high")) return "red" as const;
  if (p.includes("regular")) return "orange" as const;
  return "green" as const; // low/other
};

const getStatusLabel = (status?: string) =>
  status ? STATUS_LABEL[status.toLowerCase()] ?? status : "Bilinmiyor";

const getPriorityLabel = (priority?: string) =>
  priority ? PRIORITY_LABEL[priority.toLowerCase()] ?? priority : "Bilinmiyor";

// ------------------------------
// Generic helpers
// ------------------------------
const toPercent = (planned?: number | null, actual?: number | null) => {
  const p = planned ?? 0;
  const a = actual ?? 0;
  if (p <= 0) return 0;
  const pct = Math.round((a / p) * 100);
  return Math.max(0, Math.min(100, pct));
};

const ProgressTiny = ({ percent }: { percent: number }) => (
  <div className="flex items-center gap-1">
    <Progress
      type="circle"
      percent={percent}
      width={24}
      strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
    />
  </div>
);

// ------------------------------
// Title renderers
// ------------------------------
const ProjectBadge = ({ text = "Proje" }: { text?: string }) => (
  <span className="text-xs text-gray-400 ml-2 font-normal">{text}</span>
);

const TaskBadge = () => <ProjectBadge text="Görev" />;

const ProjectTitle = ({
  project,
  isCurrent,
  showPriority = true,
}: {
  project: ProjectHierarchyDto;
  isCurrent?: boolean;
  showPriority?: boolean;
}) => {
  const percent = toPercent(project.plannedHours, project.actualHours);
  return (
    <div className={`flex items-center gap-2 py-1 px-2 rounded ${isCurrent ? "bg-blue-100" : ""}`}>
      {/* Left side: identifiers and tags */}
      <div className="flex items-center gap-2">
        <span className={`font-medium ${isCurrent ? "text-blue-700" : "text-gray-900"}`}>{project.code}</span>
        <span className={isCurrent ? "text-blue-600" : "text-gray-600"}>{project.title}</span>
        <Tag color={statusColor(project.status)} className="text-xs">{getStatusLabel(project.status)}</Tag>
        {showPriority && (
          <Tag color={priorityColor(project.priority)} className="text-xs">{getPriorityLabel(project.priority)}</Tag>
        )}
      </div>
      {/* Right side: progress + badge */}
      <div className="ml-auto flex items-center gap-2">
        {percent > 0 && <ProgressTiny percent={percent} />}
        <ProjectBadge />
      </div>
    </div>
  );
};

const TaskTitle = ({ task }: { task: TaskDto }) => {
  const percent = toPercent(task.plannedHours, task.actualHours);
  return (
    <div className="flex items-center gap-2 py-1 px-2 rounded">
      {/* Left side: identifiers and tags */}
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-900">{task.code}</span>
        <span className="text-gray-600">{task.title}</span>
        <Tag color={statusColor(task.status)} className="text-xs">{getStatusLabel(task.status)}</Tag>
      </div>
      {/* Right side: progress + badge */}
      <div className="ml-auto flex items-center gap-2">
        {percent > 0 && <ProgressTiny percent={percent} />}
        <TaskBadge />
      </div>
    </div>
  );
};

// ------------------------------
// Tree builders
// ------------------------------
const buildTaskNode = (task: TaskDto): TreeDataNode => {
  const children = (task.subTasks ?? []).map(buildTaskNode);
  return {
    title: <TaskTitle task={task} />,
    key: `task-${task.id}`,
    children: children.length ? children : undefined,
  };
};

const buildProjectNode = (project: ProjectHierarchyDto, currentProjectId?: number): TreeDataNode => {
  const children: TreeDataNode[] = [];

  // child projects
  (project.childProjects ?? []).forEach((child) => {
    children.push(buildProjectNode(child, currentProjectId));
  });

  // tasks
  (project.tasks ?? []).forEach((t) => children.push(buildTaskNode(t)));

  return {
    title: <ProjectTitle project={project} isCurrent={project.id === currentProjectId} />,
    key: project.id?.toString(),
    children: children.length ? children : undefined,
  };
};

// Handles the optional parent "family" structure.
const buildTreeNodesWithParents = (projects: ProjectHierarchyDto[], currentProjectId?: number): TreeDataNode[] => {
  return projects.map((project) => {
    const parents = project.parentProjects ?? [];

    if (!parents.length) return buildProjectNode(project, currentProjectId);

    // Build parent nodes (no recursion needed per original behavior)
    const parentNodes: TreeDataNode[] = parents.map((parent) => {
      const percent = toPercent(parent.plannedHours, parent.actualHours);
      return {
        title: (
          <div className="flex items-center gap-2 py-1 px-2 rounded">
            {/* Left: identifiers and tags */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{parent.code}</span>
              <span className="text-gray-600">{parent.title}</span>
              <Tag color={statusColor(parent.status)} className="text-xs">{getStatusLabel(parent.status)}</Tag>
              <Tag color={priorityColor(parent.priority)} className="text-xs">{getPriorityLabel(parent.priority)}</Tag>
            </div>
            {/* Right: progress + badge */}
            <div className="ml-auto flex items-center gap-2">
              {percent > 0 && <ProgressTiny percent={percent} />}
              <ProjectBadge />
            </div>
          </div>
        ),
        key: `parent-${parent.id}`,
        children: [],
      };
    });

    if (parentNodes.length === 1) {
      // single parent -> current project is its child
      parentNodes[0].children = [buildProjectNode(project, currentProjectId)];
    } else if (parentNodes.length > 1) {
      // multiple parents -> show an indented current project row, then its children
      const currentNode = buildProjectNode(project, currentProjectId);
      const indentedTitle = (
        <div className="pl-3">
          <ProjectTitle project={project} isCurrent={project.id === currentProjectId} showPriority />
        </div>
      );

      parentNodes.push({
        title: indentedTitle,
        key: `spacer-${project.id}`,
        children: currentNode.children,
      });
    }

    return {
      title: (
        <div className="flex items-center gap-2 py-1 px-2 rounded text-gray-500">
          <span className="text-xs">Proje Ailesi</span>
        </div>
      ),
      key: `family-${project.id}`,
      children: parentNodes,
    } as TreeDataNode;
  });
};

// ------------------------------
// Component
// ------------------------------
export const ProjectHierarchyTree = ({
  projectHierarchy,
  currentProjectId,
}: {
  projectHierarchy?: ProjectHierarchyDto;
  currentProjectId?: number;
}) => {
  const treeData = useMemo<TreeDataNode[]>(() => {
    if (!projectHierarchy) return [];
    const list = Array.isArray(projectHierarchy) ? projectHierarchy : [projectHierarchy];
    if (!list.length) return [];
    return buildTreeNodesWithParents(list, currentProjectId);
  }, [projectHierarchy, currentProjectId]);

  if (!treeData.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 text-center text-gray-500">
        <p>Gösterilecek proje hiyerarşisi bulunmamaktadır.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Proje Ağacı</h2>
      <div className="max-h-96 overflow-y-auto">
        <Tree treeData={treeData} defaultExpandAll showIcon={false} blockNode />
      </div>
    </div>
  );
};

export default ProjectHierarchyTree;
