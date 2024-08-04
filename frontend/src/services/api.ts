import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getVehicles = async () => {
  return await axios.get(`${backendUrl}/vehicles`);
};

export const createVehicle = async (data: any) => {
  return await axios.post(`${backendUrl}/vehicles`, data);
};

export const addMaintenanceRecord = async (vehicleId: string, data: any) => {
  return await axios.post(
    `${backendUrl}/vehicles/${vehicleId}/maintenance`,
    data
  );
};

export const getVehicleDetails = async (vehicleId: string) => {
  return await axios.get(`${backendUrl}/vehicles/${vehicleId}`);
};

export const getVehicleStatus = async (vehicleId: string) => {
  return await axios.get(`${backendUrl}/vehicles/${vehicleId}/status`);
};

export const getMaintenanceRecords = async (vehicleId: string) => {
  return await axios.get(`${backendUrl}/vehicles/${vehicleId}/maintenance`);
};
