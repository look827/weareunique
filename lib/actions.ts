'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { createSession, deleteSession, getUser } from '@/lib/auth';
import {
  addLeaveRequest,
  getLeaveRequests,
  updateLeaveRequestStatus,
  updateAttendanceStatus as dbUpdateAttendanceStatus,
  addGoal,
  updateGoalStatus as dbUpdateGoalStatus,
  getLeaveRequestById,
  deleteGoal as dbDeleteGoal,
} from '@/lib/mock-data';
import { USERS } from '@/lib/data/users';
import { generateInsightReport } from '@/ai/flows/generate-insight-report';
import type { LeaveRequest, AttendanceStatus, GoalStatus } from './types';
import { format } from 'date-fns';

// --- Auth Actions ---

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginState = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
};

export async function login(formData: FormData): Promise<LoginState> {
  const result = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(', ') };
  }

  const { email, password } = result.data;

  const user = USERS.find((u) => u.email === email);

  const MOCK_PASSWORDS: Record<string, string> = {
    'sehajdeep@unicube.com': 'admin123',
    'naitik@unicube.com': 'user123',
    'arjun@unicube.com': 'user123',
  }

  if (!user || MOCK_PASSWORDS[user.email] !== password) {
    return { error: 'Invalid email or password' };
  }

  await createSession(user.id);
  
  if (user.role === 'admin') {
    return { success: true, redirectTo: '/dashboard'};
  } else {
    return { success: true, redirectTo: '/my-requests'};
  }
}

export async function logout() {
  await deleteSession();
  redirect('/');
}

// --- Leave Request Actions ---

const leaveRequestSchema = z.object({
  startDate: z.string().min(1, 'Start date is required.'),
  endDate: z.string().min(1, 'End date is required.'),
  reason: z.string().min(10, 'Reason must be at least 10 characters long.').max(200, 'Reason cannot exceed 200 characters.'),
});

type LeaveRequestState = {
  message?: string;
  error?: string;
  success?: boolean;
};

export async function submitLeaveRequest(formData: FormData): Promise<LeaveRequestState> {
  const user = await getUser();
  if (!user) {
    return { error: 'You must be logged in to submit a request.' };
  }

  const result = leaveRequestSchema.safeParse({
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    reason: formData.get('reason'),
  });

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors.reason?.[0] || 'Invalid data provided.' };
  }

  const { startDate, endDate, reason } = result.data;

  if (startDate > endDate) {
    return { error: 'Start date cannot be after the end date.' };
  }

  try {
    await addLeaveRequest({
      userId: user.id,
      userName: user.name,
      userAvatarUrl: user.avatarUrl,
      startDate,
      endDate,
      reason,
      status: 'pending',
    });

    revalidatePath('/my-requests');
    revalidatePath('/dashboard');
    return { success: true, message: 'Leave request submitted successfully!' };
  } catch (e) {
    return { error: 'Failed to submit leave request.' };
  }
}

export async function updateLeaveStatus(leaveId: string, status: 'approved' | 'rejected') {
  const user = await getUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const leaveRequest = await getLeaveRequestById(leaveId);
  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }

  await updateLeaveRequestStatus(leaveId, status);
  
  if (status === 'approved') {
    // Also update attendance records to 'on_leave' for the duration
    for (let d = new Date(leaveRequest.startDate); d <= new Date(leaveRequest.endDate); d.setDate(d.getDate() + 1)) {
        await dbUpdateAttendanceStatus(leaveRequest.userId, format(d, 'yyyy-MM-dd'), 'on_leave');
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/attendance');
  revalidatePath('/my-requests');
}

// --- Attendance Actions ---

type AttendanceState = {
    error?: string;
    success?: boolean;
};

export async function updateAttendanceAction(userId: string, date: string, status: AttendanceStatus): Promise<AttendanceState> {
    const adminUser = await getUser();
    if (!adminUser || adminUser.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await dbUpdateAttendanceStatus(userId, date, status);
        if (result === null) {
            return { error: 'Cannot change status for a user on approved leave.' };
        }
        revalidatePath('/attendance');
        revalidatePath('/my-requests');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to update attendance.' };
    }
}


// --- Goal Actions ---

const createGoalSchema = z.object({
  userId: z.string().min(1, 'Please select an employee.'),
  title: z.string().min(5, 'Title must be at least 5 characters long.').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters long.').max(500),
  deadline: z.string().min(1, 'A deadline is required.'),
});

type CreateGoalState = {
    message?: string;
    error?: string;
    success?: boolean;
};

export async function createGoalAction(formData: FormData): Promise<CreateGoalState> {
    const user = await getUser();
    if (!user || user.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    const result = createGoalSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        return { error: Object.values(errors).flat().join(', ') || 'Invalid data provided.' };
    }

    const { userId, title, description, deadline } = result.data;
    const targetUser = USERS.find(u => u.id === userId);

    if (!targetUser) {
        return { error: 'Selected user not found.' };
    }
    
    try {
        await addGoal({
            userId: targetUser.id,
            userName: targetUser.name,
            title,
            description,
            deadline,
        });
        revalidatePath('/goals');
        revalidatePath('/my-requests');
        return { success: true, message: 'Goal created successfully!' };
    } catch (e) {
        return { error: 'Failed to create goal.' };
    }
}

export async function updateGoalStatusAction(goalId: string, status: GoalStatus) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // In a real app, you'd also check if the user owns this goal.
  await dbUpdateGoalStatus(goalId, status);
  revalidatePath('/my-requests');
  revalidatePath('/goals');
}

type DeleteGoalState = {
    error?: string;
    success?: boolean;
};

export async function deleteGoalAction(goalId: string): Promise<DeleteGoalState> {
    const user = await getUser();
    if (!user || user.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    try {
        await dbDeleteGoal(goalId);
        revalidatePath('/goals');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to delete goal.' };
    }
}


// --- AI Insight Action ---

type ReportState = {
  report?: string;
  error?: string;
};

export async function generateReportAction(): Promise<ReportState> {
  const user = await getUser();
  if (!user || user.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  try {
    const leaveData: LeaveRequest[] = await getLeaveRequests();
    
    const anonymizedData = leaveData.map(d => ({
        startDate: d.startDate,
        endDate: d.endDate,
        reason: d.reason,
        status: d.status,
    }));

    if (anonymizedData.length === 0) {
        return { report: "No leave request data available to generate a report." };
    }

    const { report } = await generateInsightReport({
      leaveRequestData: JSON.stringify(anonymizedData),
    });

    return { report };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate insights report.' };
  }
}
