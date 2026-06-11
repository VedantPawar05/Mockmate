import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/learning`;

export const getPlaylistForTopic = async (topic: string) => {
  try {
    const response = await axios.get(`${API_URL}/playlist/${encodeURIComponent(topic)}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching playlist:", error);
    throw error;
  }
};

export const saveLearningProgress = async (topic: string, videoId: string) => {
  try {
    const response = await axios.post(`${API_URL}/progress`, { topic, videoId }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving progress:", error);
    throw error;
  }
};

export const getLearningProgress = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/progress/${userId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching learning progress:", error);
    throw error;
  }
};

export const resetLearningProgress = async (userId: string, topic: string) => {
  try {
    const response = await axios.delete(`${API_URL}/progress/${userId}/${encodeURIComponent(topic)}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error resetting progress:", error);
    throw error;
  }
};
