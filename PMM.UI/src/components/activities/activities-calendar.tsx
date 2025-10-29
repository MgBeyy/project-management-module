import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);
dayjs.locale("tr");
import { useEffect, useState, useRef, useCallback } from "react";
import { GetActivities } from "../../services/activities/get-activities";
import { useActivitiesStore } from "@/store/zustand/activities-store";
import CreateActivityModal from "./modals/create-activity-modal";
import UpdateActivityModal from "./modals/update-activity-modal";
import DeleteActivityModal from "./modals/delete-activity-modal";
import UserSelect from "./user-select";
import Spinner from "../common/spinner";

interface TimeSlot {
  date: Dayjs;
  hour: number;
  minute: number;
}

const SLOT_HEIGHT = 21; // px height used per 15-minute slot

// Seçim kutusu görünümü
const SELECTION_BORDER_COLOR = "#1677ff"; // Ant Design primary ton
const SELECTION_Z_INDEX = 50; // etkinlik kartlarının üstünde (kartlar zIndex:10)

// Yardımcılar
const toMinuteOfDay = (hour: number, minute: number) => hour * 60 + minute;
const prevSlot = (hour: number, minute: number) => {
  const m = toMinuteOfDay(hour, minute) - 15;
  if (m < 0) return null;
  return { hour: Math.floor(m / 60), minute: m % 60 };
};
const nextSlot = (hour: number, minute: number) => {
  const m = toMinuteOfDay(hour, minute) + 15;
  if (m > 23 * 60 + 45) return null;
  return { hour: Math.floor(m / 60), minute: m % 60 };
};

