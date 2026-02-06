"use client";

import React, { useEffect, useState } from "react";
import {
  Target,
  Plus,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
  Filter,
  ChevronDown,
  Lock,
  TrendingUp,
  PiggyBank,
  FileText,
  Repeat,
} from "lucide-react";
import { createBrowserClient } from "@/lib/database/client";
import { FinancialTodo } from "@/lib/database/types";

export default function TodosPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [todos, setTodos] = useState<FinancialTodo[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<FinancialTodo | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("priority");
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: FinancialTodo["category"];
    priority: FinancialTodo["priority"];
    targetAmount: string;
    targetDate: string;
    isRecurring: boolean;
    recurringFrequency: FinancialTodo["recurring_frequency"];
    tags: string[];
  }>({
    title: "",
    description: "",
    category: "other",
    priority: "medium",
    targetAmount: "",
    targetDate: "",
    isRecurring: false,
    recurringFrequency: "monthly",
    tags: [],
  });

  const supabase = createBrowserClient();

  useEffect(() => {
    setIsMounted(true);
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchTodos(user.id);
      }
      setTimeout(() => setLoading(false), 800);
    };
    getUser();
  }, []);

  // Refresh todos when page gains focus (user navigates back from analysis page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (user && document.visibilityState === 'visible') {
        fetchTodos(user.id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const fetchTodos = async (userId: string) => {
    try {
      const response = await fetch(`/api/todos?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data || []);
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const todoData = {
        userId: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        targetAmount: formData.targetAmount
          ? parseFloat(formData.targetAmount)
          : null,
        targetDate: formData.targetDate || null,
        isRecurring: formData.isRecurring,
        recurringFrequency: formData.isRecurring
          ? formData.recurringFrequency
          : null,
        tags: formData.tags,
      };

      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todoData),
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTodos([...todos, newTodo]);
        setShowCreateForm(false);
        setFormData({
          title: "",
          description: "",
          category: "other",
          priority: "medium",
          targetAmount: "",
          targetDate: "",
          isRecurring: false,
          recurringFrequency: "monthly",
          tags: [],
        });
        await fetchTodos(user.id);
      }
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  };

  const handleUpdate = async (
    todoId: string,
    updates: Partial<FinancialTodo>,
  ) => {
    try {
      const response = await fetch("/api/todos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ todoId, updates }),
      });

      if (response.ok) {
        await fetchTodos(user.id);
        setEditingTodo(null);
      }
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleDelete = async (todoId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      const response = await fetch(`/api/todos?todoId=${todoId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTodos(todos.filter((todo) => todo.id !== todoId));
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const updateProgress = async (todoId: string, currentAmount: number) => {
    await handleUpdate(todoId, { current_amount: currentAmount });
  };

  const toggleStatus = async (
    todoId: string,
    status: FinancialTodo["status"],
  ) => {
    const updates: Partial<FinancialTodo> = { status };
    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
    }
    await handleUpdate(todoId, updates);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "budget":
        return <FileText className="w-5 h-5" />;
      case "savings":
        return <PiggyBank className="w-5 h-5" />;
      case "investment":
        return <TrendingUp className="w-5 h-5" />;
      case "tax":
        return <FileText className="w-5 h-5" />;
      case "bill":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "budget":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "savings":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "investment":
        return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case "tax":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "bill":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      default:
        return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "low":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      default:
        return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "in_progress":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "failed":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "cancelled":
        return "text-slate-500 bg-slate-500/10 border-slate-500/20";
      default:
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    }
  };

  const filteredAndSortedTodos = todos
    .filter((todo) => {
      if (filterCategory !== "all" && todo.category !== filterCategory)
        return false;
      if (filterStatus !== "all" && todo.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "target_date":
          return (
            new Date(a.target_date || "").getTime() -
            new Date(b.target_date || "").getTime()
          );
        case "created_at":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        default:
          return 0;
      }
    });

  if (!isMounted) return null;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <Lock className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-text-primary mb-4 tracking-tight">
            Financial Goals
          </h1>
          <p className="text-lg text-text-secondary mb-10 leading-relaxed font-medium">
            Track and achieve your financial goals with smart reminders and
            progress tracking.
          </p>
          <a
            href="/auth"
            className="btn-primary w-full py-4 text-center text-sm tracking-[0.2em]"
          >
            SIGN IN TO MANAGE GOALS
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-fade-in">
        <div className="text-center space-y-8">
          <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto shadow-2xl shadow-primary/20" />
          <p className="text-text-muted font-black text-xs uppercase tracking-[0.4em] animate-pulse">
            Loading Financial Goals...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
            <Target className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              Financial Goals
            </h1>
            <p className="text-text-secondary text-sm">
              Track progress and achieve your financial objectives
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          <Plus size={20} />
          <span>Create Goal</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-muted" />
          <span className="text-sm text-text-muted">Filter:</span>
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface border border-border text-sm"
        >
          <option value="all">All Categories</option>
          <option value="budget">Budget</option>
          <option value="savings">Savings</option>
          <option value="investment">Investment</option>
          <option value="tax">Tax</option>
          <option value="bill">Bills</option>
          <option value="other">Other</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface border border-border text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface border border-border text-sm"
        >
          <option value="priority">Priority</option>
          <option value="target_date">Target Date</option>
          <option value="created_at">Created Date</option>
        </select>
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingTodo) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-3xl border border-border p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              {editingTodo ? "Edit Goal" : "Create New Goal"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-secondary-medium/50 border border-border focus:border-primary focus:outline-none transition-colors"
                  placeholder="e.g., Save for emergency fund"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-secondary-medium/50 border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                  rows={3}
                  placeholder="Add more details about your goal..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as FinancialTodo["category"],
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-secondary-medium/50 border border-border focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="budget">Budget</option>
                    <option value="savings">Savings</option>
                    <option value="investment">Investment</option>
                    <option value="tax">Tax</option>
                    <option value="bill">Bill</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as FinancialTodo["priority"],
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-secondary-medium/50 border border-border focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Target Amount
                  </label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAmount: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-secondary-medium/50 border border-border focus:border-primary focus:outline-none transition-colors"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDate: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-secondary-medium/50 border border-border focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) =>
                    setFormData({ ...formData, isRecurring: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <label
                  htmlFor="isRecurring"
                  className="text-sm text-text-primary"
                >
                  Recurring Goal
                </label>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.recurringFrequency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurringFrequency: e.target
                          .value as FinancialTodo["recurring_frequency"],
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-secondary-medium/50 border border-border focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTodo(null);
                    setFormData({
                      title: "",
                      description: "",
                      category: "other",
                      priority: "medium",
                      targetAmount: "",
                      targetDate: "",
                      isRecurring: false,
                      recurringFrequency: "monthly",
                      tags: [],
                    });
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-secondary-medium/50 border border-border text-text-primary hover:bg-secondary-medium transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingTodo ? "Update Goal" : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-6">
        {filteredAndSortedTodos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-secondary-medium rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Target className="text-text-muted w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              No financial goals found
            </h3>
            <p className="text-text-secondary mb-6">
              Create your first financial goal to start tracking your progress.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={20} />
              <span>Create Your First Goal</span>
            </button>
          </div>
        ) : (
          filteredAndSortedTodos.map((todo) => (
            <div
              key={todo.id}
              className="card-lg bg-surface relative overflow-hidden group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getCategoryColor(todo.category)}`}
                  >
                    {getCategoryIcon(todo.category)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                        {todo.title}
                      </h3>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}
                      >
                        {todo.priority}
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(todo.status)}`}
                      >
                        {todo.status.replace("_", " ")}
                      </div>
                      {todo.is_recurring && (
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <Repeat size={12} />
                          <span>{todo.recurring_frequency}</span>
                        </div>
                      )}
                    </div>

                    {todo.description && (
                      <p className="text-text-secondary text-sm mb-4">
                        {todo.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {todo.target_amount && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-text-muted" />
                          <div>
                            <p className="text-xs text-text-muted">Target</p>
                            <p className="text-sm font-bold text-text-primary">
                              ₦{todo.target_amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {todo.target_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-text-muted" />
                          <div>
                            <p className="text-xs text-text-muted">
                              Target Date
                            </p>
                            <p className="text-sm font-bold text-text-primary">
                              {new Date(todo.target_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-text-muted" />
                        <div>
                          <p className="text-xs text-text-muted">Progress</p>
                          <p className="text-sm font-bold text-text-primary">
                            {todo.progress_percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {todo.target_amount && todo.target_amount > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-text-muted mb-1">
                          <span>Progress</span>
                          <span>
                            ₦{todo.current_amount.toLocaleString()} / ₦
                            {todo.target_amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-secondary-medium rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(todo.progress_percentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {todo.tags && todo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {todo.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-secondary-medium/50 border border-border rounded-lg text-xs text-text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingTodo(todo);
                      setFormData({
                        title: todo.title,
                        description: todo.description || "",
                        category: todo.category,
                        priority: todo.priority,
                        targetAmount: todo.target_amount?.toString() || "",
                        targetDate: todo.target_date || "",
                        isRecurring: todo.is_recurring,
                        recurringFrequency:
                          todo.recurring_frequency || "monthly",
                        tags: todo.tags,
                      });
                      setShowCreateForm(true);
                    }}
                    className="p-2 rounded-lg bg-secondary-medium/50 border border-border text-text-muted hover:text-primary hover:border-primary transition-all"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="p-2 rounded-lg bg-secondary-medium/50 border border-border text-text-muted hover:text-error hover:border-error transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-border flex gap-4">
                {todo.status !== "completed" && (
                  <button
                    onClick={() => toggleStatus(todo.id, "in_progress")}
                    className="flex-1 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20 transition-colors text-sm font-medium"
                  >
                    Start Progress
                  </button>
                )}

                {todo.status === "in_progress" && (
                  <button
                    onClick={() => toggleStatus(todo.id, "completed")}
                    className="flex-1 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/20 transition-colors text-sm font-medium"
                  >
                    Mark Complete
                  </button>
                )}

                {todo.target_amount && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Add progress"
                      className="w-32 px-3 py-2 rounded-lg bg-secondary-medium/50 border border-border text-sm"
                      min="0"
                      max={todo.target_amount - todo.current_amount}
                      step="0.01"
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget
                          .previousElementSibling as HTMLInputElement;
                        const value = parseFloat(input.value);
                        if (!isNaN(value) && value > 0) {
                          updateProgress(todo.id, todo.current_amount + value);
                          input.value = "";
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
