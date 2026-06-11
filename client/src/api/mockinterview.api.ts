import axios from 'axios';
import { MockInterview } from '@/vite-env';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/mockinterview`;

// Create Interview
export const createInterview = async (interviewData: MockInterview) => {
  try {
    const response = await axios.post(`${API_URL}/create`, interviewData, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating interview:', (error as any)?.response?.data?.message ?? error);
    throw error;
  }
};

// Get All Interviews
export const getAllInterviews = async (filters?: { topic?: string; difficulty?: string }) => {
  try {
    const params = new URLSearchParams();
    if (filters?.topic) params.append("topic", filters.topic);
    if (filters?.difficulty) params.append("difficulty", filters.difficulty);

    const response = await axios.get(`${API_URL}/?${params.toString()}`, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching interviews:', (error as any)?.response?.data?.message ?? error);
    throw error;
  }
};

// Get Interview by ID
export const getInterviewByID = async (interviewID: string) => {
  try {
    const response = await axios.get(`${API_URL}/${interviewID}`, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching interview by ID:', (error as any)?.response?.data?.message ?? error);
    throw error;
  }
};

// Edit Interview
export const editInterview = async (interviewID: string, interviewData: MockInterview) => {
  try {
    const response = await axios.put(`${API_URL}/edit/${interviewID}`, interviewData, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Error editing interview:', (error as any)?.response?.data?.message ?? error);
    throw error;
  }
};

// Delete Interview
export const deleteInterview = async (interviewID: string) => {
  try {
    const response = await axios.delete(`${API_URL}/delete/${interviewID}`, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting interview:', (error as any)?.response?.data?.message ?? error);
    throw error;
  }
};