'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PlusCircle, CheckCircle2, Pencil, Trash2, Calendar, LogOut, User, LayoutDashboard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { signOut } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import { createTask, updateTask, deleteTask, getTasks } from '@/app/actions/task';
import { useToast } from '@/hooks/use-toast';
import { TaskSkeleton } from '@/app/components/TaskSkeleton';

export const dynamic = 'force-dynamic';

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: 'low' | 'medium' | 'high';
  status: 'incomplete' | 'in-progress' | 'complete';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const statusColors = {
  'incomplete': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'complete': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status, router]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const result = await getTasks();
      if (result.tasks) {
        setTasks(result.tasks);
      } else if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const formData = new FormData(e.currentTarget);
      const result = await createTask(formData);
      
      if (result.task) {
        setTasks([result.task, ...tasks]);
        setIsAddDialogOpen(false);
        toast({
          title: "Success",
          description: "Task created successfully",
        });
      } else if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent<HTMLFormElement>, taskId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await updateTask(taskId, formData);
    
    if (result.task) {
      setTasks(tasks.map(task => task.id === taskId ? result.task : task));
      setEditingTask(null);
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } else if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const result = await deleteTask(taskId);
    
    if (result.success) {
      setTasks(tasks.filter(task => task.id !== taskId));
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } else if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
              <User className="w-10 h-10 text-gray-500 dark:text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {session?.user?.name || 'User'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {session?.user?.email}
            </p>
          </div>

          <Separator className="my-4" />

          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <div className="flex items-center">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Task Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your tasks efficiently
            </p>
          </div>

          <div className="mb-8">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <Input
                    name="title"
                    placeholder="Task title"
                    required
                  />
                  <Textarea
                    name="description"
                    placeholder="Task description"
                  />
                  <Input
                    name="dueDate"
                    type="date"
                  />
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="status" value="incomplete" />
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="mr-2">Creating...</span>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </>
                      ) : (
                        <>Add Task</>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={priorityFilter} onValueChange={(value: 'all' | 'low' | 'medium' | 'high') => setPriorityFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <TaskSkeleton />
                <TaskSkeleton />
                <TaskSkeleton />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <Card key={task.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <div className="flex gap-2">
                          <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEditingTask(task)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Task</DialogTitle>
                              </DialogHeader>
                              {editingTask && (
                                <form onSubmit={(e) => handleUpdateTask(e, editingTask.id)} className="space-y-4">
                                  <Input
                                    name="title"
                                    defaultValue={editingTask.title}
                                    placeholder="Task title"
                                    required
                                  />
                                  <Textarea
                                    name="description"
                                    defaultValue={editingTask.description || ''}
                                    placeholder="Task description"
                                  />
                                  <Input
                                    name="dueDate"
                                    type="date"
                                    defaultValue={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                                  />
                                  <Select name="priority" defaultValue={editingTask.priority}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Select name="status" defaultValue={editingTask.status}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="incomplete">Incomplete</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="complete">Complete</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <DialogFooter>
                                    <Button type="submit">Save Changes</Button>
                                  </DialogFooter>
                                </form>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Dialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => setTaskToDelete(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Task</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <p>Are you sure you want to delete this task? This action cannot be undone.</p>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setTaskToDelete(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    if (taskToDelete) {
                                      handleDeleteTask(taskToDelete);
                                      setTaskToDelete(null);
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : 'No due date'}
                          </span>
                        </div>
                        <Badge className={priorityColors[task.priority]}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </Badge>
                        <Badge className={statusColors[task.status]}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
                {filteredTasks.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      No tasks yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Add a new task to get started
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
