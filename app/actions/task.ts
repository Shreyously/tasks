'use server';

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

// Create a singleton instance of PrismaClient
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function getTasks() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { tasks };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { error: 'Failed to fetch tasks' };
  }
}

export async function createTask(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const task = await prisma.task.create({
      data: {
        title: formData.get('title') as string,
        description: formData.get('description') as string || null,
        dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null,
        priority: formData.get('priority') as string,
        status: formData.get('status') as string,
        userId: session.user.id,
      },
    });

    revalidatePath('/');
    return { task };
  } catch (error) {
    console.error('Error creating task:', error);
    return { error: 'Failed to create task' };
  }
}

export async function updateTask(taskId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const task = await prisma.task.update({
      where: {
        id: taskId,
        userId: session.user.id,
      },
      data: {
        title: formData.get('title') as string,
        description: formData.get('description') as string || null,
        dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null,
        priority: formData.get('priority') as string,
        status: formData.get('status') as string,
      },
    });

    revalidatePath('/');
    return { task };
  } catch (error) {
    console.error('Error updating task:', error);
    return { error: 'Failed to update task' };
  }
}

export async function deleteTask(taskId: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    await prisma.task.delete({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { error: 'Failed to delete task' };
  }
}