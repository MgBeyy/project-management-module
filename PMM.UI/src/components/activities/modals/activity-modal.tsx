import { Modal, Form, Input, DatePicker, Button, Space, Checkbox, Tooltip, Segmented } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { createActivity } from "@/services/activities/create-activity";
import { updateActivity } from "@/services/activities/update-activity";
import { useActivitiesStore } from "@/store/zustand/activities-store";
import dayjs, { Dayjs } from "dayjs";
import UserSelect from "../user-select";
import MachineSelect from "../machine-select";
import TaskSelect from "../task-select";
import DeleteActivityModal from "./delete-activity-modal";
import type { ActivityDto } from "@/types";
import { InfoCircleOutlined, UserOutlined, RobotOutlined } from "@ant-design/icons";
const { TextArea } = Input;

type ActivityModalMode = "create" | "edit";
type ActivityType = "User" | "Machine";

interface ActivityModalProps {
  visible: boolean;
  onClose: () => void;
  mode?: ActivityModalMode;
  activity?: ActivityDto | null;
  initialDate?: Dayjs;
  initialEndDate?: Dayjs;
  selectedUserId?: number | null;
}

export default function ActivityModal({
  visible,
  onClose,
  mode = "create",
  activity,
  initialDate,
  initialEndDate,
  selectedUserId,
}: ActivityModalProps) {
  const notification = useNotification();
  const [form] = Form.useForm();
  const { triggerRefresh } = useActivitiesStore();
  const [currentMode, setCurrentMode] = useState<ActivityModalMode>(mode);
  const [activityType, setActivityType] = useState<ActivityType>("User");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const selectedUser = Form.useWatch("userId", form);
  const selectedMachine = Form.useWatch("machineId", form);

  const previousSelectedUserRef = useRef<number | null | undefined>(undefined);

  const isEditMode = currentMode === "edit";
  const isCreateMode = currentMode === "create";

  // Reset mode when modal opens/closes
  useEffect(() => {
    if (visible) {
      setCurrentMode(mode);
    }
  }, [visible, mode]);

  // Load activity data or initial values
  useEffect(() => {
    if (!visible) return;

    if (activity && isEditMode) {
      // Determine type based on activity data
      if (activity.machineId) {
        setActivityType("Machine");
      } else {
        setActivityType("User");
      }

      // Load existing activity data
      form.setFieldsValue({
        taskId: activity.taskId,
        userId: activity.userId,
        machineId: activity.machineId,
        description: activity.description,
        startTime: activity.startTime ? dayjs(activity.startTime) : null,
        endTime: activity.endTime ? dayjs(activity.endTime) : null,
        isLast: activity.isLast || false,
      });
    } else if (isCreateMode) {
      // Set initial values for create mode
      setActivityType("User");
      form.setFieldsValue({
        startTime: initialDate || dayjs(),
        endTime: initialEndDate || (initialDate ? initialDate.add(1, "hour") : dayjs().add(1, "hour")),
        userId: selectedUserId || undefined,
        machineId: undefined,
        isLast: false,
      });
    }
  }, [visible, activity, isEditMode, isCreateMode, initialDate, initialEndDate, selectedUserId, form]);

  // Reset task when user changes (User mode only)
  useEffect(() => {
    if (!visible || activityType !== "User") {
      previousSelectedUserRef.current = undefined;
      return;
    }

    const normalizedSelected = selectedUser ?? null;

    if (previousSelectedUserRef.current === undefined) {
      previousSelectedUserRef.current = normalizedSelected;
      return;
    }

    // Only reset task if userId actually changed (not just form re-render)
    if (previousSelectedUserRef.current !== normalizedSelected && selectedUser !== undefined) {
      form.setFieldsValue({ taskId: undefined });
      previousSelectedUserRef.current = normalizedSelected;
    }
  }, [selectedUser, visible, form, activityType]);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const activityData: any = {
        taskId: values.taskId,
        description: values.description,
        startTime: values.startTime.valueOf(),
        endTime: values.endTime.valueOf(),
        isLast: values.isLast || false,
      };

      if (activityType === "User") {
        activityData.userId = values.userId;
        activityData.machineId = null;
      } else {
        activityData.machineId = values.machineId;
        activityData.userId = null;
      }

      if (isCreateMode) {
        await createActivity(activityData);
        notification.success("Etkinlik Oluşturuldu", "Etkinlik başarıyla oluşturuldu!");
      } else if (isEditMode && activity) {
        await updateActivity(activity.id, activityData);
        notification.success("Etkinlik Güncellendi", "Etkinlik başarıyla güncellendi!");
      }

      triggerRefresh();
      handleClose();
    } catch (error: any) {
      console.error("Etkinlik işlem hatası:", error);
      if (error.response?.data) {
        console.error("Backend hata detayı:", error.response.data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!activity) return;
    setIsDeleteModalVisible(true);
  };

  const handleClose = () => {
    form.resetFields();
    previousSelectedUserRef.current = undefined;
    setCurrentMode(mode);
    onClose();
  };

  const getTitle = () => {
    if (isCreateMode) return "Yeni Etkinlik Oluştur";
    return `Etkinlik Düzenle (#${activity?.id ?? ""})`;
  };

  const getFooter = () => {
    if (isEditMode) {
      return (
        <Space>
          <Button onClick={handleClose}>İptal</Button>
          <Button danger onClick={handleDelete}>
            Sil
          </Button>
          <Button type="primary" onClick={() => form.submit()} loading={isSubmitting}>
            Güncelle
          </Button>
        </Space>
      );
    }

    if (isCreateMode) {
      return (
        <Space>
          <Button onClick={handleClose}>İptal</Button>
          <Button type="primary" onClick={() => form.submit()} loading={isSubmitting}>
            Oluştur
          </Button>
        </Space>
      );
    }

    return null;
  };

  return (
    <>
      <Modal
        title={getTitle()}
        open={visible}
        onCancel={handleClose}
        footer={getFooter()}
        width={600}
        maskClosable={false}
      >
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <Segmented
            options={[
              { label: 'Kullanıcı', value: 'User', icon: <UserOutlined /> },
              { label: 'Makine', value: 'Machine', icon: <RobotOutlined /> },
            ]}
            value={activityType}
            onChange={(val) => {
              setActivityType(val as ActivityType);
              // Optional: clear relevant fields when switching?
              // form.setFieldsValue({ userId: undefined, machineId: undefined, taskId: undefined });
            }}
            disabled={isEditMode} // Disable switching type in edit mode? Usually safer.
          />
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>

          {activityType === "User" ? (
            <Form.Item
              label="Kullanıcı"
              name="userId"
              rules={[{ required: true, message: "Kullanıcı seçimi gereklidir" }]}
            >
              <UserSelect
                placeholder="Kullanıcı ara ve seç..."
                style={{ width: "100%" }}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="Makine"
              name="machineId"
              rules={[{ required: true, message: "Makine seçimi gereklidir" }]}
            >
              <MachineSelect
                placeholder="Makine ara ve seç..."
                style={{ width: "100%" }}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Görev"
            name="taskId"
            rules={[{ required: true, message: "Görev seçimi gereklidir" }]}
          >
            <TaskSelect
              placeholder={activityType === "User"
                ? (selectedUser ? "Görev ara ve seç..." : "Önce kullanıcı seçin...")
                : "Görev ara ve seç..."
              }
              style={{ width: "100%" }}
              disabled={activityType === "User" ? !selectedUser : !selectedMachine}
              assignedUserId={activityType === "User" ? selectedUser : undefined}
              ignoreUserCheck={activityType === "Machine"}
            />
          </Form.Item>

          <Form.Item
            label="Açıklama"
            name="description"
            rules={[{ required: true, message: "Açıklama gereklidir" }]}
          >
            <TextArea
              rows={4}
              placeholder="Etkinlik açıklaması..."
            />
          </Form.Item>

          <Form.Item
            label="Başlangıç Zamanı"
            name="startTime"
            rules={[{ required: true, message: "Başlangıç zamanı gereklidir" }]}
          >
            <DatePicker
              showTime
              format="DD-MM-YYYY HH:mm"
              style={{ width: "100%" }}
              placeholder="Başlangıç tarihi seçin"
            />
          </Form.Item>

          <Form.Item
            label="Bitiş Zamanı"
            name="endTime"
            rules={[{ required: true, message: "Bitiş zamanı gereklidir" }]}
          >
            <DatePicker
              showTime
              format="DD-MM-YYYY HH:mm"
              style={{ width: "100%" }}
              placeholder="Bitiş zamanı seçin"
            />
          </Form.Item>

          <Form.Item
            name="isLast"
            valuePropName="checked"
          >
            <Checkbox>
              Bu etkinlik ilgili görev için son etkinliktir.
              <Tooltip title="Bir etkinlik son etkinlik olduğunda ilgili görevin statüsü 'onay bekliyor' olarak güncellenir.">
                <InfoCircleOutlined style={{ cursor: "help", marginLeft: "4px" }} />
              </Tooltip>
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {activity && (
        <DeleteActivityModal
          visible={isDeleteModalVisible}
          onClose={() => {
            setIsDeleteModalVisible(false);
            handleClose();
          }}
          activity={activity}
        />
      )}
    </>
  );
}
