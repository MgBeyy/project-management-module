import { Modal, Form, Input, DatePicker, Button, Space } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { createActivity } from "@/services/activities/create-activity";
import { updateActivity } from "@/services/activities/update-activity";
import { useActivitiesStore } from "@/store/zustand/activities-store";
import dayjs, { Dayjs } from "dayjs";
import UserSelect from "../user-select";
import TaskSelect from "../task-select";
import DeleteActivityModal from "./delete-activity-modal";
import type { ActivityDto } from "@/types";

const { TextArea } = Input;

type ActivityModalMode = "create" | "edit" | "view";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const selectedUser = Form.useWatch("userId", form);
  const previousSelectedUserRef = useRef<number | null | undefined>(undefined);

  const isViewMode = currentMode === "view";
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

    if (activity && (isViewMode || isEditMode)) {
      // Load existing activity data
      form.setFieldsValue({
        taskId: activity.taskId,
        userId: activity.userId,
        description: activity.description,
        startTime: activity.startTime ? dayjs(activity.startTime) : null,
        endTime: activity.endTime ? dayjs(activity.endTime) : null,
      });
    } else if (isCreateMode) {
      // Set initial values for create mode
      form.setFieldsValue({
        startTime: initialDate || dayjs(),
        endTime: initialEndDate || (initialDate ? initialDate.add(1, "hour") : dayjs().add(1, "hour")),
        userId: selectedUserId || undefined,
      });
    }
  }, [visible, activity, isViewMode, isEditMode, isCreateMode, initialDate, initialEndDate, selectedUserId, form]);

  // Reset task when user changes
  useEffect(() => {
    if (!visible) {
      previousSelectedUserRef.current = undefined;
      return;
    }

    const normalizedSelected = selectedUser ?? null;

    if (previousSelectedUserRef.current === undefined) {
      previousSelectedUserRef.current = normalizedSelected;
      return;
    }

    if (previousSelectedUserRef.current !== normalizedSelected) {
      form.setFieldsValue({ taskId: undefined });
      previousSelectedUserRef.current = normalizedSelected;
    }
  }, [selectedUser, visible, form]);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const activityData = {
        taskId: values.taskId,
        userId: values.userId,
        description: values.description,
        startTime: values.startTime.valueOf(),
        endTime: values.endTime.valueOf(),
      };

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

  const handleEdit = () => {
    setCurrentMode("edit");
  };

  const handleClose = () => {
    form.resetFields();
    previousSelectedUserRef.current = undefined;
    setCurrentMode(mode);
    onClose();
  };

  const getTitle = () => {
    if (isCreateMode) return "Yeni Etkinlik Oluştur";
    if (isEditMode) return `Etkinlik Düzenle (#${activity?.id ?? ""})`;
    return `Etkinlik Detayı (#${activity?.id ?? ""})`;
  };

  const getFooter = () => {
    if (isViewMode) {
      return (
        <Space>
          <Button onClick={handleClose}>İptal</Button>
          <Button danger onClick={handleDelete}>
            Sil
          </Button>
          <Button type="primary" onClick={handleEdit}>
            Düzenle
          </Button>
        </Space>
      );
    }

    if (isEditMode || isCreateMode) {
      return (
        <Space>
          <Button onClick={handleClose}>İptal</Button>
          <Button type="primary" onClick={() => form.submit()} loading={isSubmitting}>
            {isCreateMode ? "Oluştur" : "Güncelle"}
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
      className={isViewMode ? "activity-modal-view-mode" : ""}
    >
      <style>{`
        .activity-modal-view-mode .ant-select-disabled.ant-select:not(.ant-select-customize-input) .ant-select-selector,
        .activity-modal-view-mode .ant-input-disabled,
        .activity-modal-view-mode .ant-picker-disabled {
          color: rgba(0, 0, 0, 0.88) !important;
          background-color: #ffffff !important;
          cursor: default !important;
          border-color: #d9d9d9 !important;
        }
        .activity-modal-view-mode .ant-select-disabled .ant-select-arrow {
          display: none;
        }
        .activity-modal-view-mode .ant-picker-disabled .ant-picker-suffix {
          display: none;
        }
      `}</style>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>


        <Form.Item
          label="Kullanıcı"
          name="userId"
          rules={[{ required: true, message: "Kullanıcı seçimi gereklidir" }]}
        >
          <UserSelect
            placeholder="Kullanıcı ara ve seç..."
            style={{ width: "100%" }}
            disabled={isViewMode}
          />
        </Form.Item>
        <Form.Item
          label="Görev"
          name="taskId"
          rules={[{ required: true, message: "Görev seçimi gereklidir" }]}
        >
          <TaskSelect
            placeholder={selectedUser ? "Görev ara ve seç..." : "Önce kullanıcı seçin..."}
            style={{ width: "100%" }}
            disabled={isViewMode || !selectedUser}
            assignedUserId={selectedUser}
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
            readOnly={isViewMode}
            style={{ cursor: isViewMode ? "default" : "text" }}
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
            disabled={isViewMode}
            inputReadOnly={isViewMode}
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
            disabled={isViewMode}
            inputReadOnly={isViewMode}
          />
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
