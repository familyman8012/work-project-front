import { useState, useCallback } from "react";
import { Box, Paper, ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  View,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { CalendarTask, ViewType } from "@/types/schedule";

const locales = {
  ko: ko,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DraggableCalendar = withDragAndDrop(BigCalendar);

interface CalendarProps {
  tasks: CalendarTask[];
  onRangeChange: (start: Date, end: Date) => void;
  onEventDrop: (taskId: number, start: Date, end: Date) => void;
  isLoading?: boolean;
}

export default function Calendar({
  tasks,
  onRangeChange,
  onEventDrop,
  isLoading,
}: CalendarProps) {
  const [view, setView] = useState<View>("month");

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: ViewType
  ) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: new Date(task.start_date),
    end: new Date(task.due_date),
    allDay: true,
    resource: task,
  }));

  const handleRangeChange = useCallback(
    (range: Date[] | { start: Date; end: Date }) => {
      if (Array.isArray(range)) {
        onRangeChange(range[0], range[range.length - 1]);
      } else {
        onRangeChange(range.start, range.end);
      }
    },
    [onRangeChange]
  );

  const handleEventDrop = useCallback(
    ({ event, start, end }: any) => {
      onEventDrop(event.id, start, end);
    },
    [onEventDrop]
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          aria-label="calendar view"
          size="small"
        >
          <ToggleButton value="month">월</ToggleButton>
          <ToggleButton value="week">주</ToggleButton>
          <ToggleButton value="day">일</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ height: "calc(100vh - 250px)" }}>
        <DraggableCalendar
          localizer={localizer}
          events={events}
          view={view}
          onView={(view: View) => setView(view)}
          onRangeChange={handleRangeChange}
          onEventDrop={handleEventDrop}
          draggableAccessor={() => true}
          resizable={false}
          popup
          messages={{
            today: "오늘",

            agenda: "일정",
            date: "날짜",
            time: "시간",
            event: "일정",
            noEventsInRange: "표시할 일정이 습니다.",
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color || "defaultColor", // 기본 색상 추가
              color: event.textColor || "defaultTextColor", // 기본 텍스트 색상 추가
              borderRadius: "4px",
              border: "none",
            },
          })}
        />
      </Box>
    </Paper>
  );
}
