const API_URL = 'https://task-management-backend-topaz-six.vercel.app/api';

const getToken = () => {
    return localStorage.getItem('token');
};

const apiRequest = async (url, options = {}) => {
    const token = getToken();

    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && {
                Authorization: `Bearer ${token}`
            }),
            ...(options.headers || {})
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            'Something went wrong'
        );
    }

    return data;
};


// AUTH

export const loginUser = async (email, password) => {
    return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password
        })
    });
};


// TASKS

export const getTasks = async () => {
    return apiRequest('/tasks');
};

export const createTask = async (taskData) => {
    return apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
    });
};

export const updateTaskStatus = async (id, status) => {
    return apiRequest(`/tasks/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
            status
        })
    });
};

export const deleteTask = async (id) => {
    return apiRequest(`/tasks/${id}`, {
        method: 'DELETE'
    });
};


// PROJECTS

export const getProjects = async () => {
    return apiRequest('/projects');
};

export const createProject = async (projectData) => {
    return apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
    });
};

export const updateProject = async (id, projectData) => {
    return apiRequest(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData)
    });
};

export const deleteProject = async (id) => {
    return apiRequest(`/projects/${id}`, {
        method: 'DELETE'
    });
};


// USERS

export const getUsers = async () => {
    return apiRequest('/users');
};

export const createUser = async (userData) => {
    return apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
};

export const deleteUser = async (id) => {
    return apiRequest(`/users/${id}`, {
        method: 'DELETE'
    });
};


// CHAT

export const getChatHistory = async (userId) => {
    return apiRequest(`/chat/messages/${userId}`);
};

export const sendChatMessage = async (recipientId, text) => {
    return apiRequest('/chat/send', {
        method: 'POST',
        body: JSON.stringify({
            recipient: recipientId,
            text
        })
    });
};