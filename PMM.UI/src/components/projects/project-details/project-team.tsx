import { Avatar, Card, Empty, Space, Tag, Tooltip } from "antd";
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

export const ProjectTeamCard = ({ assignedUsers, isLoading = false }: ProjectTeamProps) => {
  const hasUsers = assignedUsers && assignedUsers.length > 0;

  return (
    <Card
      title="Proje Ekibi"
      loading={isLoading}
    >
      {!hasUsers ? (
        <Empty
          description="Ekip üyesi bulunmamaktadır"
        />
      ) : (
        <div className="space-y-3">
          {assignedUsers!.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  size={40}
                  src={undefined}
                  style={{
                    backgroundColor: `hsl(${assignment.userId * 137.5}, 70%, 60%)`,
                  }}
                >
                  {assignment.user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">
                    {assignment.user?.name || "Bilinmiyor"}
                  </p>
                  <Space size="small" className="text-xs">
                    <Tag color={getRoleColor(assignment.role)}>
                      {getRoleLabel(assignment.role)}
                    </Tag>
                  </Space>
                </div>
              </div>

              <div className="text-right">
                {assignment.expectedHours && (
                  <Tooltip title="Beklenen saat">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">{assignment.expectedHours}</span>
                      <span className="text-gray-400 ml-1">saat</span>
                    </div>
                  </Tooltip>
                )}
                {assignment.spentHours && (
                  <Tooltip title="Harcanan saat">
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="text-blue-600 font-medium">{assignment.spentHours}</span>
                      <span className="text-gray-400 ml-1">harcandı</span>
                    </div>
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ProjectTeamCard;
