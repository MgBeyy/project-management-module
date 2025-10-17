import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { GetActivities } from "../../services/activities/get-activities";
import { useActivitiesStore } from "@/store/zustand/activities-store";
import CreateActivityModal from "./modals/create-activity-modal";
import UpdateActivityModal from "./modals/update-activity-modal";
import DeleteActivityModal from "./modals/delete-activity-modal";
import UserSelect from "./user-select";
import Spinner from "../spinner";

interface TimeSlot {
  date: Dayjs;
  hour: number;
  minute: number;
}

export default function ActivitiesCalendar() {
  const { activities, setActivities, isLoading, setIsLoading, refreshTrigger } =
    useActivitiesStore();
  const [currentWeekStart, setCurrentWeekStart] = useState<Dayjs>(
    dayjs().startOf("week")
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedEndSlot, setSelectedEndSlot] = useState<TimeSlot | null>(null);

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<TimeSlot | null>(null);
  const [selectionRange, setSelectionRange] = useState<{
    start: TimeSlot;
    end: TimeSlot;
  } | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [refreshTrigger, selectedUserId]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await GetActivities({
        query: {
          page: 1,
          pageSize: 1000,
          UserId: selectedUserId || undefined,
        },
      });

      const result = response.result || response;
      const activityData = result.data || [];

      const transformedData = activityData.map((item: any) => ({
        Id: item.id,
        TaskId: item.taskId,
        UserId: item.userId,
        Description: item.description,
        StartTime: item.startTime,
        EndTime: item.endTime,
        TotalHours: item.totalHours,
        CreatedAt: item.createdAt,
        CreatedById: item.createdById,
        UpdatedAt: item.updatedAt,
        UpdatedById: item.updatedById,
      }));

      setActivities(transformedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
      setIsLoading(false);
    }
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(currentWeekStart.subtract(1, "week"));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(currentWeekStart.add(1, "week"));
  };

  const goToToday = () => {
    setCurrentWeekStart(dayjs().startOf("week"));
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(currentWeekStart.add(i, "day"));
    }
    return days;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45]; // 15 dakikalık aralıklar
  const weekDays = getWeekDays();

  // Başlangıç zamanı bu slota denk gelen aktiviteleri getir
  // Eğer aktivite birden fazla güne yayılıyorsa, her günün başında (00:00) tekrar göster
  const getActivitiesStartingInSlot = (date: Dayjs, hour: number, minute: number) => {
    return activities.filter((activity) => {
      const startTime = dayjs(activity.StartTime);
      const endTime = dayjs(activity.EndTime);

      // Aktivitenin başlangıç saati bu slotun içindeyse
      const startsHere = startTime.isSame(date, "day") &&
        startTime.hour() === hour &&
        Math.floor(startTime.minute() / 15) * 15 === minute;
      
      if (startsHere) return true;

      // Eğer aktivite birden fazla güne yayılıyorsa
      if (!startTime.isSame(endTime, "day")) {
        // Bu gün aktivitenin başlangıç ve bitiş tarihleri arasındaysa
        // ve bu slot günün başlangıcı (00:00) ise, aktiviteyi göster
        const isActivityDay = date.isAfter(startTime, "day") && date.isBefore(endTime, "day");
        const isLastDay = date.isSame(endTime, "day") && date.isAfter(startTime, "day");
        const isDayStart = hour === 0 && minute === 0;
        
        if ((isActivityDay || isLastDay) && isDayStart) {
          return true;
        }
      }

      return false;
    });
  };

  // Aktivitenin süresini hesapla (15 dakikalık slot cinsinden)
  // Eğer aktivite birden fazla güne yayılıyorsa, sadece başladığı günün sonuna kadar olan kısmı hesapla
  const getActivityDuration = (activity: any, currentDate: Dayjs) => {
    const startTime = dayjs(activity.StartTime);
    const endTime = dayjs(activity.EndTime);
    
    // Eğer aktivite aynı gün içinde bitiyorsa
    if (startTime.isSame(endTime, "day")) {
      const durationMinutes = endTime.diff(startTime, "minute");
      return Math.max(1, Math.ceil(durationMinutes / 15)); // En az 1 slot
    }
    
    // Aktivite birden fazla güne yayılıyor
    // Başladığı gün için: o günün sonuna kadar
    if (startTime.isSame(currentDate, "day")) {
      const endOfDay = startTime.endOf("day");
      const durationMinutes = endOfDay.diff(startTime, "minute");
      return Math.max(1, Math.ceil(durationMinutes / 15));
    }
    
    // Diğer günler için: tam gün (00:00'dan 23:59'a kadar)
    const startOfDay = currentDate.startOf("day");
    
    // Eğer bu gün aktivitenin son günüyse
    if (endTime.isSame(currentDate, "day")) {
      const durationMinutes = endTime.diff(startOfDay, "minute");
      return Math.max(1, Math.ceil(durationMinutes / 15));
    }
    
    // Ara günler için tam gün
    const fullDayMinutes = 24 * 60;
    return Math.ceil(fullDayMinutes / 15);
  };

  // Kullanıcı ID'sine göre renk üret
  const getUserColor = (userId: number) => {
    const colors = [
      "#1890ff", // blue
      "#52c41a", // green
      "#fa8c16", // orange
      "#eb2f96", // magenta
      "#722ed1", // purple
      "#13c2c2", // cyan
      "#faad14", // gold
      "#f5222d", // red
      "#2f54eb", // geekblue
      "#a0d911", // lime
    ];
    return colors[userId % colors.length];
  };

  // Çakışan aktiviteleri bul ve konum hesapla
  const getActivityPosition = (activity: any, allActivitiesInDay: any[]) => {
    const startTime = dayjs(activity.StartTime);
    const endTime = dayjs(activity.EndTime);

    // Bu aktivite ile çakışan tüm aktiviteleri bul
    const overlappingActivities = allActivitiesInDay.filter((otherActivity) => {
      const otherStart = dayjs(otherActivity.StartTime);
      const otherEnd = dayjs(otherActivity.EndTime);

      // Çakışma kontrolü: Zaman aralıkları kesişiyor mu?
      return (
        startTime.isBefore(otherEnd) && endTime.isAfter(otherStart)
      );
    });

    // Başlangıç zamanına göre sırala
    const sortedActivities = overlappingActivities.sort((a, b) => {
      const aStart = dayjs(a.StartTime).valueOf();
      const bStart = dayjs(b.StartTime).valueOf();
      if (aStart !== bStart) return aStart - bStart;
      // Aynı başlangıç zamanı ise, bitiş zamanına göre
      return dayjs(a.EndTime).valueOf() - dayjs(b.EndTime).valueOf();
    });

    // Her aktivite için uygun bir lane (kolon) bul
    const lanes: any[][] = [];

    for (const act of sortedActivities) {
      const actStart = dayjs(act.StartTime);

      // Mevcut lane'lerden uygun olanı bul
      let placed = false;
      for (let i = 0; i < lanes.length; i++) {
        const lane = lanes[i];
        const lastInLane = lane[lane.length - 1];
        const lastEnd = dayjs(lastInLane.EndTime);

        // Bu lane'deki son aktivite bitmişse, bu lane'e yerleştir
        if (!actStart.isBefore(lastEnd)) {
          lane.push(act);
          placed = true;
          break;
        }
      }

      // Uygun lane bulunamadıysa, yeni lane oluştur
      if (!placed) {
        lanes.push([act]);
      }
    }

    // Bu aktivitenin hangi lane'de olduğunu bul
    let columnIndex = 0;
    for (let i = 0; i < lanes.length; i++) {
      if (lanes[i].some(a => a.Id === activity.Id)) {
        columnIndex = i;
        break;
      }
    }

    return {
      totalColumns: lanes.length,
      columnIndex: columnIndex,
    };
  };

  const handleMouseDown = (date: Dayjs, hour: number, minute: number) => {
    const slot: TimeSlot = { date, hour, minute };
    setIsDragging(true);
    setDragStart(slot);
    setSelectionRange({ start: slot, end: slot });
  };

  const handleMouseEnter = (date: Dayjs, hour: number, minute: number) => {
    if (isDragging && dragStart) {
      const slot: TimeSlot = { date, hour, minute };
      // Only allow selection on the same day
      if (slot.date.isSame(dragStart.date, "day")) {
        setSelectionRange({ start: dragStart, end: slot });
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging && selectionRange) {
      setIsDragging(false);

      // Calculate start and end times
      const { start, end } = selectionRange;
      const startTime = start.date.hour(start.hour).minute(start.minute);
      const endTimeSlot = end.hour * 60 + end.minute;
      const startTimeSlot = start.hour * 60 + start.minute;

      let finalStart, finalEnd;
      if (endTimeSlot >= startTimeSlot) {
        finalStart = startTime;
        finalEnd = end.date.hour(end.hour).minute(end.minute).add(15, "minute");
      } else {
        finalStart = end.date.hour(end.hour).minute(end.minute);
        finalEnd = startTime.add(15, "minute");
      }

      setSelectedSlot({
        date: finalStart,
        hour: finalStart.hour(),
        minute: finalStart.minute(),
      });
      setSelectedEndSlot({
        date: finalEnd,
        hour: finalEnd.hour(),
        minute: finalEnd.minute(),
      });
      setIsCreateModalVisible(true);
      setSelectionRange(null);
      setDragStart(null);
    }
  };

  const isSlotSelected = (date: Dayjs, hour: number, minute: number) => {
    if (!selectionRange) return false;

    const { start, end } = selectionRange;
    if (!date.isSame(start.date, "day")) return false;

    const slotTime = hour * 60 + minute;
    const startTime = start.hour * 60 + start.minute;
    const endTime = end.hour * 60 + end.minute;

    if (endTime >= startTime) {
      return slotTime >= startTime && slotTime <= endTime;
    } else {
      return slotTime >= endTime && slotTime <= startTime;
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isDragging, selectionRange]);

  if (isLoading) {
    return (
      <div className="h-[50vh] flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      {/* Header Controls */}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button onClick={goToToday}>Bugün</Button>
          <Button icon={<LeftOutlined />} onClick={goToPreviousWeek} />
          <Button icon={<RightOutlined />} onClick={goToNextWeek} />
          <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>
            {currentWeekStart.format("MMMM YYYY")}
          </h2>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <UserSelect
            value={selectedUserId ?? undefined}
            onChange={setSelectedUserId}
            placeholder="Kullanıcı Seç"
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            onClick={() => {
              const now = dayjs();
              setSelectedSlot({
                date: now,
                hour: now.hour(),
                minute: 0,
              });
              setSelectedEndSlot({
                date: now.add(1, "hour"),
                hour: now.add(1, "hour").hour(),
                minute: 0,
              });
              setIsCreateModalVisible(true);
            }}
          >
            + Yeni Etkinlik
          </Button>
        </div>
      </div>

      {/* Weekly Calendar Grid */}
      <div
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* Days Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px repeat(7, 1fr)",
            backgroundColor: "#fafafa",
            borderBottom: "1px solid #d9d9d9",
          }}
        >
          <div style={{ padding: "12px", textAlign: "center" }}></div>
          {weekDays.map((day) => (
            <div
              key={day.format("YYYY-MM-DD")}
              style={{
                padding: "12px",
                textAlign: "center",
                borderLeft: "1px solid #d9d9d9",
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                {day.format("ddd")}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: day.isSame(dayjs(), "day") ? "bold" : "normal",
                  color: day.isSame(dayjs(), "day") ? "#1890ff" : "#000",
                }}
              >
                {day.format("D")}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div style={{ maxHeight: "600px", overflowY: "auto", userSelect: "none" }}>
          {hours.map((hour) => (
            <div key={hour}>
              {minutes.map((minute, index) => (
                <div
                  key={`${hour}-${minute}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px repeat(7, 1fr)",
                    borderBottom:
                      index === minutes.length - 1
                        ? "1px solid #d9d9d9"
                        : "1px solid #f5f5f5",
                  }}
                >
                  {/* Hour Label - only show on first 15-min slot */}
                  <div
                    style={{
                      padding: "4px 8px",
                      textAlign: "center",
                      fontSize: "11px",
                      color: "#666",
                      backgroundColor: "#fafafa",
                      borderBottom:
                        index !== minutes.length - 1
                          ? "1px solid #f5f5f5"
                          : "none",
                    }}
                  >
                    {index === 0
                      ? `${hour.toString().padStart(2, "0")}:00`
                      : `${hour.toString().padStart(2, "0")}:${minute
                        .toString()
                        .padStart(2, "0")}`}
                  </div>

                  {/* Day Columns */}
                  {weekDays.map((day) => {
                    const slotActivities = getActivitiesStartingInSlot(
                      day,
                      hour,
                      minute
                    );
                    // O günün tüm aktivitelerini al (çakışma kontrolü için)
                    const allActivitiesInDay = activities.filter(act =>
                      dayjs(act.StartTime).isSame(day, "day")
                    );
                    const isSelected = isSlotSelected(day, hour, minute);
                    const isToday = day.isSame(dayjs(), "day");

                    return (
                      <div
                        key={`${day.format("YYYY-MM-DD")}-${hour}-${minute}`}
                        style={{
                          minHeight: "40px",
                          padding: "2px",
                          borderLeft: "1px solid #f0f0f0",
                          cursor: "pointer",
                          position: "relative",
                          backgroundColor: isSelected
                            ? "#bae7ff"
                            : isToday
                              ? "#f6ffed"
                              : "#fff",
                          transition: "background-color 0.1s",
                        }}
                        onMouseDown={() => handleMouseDown(day, hour, minute)}
                        onMouseEnter={() => handleMouseEnter(day, hour, minute)}
                        onMouseOver={(e) => {
                          if (!isDragging && !isSelected) {
                            e.currentTarget.style.backgroundColor = "#e6f7ff";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isDragging && !isSelected) {
                            e.currentTarget.style.backgroundColor = isToday
                              ? "#f6ffed"
                              : "#fff";
                          }
                        }}
                      >
                        {slotActivities.map((activity: any) => {
                          const duration = getActivityDuration(activity, day);
                          const slotHeight = 40; // minHeight of each slot
                          const activityHeight = duration * slotHeight - 4; // -4 for gap

                          // Kullanıcıya özel renk
                          const userColor = getUserColor(activity.UserId);

                          // Çakışma pozisyonu hesapla
                          const { totalColumns, columnIndex } = getActivityPosition(activity, allActivitiesInDay);
                          const columnWidth = 100 / totalColumns; // Yüzde cinsinden genişlik
                          const leftOffset = columnWidth * columnIndex; // Yüzde cinsinden sol konum

                          return (
                            <div
                              key={activity.Id}
                              style={{
                                padding: "4px 6px",
                                marginBottom: "2px",
                                backgroundColor: userColor,
                                color: "#fff",
                                borderRadius: "4px",
                                fontSize: "11px",
                                cursor: "pointer",
                                overflow: "hidden",
                                position: "absolute",
                                top: "2px",
                                left: `calc(2px + ${leftOffset}%)`,
                                width: `calc(${columnWidth}% - 4px)`,
                                height: `${activityHeight}px`,
                                display: "flex",
                                flexDirection: "column",
                                zIndex: 10,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedActivity(activity);
                                setIsUpdateModalVisible(true);
                              }}
                              title={`${activity.Description}\n${dayjs(
                                activity.StartTime
                              ).format("HH:mm")} - ${dayjs(
                                activity.EndTime
                              ).format("HH:mm")}`}
                            >
                              <div style={{
                                fontWeight: "500",
                                marginBottom: "2px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                                {activity.Description}
                              </div>
                              <div style={{
                                fontSize: "10px",
                                opacity: 0.9,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                                {dayjs(activity.StartTime).format("HH:mm")} - {dayjs(activity.EndTime).format("HH:mm")}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <CreateActivityModal
        visible={isCreateModalVisible}
        onClose={() => {
          setIsCreateModalVisible(false);
          setSelectedSlot(null);
          setSelectedEndSlot(null);
        }}
        initialDate={
          selectedSlot
            ? selectedSlot.date.hour(selectedSlot.hour).minute(selectedSlot.minute)
            : dayjs()
        }
        initialEndDate={
          selectedEndSlot
            ? selectedEndSlot.date.hour(selectedEndSlot.hour).minute(selectedEndSlot.minute)
            : undefined
        }
        selectedUserId={selectedUserId}
      />

      {selectedActivity && (
        <>
          <UpdateActivityModal
            visible={isUpdateModalVisible}
            onClose={() => {
              setIsUpdateModalVisible(false);
              setSelectedActivity(null);
            }}
            activity={selectedActivity}
          />
          <DeleteActivityModal
            visible={isDeleteModalVisible}
            onClose={() => {
              setIsDeleteModalVisible(false);
              setSelectedActivity(null);
            }}
            activity={selectedActivity}
          />
        </>
      )}
    </div>
  );
}
