import { Avatar, Empty, Space, Tag, Tooltip } from "antd";
import { ProjectAssignmentWithUserDto } from "@/types/projects/api";

interface ProjectTeamProps {
  assignedUsers?: ProjectAssignmentWithUserDto[] | null;
  isLoading?: boolean;
}

const getRoleColor = (role?: string): string => {
  switch (role?.toLowerCase()) {
    case "manager":
      return "red";
    case "reviewer":
      return "orange";
    case "member":
      return "blue";
    default:
      return "default";
  }
};

const getRoleLabel = (role?: string): string => {
  switch (role?.toLowerCase()) {
    case "manager":
      return "Yönetici";
    case "reviewer":
      return "Gözlemci";
    case "member":
      return "Üye";
    default:
      return role || "Bilinmiyor";
  }
};

export const ProjectTeamCard = ({ assignedUsers }: ProjectTeamProps) => {
  const hasUsers = assignedUsers && assignedUsers.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">Proje Ekibi</h3>
      </div>
      {!hasUsers ? (
        <div className="p-6">
          <Empty
            description="Ekip üyesi bulunmamaktadır"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <div className="p-6 space-y-3">
          {assignedUsers!.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  size={40}
                  src={undefined}
                  className="bg-blue-100 text-blue-600 font-semibold"
                  style={{
                    backgroundColor: `hsl(${assignment.userId * 137.5}, 70%, 90%)`,
                    color: `hsl(${assignment.userId * 137.5}, 70%, 30%)`
                  }}
                >
                  {assignment.user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900 text-sm">
                    {assignment.user?.name || "Bilinmiyor"}
                  </p>
                  <Space size="small" className="text-xs">
                    <Tag className="mr-0" color={getRoleColor(assignment.role)}>
                      {getRoleLabel(assignment.role)}
                    </Tag>
                  </Space>
                </div>
              </div>

              <div className="text-right">
                {assignment.expectedHours && (
                  <Tooltip title="Beklenen saat">
                    <div className="text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{assignment.expectedHours}</span>h
                    </div>
                  </Tooltip>
                )}
                {assignment.spentHours && (
                  <Tooltip title="Harcanan saat">
                    <div className="text-xs text-slate-500 mt-1">
                      <span className="text-blue-600 font-medium">{assignment.spentHours}</span>h
                    </div>
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectTeamCard;
