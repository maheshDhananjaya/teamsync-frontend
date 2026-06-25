import { api } from "@/utils/api";

// --- Structural API Interfaces ---
export interface ProjectDto {
  id: string;
  name: string;
  description?: string;
}

export interface TaskDto {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  assignee?: { id: string; name: string } | null;
}

export interface CommentDto {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
}

export interface TaskPaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedTaskResponse {
  data: TaskDto[];
  meta: TaskPaginationMeta;
}

// --- Network Action Payload Mappings ---
export const WorkspaceApi = {
  // Project Management Actions
  getProjects: async (): Promise<ProjectDto[]> => {
    const response = await api.get<ProjectDto[]>("/projects");
    console.log("response", response);
    return response.data;
  },

  createProject: async (payload: {
    name: string;
    description?: string;
  }): Promise<ProjectDto> => {
    const response = await api.post<ProjectDto>("/projects", payload);
    return response.data;
  },

  // High-Performance Filtered & Paginated Task Queries
  getTasks: async (
    projectId: string,
    params: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      priority?: string;
    },
  ): Promise<PaginatedTaskResponse> => {
    // Converts values into clean backend-compatible URL search parameters
    const query = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.priority && { priority: params.priority }),
    });

    const response = await api.get<PaginatedTaskResponse>(
      `/projects/${projectId}/tasks?${query.toString()}`,
    );
    return response.data;
  },

  // Task Card Sub-Discussion Strings
  getComments: async (taskId: string): Promise<CommentDto[]> => {
    const response = await api.get<CommentDto[]>(`/tasks/${taskId}/comments`);
    return response.data;
  },

  postComment: async (taskId: string, content: string): Promise<CommentDto> => {
    const response = await api.post<CommentDto>(`/tasks/${taskId}/comments`, {
      content,
    });
    return response.data;
  },
};
