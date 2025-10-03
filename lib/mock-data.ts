import type { User, LeaveRequest, Attendance, Goal } from '@/lib/types';
import fs from 'fs';
import path from 'path';
import { USERS } from '@/lib/data/users';

const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const leaveRequestsPath = path.join(dataDir, 'leave-requests.json');
const attendancePath = path.join(dataDir, 'attendance.json');
const goalsPath = path.join(dataDir, 'goals.json');

const initializeJsonFile = (filePath: string, defaultData: any[]) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
};

const defaultGoals: Goal[] = [
    {
        id: 'goal1',
        userId: '2',
        userName: 'Naitik Beri',
        title: 'Complete Q3 Project Documentation',
        description: 'Finalize and publish all documentation for the Q3 project deliverables.',
        deadline: '2024-09-30',
        status: 'in_progress',
        createdAt: '2024-07-20T00:00:00.000Z',
    },
    {
        id: 'goal2',
        userId: '3',
        userName: 'Arjun Sharma',
        title: 'Onboarding Training',
        description: 'Complete all modules of the new employee onboarding training program.',
        deadline: '2024-08-31',
        status: 'completed',
        createdAt: '2024-07-15T00:00:00.000Z',
    },
];


initializeJsonFile(leaveRequestsPath, []);
initializeJsonFile(attendancePath, []);
initializeJsonFile(goalsPath, defaultGoals);

// Helper to convert date strings to 'yyyy-MM-dd' format
const toYYYYMMDD = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (regex.test(String(dateStr))) return dateStr;
        console.warn(`Invalid date string encountered: ${dateStr}`);
        const validDate = new Date();
        return validDate.toISOString().split('T')[0];
    }
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toISOString().split('T')[0];
};

const readData = <T extends { [key: string]: any }>(filePath: string, dateFields: string[]): T[] => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const parsedData = JSON.parse(data) as any[];
        
        return parsedData.map(item => {
            const newItem = { ...item };
            for (const field of dateFields) {
                if (newItem[field]) {
                    newItem[field] = toYYYYMMDD(newItem[field]);
                }
            }
            return newItem as T;
        });

    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
};

const writeData = (filePath: string, data: any[]) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
    }
};

// --- Leave Requests ---
export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  const leaveRequests = readData<LeaveRequest>(leaveRequestsPath, ['startDate', 'endDate']);
  return Promise.resolve(leaveRequests);
};

export const getLeaveRequestsByUserId = async (userId: string): Promise<LeaveRequest[]> => {
  const leaveRequests = await getLeaveRequests();
  return Promise.resolve(leaveRequests.filter(req => req.userId === userId));
};

export const getLeaveRequestById = async (id: string): Promise<LeaveRequest | undefined> => {
    const leaveRequests = await getLeaveRequests();
    return Promise.resolve(leaveRequests.find(req => req.id === id));
};

