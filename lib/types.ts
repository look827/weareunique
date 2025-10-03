export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  avatarUrl: string;
};

export type LeaveRequest = {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

export type AttendanceStatus = 'present' | 'absent' | 'on_leave';

export type Attendance = {
  id: string;
  userId: string;
  date: string;
  status: AttendanceStatus;
};

export type GoalStatus = 'in_progress' | 'completed';

export type Goal = {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  deadline: string;
  status: GoalStatus;
  createdAt: string;
};
