import { useState, useEffect, useCallback } from "react";
import {
  WorkspaceApi,
  ProjectDto,
  TaskDto,
  TaskPaginationMeta,
} from "@/services/api.service";

export function useWorkspace() {
  // --- Structural Collections States ---
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [paginationMeta, setPaginationMeta] =
    useState<TaskPaginationMeta | null>(null);

  // --- Filter Condition States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // --- Operation Monitoring Flags ---
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  // 1. Debounce Search Input Strings to minimize unneeded backend database calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Force return to page 1 on lookup value shifts
    }, 400); // 400ms delay threshold
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Fetch Base Workspace Boards List
  const loadProjects = useCallback(async () => {
    setIsProjectsLoading(true);
    setWorkspaceError(null);
    try {
      const data = await WorkspaceApi.getProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err: any) {
      setWorkspaceError(
        err.response?.data?.message ||
          "Failed to sync platform workspace entities.",
      );
    } finally {
      setIsProjectsLoading(false);
    }
  }, [selectedProjectId]);

  // 3. Sync Workspace Tasks based on active filter parameters
  const loadTasks = useCallback(async () => {
    if (!selectedProjectId) return;
    setIsTasksLoading(true);
    try {
      const response = await WorkspaceApi.getTasks(selectedProjectId, {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        status: statusFilter,
        priority: priorityFilter,
      });
      setTasks(response.data);
      setPaginationMeta(response.meta);
    } catch (err: any) {
      console.error("Error handling background task refresh stream:", err);
    } finally {
      setIsTasksLoading(false);
    }
  }, [
    selectedProjectId,
    currentPage,
    itemsPerPage,
    debouncedSearch,
    statusFilter,
    priorityFilter,
  ]);

  // Handle reload execution cascades upon filter parameter shifts
  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // 4. Provision Project Method with integrated RBAC verification capture
  const createNewWorkspace = async (name: string, description?: string) => {
    setWorkspaceError(null);
    try {
      const newProject = await WorkspaceApi.createProject({
        name,
        description,
      });
      setProjects((prev) => [...prev, newProject]);
      setSelectedProjectId(newProject.id);
      return { success: true };
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Access Denied: Action blocked by security boundary layers.";
      setWorkspaceError(Array.isArray(msg) ? msg[0] : msg);
      return { success: false, error: msg };
    }
  };

  return {
    // Core Data Nodes
    projects,
    selectedProjectId,
    setSelectedProjectId,
    tasks,
    paginationMeta,
    currentPage,
    setCurrentPage,

    // Controlled Search and Filtering Hooks
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,

    // Flag Interceptors
    isProjectsLoading,
    isTasksLoading,
    workspaceError,
    setWorkspaceError,

    // Mutation Handles
    createNewWorkspace,
    refreshTasks: loadTasks,
  };
}