export default function ActivitiesCalendar() {
  const { activities, setActivities, isLoading, setIsLoading, refreshTrigger } =
    useActivitiesStore();

  const [currentWeekStart, setCurrentWeekStart] = useState<Dayjs>(
    dayjs().startOf("isoWeek")
  );
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const currentTimeIndicatorRef = useRef<HTMLDivElement | null>(null);

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

  // Drag sırasında imlecin üzerinde olduğu slot
  const [hoveredSlot, setHoveredSlot] = useState<TimeSlot | null>(null);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const goToToday = () => {
    setCurrentWeekStart(dayjs().startOf("isoWeek"));
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(currentWeekStart.add(i, "day"));
    }
    return days;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  const weekDays = getWeekDays();
  const currentDayIndex = weekDays.findIndex((day) =>
    day.isSame(currentTime, "day")
  );
  const isCurrentWeek = currentDayIndex !== -1;

  // Current time'a otomatik scroll
  useEffect(() => {
    if (isLoading || hasAutoScrolled || !isCurrentWeek) return;

    const indicatorEl = currentTimeIndicatorRef.current;
    const containerEl = scrollContainerRef.current;
    if (!indicatorEl || !containerEl) return;

    const frame = requestAnimationFrame(() => {
      const indicatorRect = indicatorEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      const indicatorOffset =
        indicatorRect.top - containerRect.top + containerEl.scrollTop;
      const targetScroll = indicatorOffset - containerEl.clientHeight / 2;

      containerEl.scrollTo({
        top: Math.max(targetScroll, 0),
        behavior: "auto",
      });

      setHasAutoScrolled(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [isLoading, hasAutoScrolled, isCurrentWeek, currentTime]);

  useEffect(() => {
    setHasAutoScrolled(false);
  }, [currentWeekStart]);

  // Slotta başlayan aktiviteleri getir (çok günlük aktiviteler için gün başı render)
  const getActivitiesStartingInSlot = (
    date: Dayjs,
    hour: number,
    minute: number
  ) => {
    return activities.filter((activity) => {
      const startTime = dayjs(activity.StartTime);
      const endTime = dayjs(activity.EndTime);

      const startsHere =
        startTime.isSame(date, "day") &&
        startTime.hour() === hour &&
        Math.floor(startTime.minute() / 15) * 15 === minute;

      if (startsHere) return true;

      if (!startTime.isSame(endTime, "day")) {
        const isActivityDay =
          date.isAfter(startTime, "day") && date.isBefore(endTime, "day");
        const isLastDay =
          date.isSame(endTime, "day") && date.isAfter(startTime, "day");
        const isDayStart = hour === 0 && minute === 0;
        if ((isActivityDay || isLastDay) && isDayStart) {
          return true;
        }
      }

      return false;
    });
  };

  // Aktivite süresi (slot sayısı)
  const getActivityDuration = (activity: any, currentDate: Dayjs) => {
    const startTime = dayjs(activity.StartTime);
    const endTime = dayjs(activity.EndTime);

    if (startTime.isSame(endTime, "day")) {
      const durationMinutes = endTime.diff(startTime, "minute");
      return Math.max(1, Math.ceil(durationMinutes / 15));
    }

    if (startTime.isSame(currentDate, "day")) {
      const endOfDay = startTime.endOf("day");
      const durationMinutes = endOfDay.diff(startTime, "minute");
      return Math.max(1, Math.ceil(durationMinutes / 15));
    }

    const startOfDay = currentDate.startOf("day");

    if (endTime.isSame(currentDate, "day")) {
      const durationMinutes = endTime.diff(startOfDay, "minute");
      return Math.max(1, Math.ceil(durationMinutes / 15));
    }

    const fullDayMinutes = 24 * 60;
    return Math.ceil(fullDayMinutes / 15);
  };

  // Kullanıcı rengi
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

  // Çakışma konum hesaplama (aynı gün içindeki aktiviteler)
  const getActivityPosition = (activity: any, allActivitiesInDay: any[]) => {
    const startTime = dayjs(activity.StartTime);
    const endTime = dayjs(activity.EndTime);

    const overlappingActivities = allActivitiesInDay.filter((otherActivity) => {
      const otherStart = dayjs(otherActivity.StartTime);
      const otherEnd = dayjs(otherActivity.EndTime);
      return startTime.isBefore(otherEnd) && endTime.isAfter(otherStart);
    });

    const sortedActivities = overlappingActivities.sort((a, b) => {
      const aStart = dayjs(a.StartTime).valueOf();
      const bStart = dayjs(b.StartTime).valueOf();
      if (aStart !== bStart) return aStart - bStart;
      return dayjs(a.EndTime).valueOf() - dayjs(b.EndTime).valueOf();
    });

    const lanes: any[][] = [];
    for (const act of sortedActivities) {
      const actStart = dayjs(act.StartTime);
      let placed = false;
      for (let i = 0; i < lanes.length; i++) {
        const lane = lanes[i];
        const lastInLane = lane[lane.length - 1];
        const lastEnd = dayjs(lastInLane.EndTime);
        if (!actStart.isBefore(lastEnd)) {
          lane.push(act);
          placed = true;
          break;
        }
      }
      if (!placed) lanes.push([act]);
    }

    let columnIndex = 0;
    for (let i = 0; i < lanes.length; i++) {
      if (lanes[i].some((a) => a.Id === activity.Id)) {
        columnIndex = i;
        break;
      }
    }

    return {
      totalColumns: lanes.length,
      columnIndex,
    };
  };

  // Seçim başlat
  const handleMouseDown = (date: Dayjs, hour: number, minute: number) => {
    const slot: TimeSlot = { date, hour, minute };
    setIsDragging(true);
    setDragStart(slot);
    setSelectionRange({ start: slot, end: slot });
    setHoveredSlot(slot);
  };

  // Grid hover
  const handleMouseEnter = (date: Dayjs, hour: number, minute: number) => {
    const slot: TimeSlot = { date, hour, minute };
    setHoveredSlot(slot);

    if (isDragging && dragStart) {
      if (slot.date.isSame(dragStart.date, "day")) {
        setSelectionRange({ start: dragStart, end: slot });
      }
    }
  };

  // Seçimi tamamla (useCallback ile sabit referans)
  const handleMouseUp = useCallback(() => {
    if (isDragging && selectionRange) {
      setIsDragging(false);

      const { start, end } = selectionRange;
      const startTime = start.date.hour(start.hour).minute(start.minute);
      const endTimeSlot = end.hour * 60 + end.minute;
      const startTimeSlot = start.hour * 60 + start.minute;

      let finalStart: Dayjs, finalEnd: Dayjs;
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
      setHoveredSlot(null);
    }
  }, [isDragging, selectionRange]);

  // ⬇️ Global mouseup: takvim dışındayken bile bırakmayı yakala
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isDragging, handleMouseUp]);

  // Slot seçili mi?
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

  // Seçimin üst/alt kenarı
  const isStartOfSelection = (date: Dayjs, hour: number, minute: number) => {
    if (!isSlotSelected(date, hour, minute)) return false;
    const prev = prevSlot(hour, minute);
    if (!prev) return true;
    return !isSlotSelected(date, prev.hour, prev.minute);
  };
  const isEndOfSelection = (date: Dayjs, hour: number, minute: number) => {
    if (!isSlotSelected(date, hour, minute)) return false;
    const next = nextSlot(hour, minute);
    if (!next) return true;
    return !isSlotSelected(date, next.hour, next.minute);
  };

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
            {currentWeekStart.locale("tr").format("MMMM YYYY")}
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
                {day.locale("tr").format("dddd")}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: day.isSame(currentTime, "day") ? "bold" : "normal",
                  color: day.isSame(currentTime, "day") ? "#1890ff" : "#000",
                }}
              >
                {day.format("D")}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div
          ref={scrollContainerRef}
          style={{
            maxHeight: "calc(100vh - 400px)",
            overflowY: "auto",
            userSelect: "none",
          }}
          onMouseLeave={() => setHoveredSlot(null)}
          onMouseUp={handleMouseUp} // lokal mouseup
        >
          {hours.map((hour) => (
            <div key={hour}>
              {minutes.map((minute, index) => {
                const isCurrentRow =
                  isCurrentWeek &&
                  currentTime.hour() === hour &&
                  currentTime.minute() >= minute &&
                  currentTime.minute() < minute + 15;

                const minutesIntoSlot =
                  currentTime.minute() - minute + currentTime.second() / 60;
                const clampedMinutes = Math.min(
                  Math.max(minutesIntoSlot, 0),
                  15
                );
                const indicatorOffset = (clampedMinutes / 15) * SLOT_HEIGHT;
                const indicatorLineTop = `${indicatorOffset}px`;
                const indicatorDotTop = `${indicatorOffset}px`;

                return (
                  <div
                    key={`${hour}-${minute}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px repeat(7, 1fr)",
                      borderBottom:
                        index === minutes.length - 1
                          ? "1px solid #d9d9d9"
                          : "1px solid #f5f5f5",
                      position: "relative",
                      overflow: "visible", // ⬅️ dikey border'ı köprülemek için
                    }}
                  >
                    {/* Hour Label */}
                    <div
                      style={{
                        padding: "0px 8px",
                        textAlign: "center",
                        fontSize: "12px",
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
                      const allActivitiesInDay = activities.filter((act) =>
                        dayjs(act.StartTime).isSame(day, "day")
                      );

                      const selected = isSlotSelected(day, hour, minute);
                      const startEdge = isStartOfSelection(day, hour, minute);
                      const endEdge = isEndOfSelection(day, hour, minute);

                      const isToday = day.isSame(currentTime, "day");
                      const showIndicator = isCurrentRow && isToday;

                      const hoveredDT = hoveredSlot
                        ? hoveredSlot.date
                            .hour(hoveredSlot.hour)
                            .minute(hoveredSlot.minute)
                        : null;

                      return (
                        <div
                          key={`${day.format("YYYY-MM-DD")}-${hour}-${minute}`}
                          style={{
                            minHeight: "20px",
                            padding: "2px",
                            borderLeft: "1px solid #f0f0f0",
                            cursor: "pointer",
                            position: "relative",
                            backgroundColor: isToday ? "#f6ffed" : "#fff",
                            transition: "background-color 0.1s",
                          }}
                          onMouseDown={() => handleMouseDown(day, hour, minute)}
                          onMouseEnter={() => handleMouseEnter(day, hour, minute)}
                          onMouseOver={(e) => {
                            if (!isDragging && !selected) {
                              e.currentTarget.style.backgroundColor = "#e6f7ff";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isDragging && !selected) {
                              e.currentTarget.style.backgroundColor = isToday
                                ? "#f6ffed"
                                : "#fff";
                            }
                          }}
                        >
                          {showIndicator && (
                            <>
                              <div
                                ref={currentTimeIndicatorRef}
                                style={{
                                  position: "absolute",
                                  top: indicatorLineTop,
                                  left: "2px",
                                  right: "2px",
                                  height: "2px",
                                  backgroundColor: "#ff4d4f",
                                  zIndex: 80, // saat çizgisi üstte kalsın
                                  pointerEvents: "none",
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  top: indicatorDotTop,
                                  left: "50%",
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  backgroundColor: "#ff4d4f",
                                  transform: "translateX(-50%)",
                                  boxShadow: "0 0 0 2px #fff",
                                  zIndex: 81,
                                  pointerEvents: "none",
                                }}
                              />
                            </>
                          )}

                          {/* Etkinlik Kartları */}
                          {slotActivities.map((activity: any) => {
                            const duration = getActivityDuration(
                              activity,
                              day
                            );
                            const activityHeight =
                              duration * SLOT_HEIGHT - 4;

                            const userColor = getUserColor(activity.UserId);
                            const {
                              totalColumns,
                              columnIndex,
                            } = getActivityPosition(
                              activity,
                              allActivitiesInDay
                            );
                            const columnWidth = 100 / totalColumns;
                            const leftOffset = columnWidth * columnIndex;
                            const isRightmost = columnIndex === totalColumns - 1;

                            const startTime = dayjs(activity.StartTime);
                            const endTime = dayjs(activity.EndTime);
                            const hoverHitsActivity =
                              !!hoveredDT &&
                              (hoveredDT.isAfter(startTime) ||
                                hoveredDT.isSame(startTime)) &&
                              hoveredDT.isBefore(endTime);

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
                                  cursor: isDragging ? "default" : "pointer",
                                  overflow: "hidden",
                                  position: "absolute",
                                  top: "2px",
                                  left: `calc(2px + ${leftOffset}%)`,
                                  width: `calc(${columnWidth}% - ${isRightmost ? 14 : 2}px)`,
                                  height: `${activityHeight}px`,
                                  display: "flex",
                                  flexDirection: "column",
                                  zIndex: 10, // overlay'in altında kalır
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                  // Drag sırasında alttaki slotların hover'ını engelleme
                                  pointerEvents: isDragging ? "none" : "auto",
                                  // Drag sırasında o anda hover edilen slotun zaman aralığı bu karta denkse opaklık düşür
                                  opacity:
                                    isDragging && hoverHitsActivity ? 0.35 : 1,
                                  transition: "opacity 0.08s linear",
                                }}
                                onMouseDown={(e) => {
                                  if (!isDragging) e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  if (isDragging) return;
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
                                <div
                                  style={{
                                    fontWeight: 500,
                                    marginBottom: "2px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {activity.Description}
                                </div>
                                <div
                                  style={{
                                    fontSize: "10px",
                                    opacity: 0.9,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {dayjs(activity.StartTime).format("HH:mm")} -{" "}
                                  {dayjs(activity.EndTime).format("HH:mm")}
                                </div>
                              </div>
                            );
                          })}

                          {/* Seçim Border Overlay (köprüleyen -1px ile kesintisiz) */}
                          {selected && (
                            <div
                              style={{
                                position: "absolute",
                                top: -1,       // yatay grid çizgisinin üstüne taş
                                bottom: -1,    // alt çizginin üstüne taş
                                left: 0,
                                right: 0,
                                borderLeft: `2px solid ${SELECTION_BORDER_COLOR}`,
                                borderRight: `2px solid ${SELECTION_BORDER_COLOR}`,
                                borderTop: startEdge
                                  ? `2px solid ${SELECTION_BORDER_COLOR}`
                                  : "none",
                                borderBottom: endEdge
                                  ? `2px solid ${SELECTION_BORDER_COLOR}`
                                  : "none",
                                borderRadius: startEdge
                                  ? "6px 6px 0 0"
                                  : endEdge
                                  ? "0 0 6px 6px"
                                  : 0,
                                zIndex: SELECTION_Z_INDEX,
                                pointerEvents: "none",
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
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
            ? selectedSlot.date
                .hour(selectedSlot.hour)
                .minute(selectedSlot.minute)
            : dayjs()
        }
        initialEndDate={
          selectedEndSlot
            ? selectedEndSlot.date
                .hour(selectedEndSlot.hour)
                .minute(selectedEndSlot.minute)
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
