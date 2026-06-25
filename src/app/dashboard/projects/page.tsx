"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/hooks/useWorkspace";
import { WorkspaceApi, TaskDto, CommentDto } from "@/services/api.service";
import {
  FolderPlus,
  Search,
  SlidersHorizontal,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function ProjectWorkspacePage() {
  const { user } = useAuth();

  // Custom State and API Integration Hook
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    tasks,
    paginationMeta,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    isProjectsLoading,
    isTasksLoading,
    workspaceError,
    setWorkspaceError,
    createNewWorkspace,
    refreshTasks,
  } = useWorkspace();

  // Project Creation Inputs
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");

  // Slide-out Comment Details Drawer State
  const [activeTask, setActiveTask] = useState<TaskDto | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName) return;
    const result = await createNewWorkspace(newProjName, newProjDesc);
    if (result.success) {
      setNewProjName("");
      setNewProjDesc("");
    }
  };

  const handleOpenCommentDrawer = async (task: TaskDto) => {
    setActiveTask(task);
    setIsCommentsLoading(true);
    try {
      const data = await WorkspaceApi.getComments(task.id);
      setComments(data);
    } catch (err) {
      console.error("Failed to sync data stream logs.", err);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const handlePostCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput || !activeTask) return;
    try {
      const freshComment = await WorkspaceApi.postComment(
        activeTask.id,
        commentInput,
      );
      setComments((prev) => [...prev, freshComment]);
      setCommentInput("");
    } catch (err) {
      console.error("Failed to commit message string tracking instance.", err);
    }
  };

  if (isProjectsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={32} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-0 flex flex-col relative">
      {/* HEADER SECTION WITH WORKSPACE ROUTING BAR & PROJECT CREATOR */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between border-b border-slate-800/60 pb-6">
        <div>
          <label className="block text-xs font-mono tracking-widest text-slate-500 uppercase mb-2">
            Active Workspace Channel
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-brand-surface border border-slate-700 px-4 py-2.5 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-indigo-500 cursor-pointer shadow-md"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {user?.role === "MANAGER" || user?.role === "ADMIN" ? (
          <form
            onSubmit={handleCreateProjectSubmit}
            className="flex flex-wrap items-center gap-3 bg-brand-surface p-3 rounded-xl border border-slate-800/80 shadow-inner"
          >
            <input
              type="text"
              placeholder="Workspace Board Identity"
              value={newProjName}
              onChange={(e) => setNewProjName(e.target.value)}
              className="px-3 py-2 text-xs bg-[#090D16] border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200"
              required
            />
            <input
              type="text"
              placeholder="Scope Specifications"
              value={newProjDesc}
              onChange={(e) => setNewProjDesc(e.target.value)}
              className="px-3 py-2 text-xs bg-[#090D16] border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200 hidden sm:inline-block"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-600 cursor-pointer transition-transform active:scale-95"
            >
              <FolderPlus size={14} /> Provision Board
            </button>
          </form>
        ) : (
          <div className="text-xs bg-slate-900/60 text-slate-400 p-3 rounded-xl border border-slate-800 flex items-center gap-2 max-w-sm">
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
            <span>
              Workspace generation locked. Profile level:{" "}
              <strong>{user?.role}</strong>.
            </span>
          </div>
        )}
      </div>

      {/* DYNAMIC ERROR EXCEPTION BANNER */}
      {workspaceError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 flex items-center justify-between text-red-400 text-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>{workspaceError}</span>
          </div>
          <button
            onClick={() => setWorkspaceError(null)}
            className="text-slate-400 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}

      {/* SEARCH AND COMBINED FILTER OPERATIONS CONTROL HUB */}
      <div className="bg-brand-surface p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row gap-4 items-center justify-between shadow-card">
        <div className="w-full md:max-w-xs relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Query task title context strings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#090D16] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <SlidersHorizontal
            size={14}
            className="text-slate-500 hidden sm:inline-block"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-slate-300"
          >
            <option value="">All Flow Statuses</option>
            <option value="TODO">To-Do List</option>
            <option value="IN_PROGRESS">Active Production (In Progress)</option>
            <option value="DONE">Deployed Verification (Done)</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-slate-300"
          >
            <option value="">All Urgency Levels</option>
            <option value="LOW">Low Latency</option>
            <option value="MEDIUM">Medium Target</option>
            <option value="HIGH">High Criticality</option>
          </select>
        </div>
      </div>

      {/* CORE BOARD KANBAN LAYOUT STACK COLUMN PANELS */}
      {isTasksLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 size={24} className="text-indigo-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {(["TODO", "IN_PROGRESS", "DONE"] as const).map((columnStatus) => {
            const columnTasks = tasks.filter((t) => t.status === columnStatus);
            const colConfig = {
              TODO: {
                name: "Backlog Queue",
                color: "var(--color-status-todo)",
              },
              IN_PROGRESS: {
                name: "Active Build Tasks",
                color: "var(--color-status-inprogress)",
              },
              DONE: {
                name: "Closed Verification Nodes",
                color: "var(--color-status-done)",
              },
            };

            return (
              <div
                key={columnStatus}
                className="flex flex-col bg-slate-900/40 rounded-2xl p-4 border border-slate-800/40 h-full min-h-[400px]"
              >
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800/60">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: colConfig[columnStatus].color }}
                  />
                  <h3 className="font-bold text-sm text-white">
                    {colConfig[columnStatus].name}
                  </h3>
                  <span className="ml-auto text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {columnTasks.map((task) => {
                    const prioStyles = {
                      LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      MEDIUM:
                        "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      HIGH: "bg-red-500/10 text-red-400 border-red-500/20",
                    };

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleOpenCommentDrawer(task)}
                        className="bg-brand-surface p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer shadow-sm group"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="font-semibold text-xs text-slate-200 group-hover:text-indigo-400 line-clamp-2">
                            {task.title}
                          </h4>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${prioStyles[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                          {task.description}
                        </p>
                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[10px] text-slate-500 font-mono">
                          <span>
                            👤 {task.assignee?.name || "Unassigned Node"}
                          </span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />{" "}
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INTERNAL PAGINATION NAVIGATION STRIP */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-6 font-mono text-xs text-slate-500">
        <span>
          Segment List Page {currentPage} of {paginationMeta?.totalPages || 1}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 border border-slate-800 rounded-lg bg-brand-surface text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(p + 1, paginationMeta?.totalPages || 1),
              )
            }
            disabled={currentPage >= (paginationMeta?.totalPages || 1)}
            className="p-2 border border-slate-800 rounded-lg bg-brand-surface text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* CONTEXTUAL DISCUSSION MODAL DRAWER SLIDE-OUT */}
      {activeTask && (
        <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-brand-surface border-l border-slate-800 z-50 shadow-2xl flex flex-col p-6 animate-slide-in">
          <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">
                Task Identity Inspection
              </span>
              <h3 className="font-bold text-sm text-white mt-1 line-clamp-1">
                {activeTask.title}
              </h3>
            </div>
            <button
              onClick={() => {
                setActiveTask(null);
                setComments([]);
              }}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="bg-[#090D16] p-4 rounded-xl border border-slate-800 mb-6">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
              Functional Requirements Specifications
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeTask.description ||
                "No descriptive context parameters available."}
            </p>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <h4 className="font-bold text-xs text-slate-400 flex items-center gap-2 mb-3">
              <MessageSquare size={14} /> Message Board Timelines (
              {comments.length})
            </h4>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
              {isCommentsLoading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 size={18} className="text-slate-500 animate-spin" />
                </div>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-slate-800/60 bg-slate-900/30 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold text-indigo-400">
                        {c.user?.name}
                      </span>
                      <span className="text-slate-500">
                        {new Date(c.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handlePostCommentSubmit}
              className="mt-auto border-t border-slate-800 pt-4 flex gap-2"
            >
              <input
                type="text"
                placeholder="Append comment stream strings..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-[#090D16] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
              <button
                type="submit"
                className="px-4 bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center hover:bg-indigo-600 cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
