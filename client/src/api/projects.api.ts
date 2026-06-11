import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/projects`;

export const saveProject = async (projectData: any) => {
  try {
    const response = await axios.post(`${API_URL}/save`, projectData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving project:", error);
    throw error;
  }
};

export const updateProjectStatus = async (projectId: string, status: string) => {
  try {
    const response = await axios.patch(`${API_URL}/${projectId}/status`, { status }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating project status:", error);
    throw error;
  }
};

export const getUserProjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};
