export interface CalendarTask {
  id: string;
  column_id: string;
  column_name: string;
  title: string;
  clean_title: string;
  dueDate: string | null; // "YYYY-MM-DD"
  dueTime: string | null; // "HH:mm"
  assignee: string | null;
  notes: string | null;
  statusColor: string;
  statusLabel: string;
  isOverdue: boolean;
  isDone: boolean;
}

export function parseCardDueDate(cardTitle: string, columnName: string): CalendarTask {
  let dueDate: string | null = null;
  let dueTime: string | null = null;
  let assignee: string | null = null;
  let notes: string | null = null;

  let clean_title = cardTitle;

  // Extract meta parts from title format like: "Judul Task (📅 2026-07-30 • ⏰ 14:00 • 👤 Andi • 📝 Catatan)"
  const metaMatch = cardTitle.match(/\((.*?)\)$/);
  if (metaMatch) {
    const metaString = metaMatch[1];
    clean_title = cardTitle.replace(/\s*\((.*?)\)$/, "").trim();

    const parts = metaString.split("•").map((p) => p.trim());
    parts.forEach((part) => {
      if (part.includes("📅")) {
        const d = part.replace("📅", "").trim();
        if (d) dueDate = d;
      } else if (part.includes("⏰")) {
        const t = part.replace("⏰", "").trim();
        if (t) dueTime = t;
      } else if (part.includes("👤")) {
        const a = part.replace("👤", "").trim();
        if (a) assignee = a;
      } else if (part.includes("📝")) {
        const n = part.replace("📝", "").trim();
        if (n) notes = n;
      }
    });
  }

  // Determine status color and label based on column name
  const lowerCol = columnName.toLowerCase().trim();
  let statusColor = "#7c3aed"; // Ungu (To Do / Default)
  let statusLabel = columnName;
  let isDone = false;

  if (lowerCol.includes("done") || lowerCol.includes("selesai") || lowerCol.includes("complete")) {
    statusColor = "#10b981"; // Hijau
    isDone = true;
  } else if (lowerCol.includes("review") || lowerCol.includes("peninjauan")) {
    statusColor = "#2563eb"; // Biru
  } else if (
    lowerCol.includes("proges") ||
    lowerCol.includes("progress") ||
    lowerCol.includes("pengerjaan") ||
    lowerCol.includes("dikerjakan")
  ) {
    statusColor = "#d97706"; // Amber / Kuning
  }

  // Check overdue
  let isOverdue = false;
  if (dueDate && !isDone) {
    const today = new Date().toISOString().split("T")[0];
    const dueDateStr: string = dueDate;
    if (dueDateStr < today) {
      isOverdue = true;
      statusColor = "#ef4444"; // Merah
    }
  }

  return {
    id: "",
    column_id: "",
    column_name: columnName,
    title: cardTitle,
    clean_title: clean_title || cardTitle,
    dueDate,
    dueTime,
    assignee,
    notes,
    statusColor,
    statusLabel,
    isOverdue,
    isDone,
  };
}

export function formatDateIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDaysInMonthGrid(year: number, month: number): Date[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Sunday = 0, Monday = 1, ...
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const days: Date[] = [];

  // Previous month padding
  for (let i = startingDayOfWeek; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }

  // Current month days
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Next month padding to complete 35 or 42 grid cells
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

export function getDaysInWeekGrid(currentDate: Date): Date[] {
  const day = currentDate.getDay();
  const diffToSunday = currentDate.getDate() - day;
  const sunday = new Date(currentDate.setDate(diffToSunday));

  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(sunday);
    nextDay.setDate(sunday.getDate() + i);
    week.push(nextDay);
  }
  return week;
}

export function reconstructCardTitleWithDueDate(
  originalTitle: string,
  newDueDate: string
): string {
  const metaMatch = originalTitle.match(/\((.*?)\)$/);
  const cleanTitle = originalTitle.replace(/\s*\((.*?)\)$/, "").trim();

  if (!metaMatch) {
    return `${cleanTitle} (📅 ${newDueDate})`;
  }

  const metaString = metaMatch[1];
  const parts = metaString.split("•").map((p) => p.trim());
  let dateFound = false;

  const newParts = parts.map((part) => {
    if (part.includes("📅")) {
      dateFound = true;
      return `📅 ${newDueDate}`;
    }
    return part;
  });

  if (!dateFound) {
    newParts.unshift(`📅 ${newDueDate}`);
  }

  return `${cleanTitle} (${newParts.join(" • ")})`;
}

// AI Rescheduling algorithm: Spreads overloaded tasks (>2 per date) evenly to empty future dates
export function aiRescheduleTasks(tasks: CalendarTask[]): { taskId: string; oldDate: string; newDate: string }[] {
  const rescheduled: { taskId: string; oldDate: string; newDate: string }[] = [];
  const dateCounts: Record<string, CalendarTask[]> = {};

  // Group tasks with due dates
  tasks.forEach((t) => {
    if (t.dueDate && !t.isDone) {
      if (!dateCounts[t.dueDate]) dateCounts[t.dueDate] = [];
      dateCounts[t.dueDate].push(t);
    }
  });

  const today = formatDateIso(new Date());

  // Iterate dates and find overloaded days (> 2 tasks)
  Object.keys(dateCounts).forEach((dateStr) => {
    const list = dateCounts[dateStr];
    if (list.length > 2) {
      const excessTasks = list.slice(2); // Keep max 2 tasks on overloaded date

      excessTasks.forEach((task) => {
        // Find next available date with < 2 tasks
        let curr = new Date(dateStr);
        let foundDate = "";

        for (let offset = 1; offset <= 14; offset++) {
          const next = new Date(curr);
          next.setDate(curr.getDate() + offset);
          const nextIso = formatDateIso(next);

          const countOnNext = dateCounts[nextIso]?.length || 0;
          if (countOnNext < 2 && nextIso >= today) {
            foundDate = nextIso;
            break;
          }
        }

        if (foundDate) {
          rescheduled.push({ taskId: task.id, oldDate: dateStr, newDate: foundDate });
          // Update local count for subsequent search
          if (!dateCounts[foundDate]) dateCounts[foundDate] = [];
          dateCounts[foundDate].push(task);
        }
      });
    }
  });

  return rescheduled;
}
