import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/analytics`;

export const getPerformanceAnalytics = async () => {
  try {
    const response = await axios.get(`${API_URL}/weakness`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching performance analytics:", error);
    throw error;
  }
};