export const addLeaveRequest = async (request: Omit<LeaveRequest, 'id' | 'createdAt'>): Promise<LeaveRequest> => {
  const leaveRequests = readData<LeaveRequest>(leaveRequestsPath, ['startDate', 'endDate']);
  const newRequest: LeaveRequest = {
    ...request,
    id: `req${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const updatedRequests = [newRequest, ...leaveRequests];
  writeData(leaveRequestsPath, updatedRequests);
  return Promise.resolve(newRequest);
};

export const updateLeaveRequestStatus = async (id: string, status: 'approved' | 'rejected'): Promise<LeaveRequest | null> => {
  let leaveRequests = readData<LeaveRequest>(leaveRequestsPath, ['startDate', 'endDate']);
  let updatedRequest: LeaveRequest | undefined;
  
  const updatedRequests = leaveRequests.map(req => {
    if (req.id === id) {
      const newReq = { ...req, status };
      updatedRequest = newReq;
      return newReq;
    }
    return req;
  });

  if (updatedRequest) {
      writeData(leaveRequestsPath, updatedRequests);

      let attendanceRecords = readData<Attendance>(attendancePath, ['date']);
      let changed = false;

      const currentRequest = updatedRequest;
      const startDate = new Date(currentRequest.startDate);
      const endDate = new Date(currentRequest.endDate);
       
      for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = toYYYYMMDD(d);
        
        if (status === 'rejected') {
             const existingRecordIndex = attendanceRecords.findIndex(a => a.userId === currentRequest.userId && a.date === dateStr && a.status === 'on_leave');

            if(existingRecordIndex > -1){
                attendanceRecords[existingRecordIndex].status = 'absent';
                changed = true;
            }
        }
      }

      if(changed) {
          writeData(attendancePath, attendanceRecords);
      }
  }
  return Promise.resolve(updatedRequest || null);
};

// --- Attendance ---
export const getAttendanceForUser = async (userId: string): Promise<Attendance[]> => {
    const attendanceRecords = readData<Attendance>(attendancePath, ['date']);
    return Promise.resolve(attendanceRecords.filter(rec => rec.userId === userId));
};

export const getAllUsersWithAttendance = async (): Promise<(User & { attendance: Attendance[], leaveRequests: LeaveRequest[] })[]> => {
    const attendanceRecords = readData<Attendance>(attendancePath, ['date']);
    const leaveRequests = readData<LeaveRequest>(leaveRequestsPath, ['startDate', 'endDate']);
    
    const usersWithData = USERS.map(user => {
        const userAttendance = attendanceRecords.filter(att => att.userId === user.id);
        const userLeaveRequests = leaveRequests.filter(req => req.userId === user.id);
        return {
            ...user,
            attendance: userAttendance,
            leaveRequests: userLeaveRequests,
        };
    });
    return Promise.resolve(usersWithData);
};

export const updateAttendanceStatus = async (userId: string, date: string, status: Attendance['status']): Promise<Attendance | null> => {
    let attendanceRecords = readData<Attendance>(attendancePath, ['date']);
    const leaveRequests = readData<LeaveRequest>(leaveRequestsPath, ['startDate', 'endDate']);
    let updatedRecord: Attendance | null = null;

    const isOnApprovedLeave = leaveRequests.some(req => {
        if (req.userId !== userId || req.status !== 'approved') return false;
        return date >= req.startDate && date <= req.endDate;
    });

    const existingRecordIndex = attendanceRecords.findIndex(a => a.userId === userId && a.date === date);

    if (existingRecordIndex !== -1) {
        const existingRecord = attendanceRecords[existingRecordIndex];
        if (existingRecord.status === 'on_leave' && status !== 'on_leave' && isOnApprovedLeave) {
            return null; // Block change if on approved leave
        }
        updatedRecord = { ...existingRecord, status };
        attendanceRecords[existingRecordIndex] = updatedRecord;
    } else {
        if (isOnApprovedLeave && status !== 'on_leave') {
            return null; // Block creation if on approved leave
        }
        const newRecord: Attendance = {
            id: `att${Date.now()}${userId}`,
            userId,
            date: date,
            status,
        };
        attendanceRecords.push(newRecord);
        updatedRecord = newRecord;
    }

    writeData(attendancePath, attendanceRecords);
    return Promise.resolve(updatedRecord);
};

// --- Goals ---
export const getAllGoals = async (): Promise<Goal[]> => {
    const goals = readData<Goal>(goalsPath, ['deadline']);
    return Promise.resolve(goals);
};

export const getGoalsByUserId = async (userId: string): Promise<Goal[]> => {
    const goals = await getAllGoals();
    return Promise.resolve(goals.filter(goal => goal.userId === userId));
};

export const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>): Promise<Goal> => {
    const goals = readData<Goal>(goalsPath, ['deadline']);
    const newGoal: Goal = {
        ...goal,
        id: `goal${Date.now()}`,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
    };
    const updatedGoals = [newGoal, ...goals];
    writeData(goalsPath, updatedGoals);
    return Promise.resolve(newGoal);
};

export const updateGoalStatus = async (goalId: string, status: Goal['status']): Promise<Goal | null> => {
    let goals = readData<Goal>(goalsPath, ['deadline']);
    let updatedGoal: Goal | null = null;
    const updatedGoals = goals.map(g => {
        if (g.id === goalId) {
            updatedGoal = { ...g, status };
            return updatedGoal;
        }
        return g;
    });
    if (updatedGoal) {
        writeData(goalsPath, updatedGoals);
    }
    return Promise.resolve(updatedGoal);
};

export const deleteGoal = async (goalId: string): Promise<void> => {
    let goals = readData<Goal>(goalsPath, ['deadline']);
    const updatedGoals = goals.filter(g => g.id !== goalId);
    writeData(goalsPath, updatedGoals);
    return Promise.resolve();
};
