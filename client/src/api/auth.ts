import type { funcResponse } from "../types/types";

export const sendIdTokenToBackend = async (idToken: string, backendUrl: string): Promise<funcResponse<string>> => {
  try {
    const response = await fetch(backendUrl + "/auth/google/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ idToken }),
    });
    if (response.ok) {
      console.log('idToken sent successfully');
      const resultData = await response.json();
      console.log(resultData);
      return [resultData.data, null];
    } else {
      return [null, new Error('Failed to send idToken')];
    }
  } catch (error) {
    return [null, new Error('Error sending idToken:' + error)];
  }
};

export const fetchUserName = async (idToken: string, backendUrl: string): Promise<funcResponse<string>> => {
  try {
    const response = await fetch(`${backendUrl}/auth/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });
    if (response.ok) {
      const apiResoponse = await response.json();
      return [apiResoponse.data.name, null]; // Assuming the backend returns { name: "..." }
    } else {
      return [null, new Error('Failed to fetch user name:' + response.statusText)];
    }
  } catch (error) {
    return [null, new Error('Error fetching user name:' + error)];
  }
};