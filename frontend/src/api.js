import axios from "axios";

// Spring Boot backend address
const API = axios.create({
    baseURL: "http://localhost:8080/jobs",
    headers: {
        "Content-Type": "application/json",
    },
});

// Get all job applications
export const getAllJobs = async () => {
    const response = await API.get("");
    return response.data;
};

// Add a new job application
export const createJob = async (job) => {
    const response = await API.post("", job);
    return response.data;
};

// Update an existing job application
export const updateJob = async (id, job) => {
    const response = await API.put(`/${id}`, job);
    return response.data;
};

// Delete a job application
export const deleteJob = async (id) => {
    await API.delete(`/${id}`);
};

// Search applications by company name
export const searchJobs = async (companyName) => {
    const response = await API.get("/search", {
        params: { companyName },
    });

    return response.data;
};

// Filter applications by status
export const filterJobs = async (status) => {
    const response = await API.get("/filter", {
        params: { status },
    });

    return response.data;
};

export default API;

