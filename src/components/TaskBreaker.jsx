import React, { useState, useEffect } from 'react';
import { ListTodo, Plus, Trash2, Check, X, Loader2 } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';
import { useSensory } from '../context/SensoryContext';
import SmartText from './SmartText';

/**
 * TaskBreaker Component - Executive Function Toolkit
 * 
 * Features:
 * - Create tasks with multiple steps
 * - Real-time backend sync for step completion
 * - Delete tasks
 * - Responsive UI with dark mode support
 * - Smart Tags integration (bionic reading, dyslexic font, font size)
 */
const TaskBreaker = ({ onTasksChange }) => {
  const { reduceAnimations } = useSensory();
  
  // State
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newSteps, setNewSteps] = useState(['', '', '']); // Start with 3 empty steps
  
  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);
  
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const tasksData = await api.getTasks();
      // Handle paginated response from Django REST Framework
      const tasksList = Array.isArray(tasksData) ? tasksData : (tasksData.results || []);
      setTasks(tasksList);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    
    const validSteps = newSteps.filter(step => step.trim() !== '');
    if (validSteps.length === 0) {
      toast.error('Please add at least one step');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const taskData = {
        main_task_title: newTaskTitle.trim(),
        steps: validSteps.map((step, index) => ({
          step_description: step.trim(),
          order: index + 1,
          is_step_complete: false,
        })),
      };
      
      const newTask = await api.createTask(taskData);
      setTasks([newTask, ...tasks]); // Add to beginning of list
      
      // Reset form
      setNewTaskTitle('');
      setNewSteps(['', '', '']);
      setShowCreateForm(false);
      
      toast.success('Task created successfully!');
      
      // Notify parent component
      if (onTasksChange) onTasksChange();
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error(error.message || 'Failed to create task');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleToggleStep = async (taskId, stepId, currentStatus) => {
    // Optimistic update
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedSteps = task.steps.map(step =>
          step.id === stepId ? { ...step, is_step_complete: !currentStatus } : step
        );
        return { ...task, steps: updatedSteps };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    try {
      // Backend sync
      await api.updateTaskStep(taskId, stepId, !currentStatus);
      
      // Check if all steps are complete and update task completion
      const task = updatedTasks.find(t => t.id === taskId);
      const allStepsComplete = task.steps.every(s => s.is_step_complete);
      
      if (allStepsComplete && !task.is_complete) {
        await api.patchTask(taskId, { is_complete: true });
        // Update local state
        setTasks(prevTasks => prevTasks.map(t =>
          t.id === taskId ? { ...t, is_complete: true } : t
        ));
        toast.success('🎉 Task completed!', {
          icon: '✅',
          duration: 3000,
        });
      }
      
      // Notify parent component
      if (onTasksChange) onTasksChange();
    } catch (error) {
      console.error('Failed to update step:', error);
      // Rollback on error
      setTasks(tasks);
      toast.error('Failed to update step. Changes reverted.');
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    // Optimistic delete
    const previousTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== taskId));
    
    try {
      await api.deleteTask(taskId);
      toast.success('Task deleted');
      
      // Notify parent component
      if (onTasksChange) onTasksChange();
    } catch (error) {
      console.error('Failed to delete task:', error);
      // Rollback on error
      setTasks(previousTasks);
      toast.error('Failed to delete task');
    }
  };
  
  const addStepField = () => {
    setNewSteps([...newSteps, '']);
  };
  
  const removeStepField = (index) => {
    const updated = newSteps.filter((_, i) => i !== index);
    setNewSteps(updated);
  };
  
  const updateStepField = (index, value) => {
    const updated = [...newSteps];
    updated[index] = value;
    setNewSteps(updated);
  };
  
  // Calculate progress for a task
  const calculateProgress = (task) => {
    if (task.steps.length === 0) return 0;
    const completedSteps = task.steps.filter(s => s.is_step_complete).length;
    return Math.round((completedSteps / task.steps.length) * 100);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListTodo className="text-indigo-600 dark:text-indigo-400" size={24} />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
            <SmartText>Task Breaker</SmartText>
          </h2>
        </div>
        
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 text-sm font-medium"
          >
            <Plus size={16} />
            <SmartText>New Task</SmartText>
          </button>
        )}
      </div>
      
      {/* Create Task Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateTask} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <SmartText>Task Title</SmartText>
            </label>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g., Write History Essay"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300"
              disabled={isSaving}
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <SmartText>Break it into steps:</SmartText>
            </label>
            <div className="space-y-2">
              {newSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateStepField(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300"
                    disabled={isSaving}
                  />
                  {newSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStepField(index)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      disabled={isSaving}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStepField}
              className="mt-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
              disabled={isSaving}
            >
              + Add another step
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className={reduceAnimations ? '' : 'animate-spin'} />
                  <SmartText>Creating...</SmartText>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <SmartText>Create Task</SmartText>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewTaskTitle('');
                setNewSteps(['', '', '']);
              }}
              disabled={isSaving}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300 text-sm font-medium"
            >
              <SmartText>Cancel</SmartText>
            </button>
          </div>
        </form>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={32} className={`text-indigo-600 dark:text-indigo-400 ${reduceAnimations ? '' : 'animate-spin'}`} />
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && tasks.length === 0 && (
        <div className="text-center py-8">
          <ListTodo size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            <SmartText>No tasks yet. Break down your first big task into smaller steps!</SmartText>
          </p>
        </div>
      )}
      
      {/* Task List */}
      {!isLoading && tasks.length > 0 && (
        <div className="space-y-4">
          {tasks.map((task) => {
            const progress = calculateProgress(task);
            
            return (
              <div 
                key={task.id}
                className={`p-4 border rounded-lg transition-colors duration-300 ${
                  task.is_complete
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}
              >
                {/* Task Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300 ${
                      task.is_complete ? 'line-through text-gray-500 dark:text-gray-400' : ''
                    }`}>
                      <SmartText>{task.main_task_title}</SmartText>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progress === 100 
                              ? 'bg-green-500' 
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {progress}%
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="ml-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                {/* Steps */}
                <div className="space-y-2">
                  {task.steps.map((step) => (
                    <label 
                      key={step.id}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input
                          type="checkbox"
                          checked={step.is_step_complete}
                          onChange={() => handleToggleStep(task.id, step.id, step.is_step_complete)}
                          className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                      <span className={`flex-1 text-sm transition-colors duration-300 ${
                        step.is_step_complete 
                          ? 'line-through text-gray-500 dark:text-gray-400' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        <SmartText>{step.step_description}</SmartText>
                      </span>
                    </label>
                  ))}
                </div>
                
                {/* Completion Badge */}
                {task.is_complete && (
                  <div className={`mt-3 flex items-center gap-2 text-green-700 dark:text-green-400 text-sm font-medium ${
                    reduceAnimations ? '' : 'animate-fade-in'
                  }`}>
                    <Check size={16} />
                    <SmartText>Task Complete!</SmartText>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskBreaker;

