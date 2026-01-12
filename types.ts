
export interface ExamSession {
  id: string;
  subject: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  room: string;
  class: string;
  invigilator?: string;
  expectedCount?: number;
  presentCount?: number;
  absentCount?: number;
}

export interface BoardConfig {
  title: string;
  date: string;
  venue: string;
  backgroundImageUrl?: string;
  targetClass?: string; // 指定顯示的班級，若為空則顯示全部
  showAttendance: boolean; // 是否顯示人數統計數字
  // Added examRules property to track exam regulations
  examRules: string[];
}

export type ViewMode = 'signage' | 'admin';
