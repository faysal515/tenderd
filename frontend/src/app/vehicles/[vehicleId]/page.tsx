"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  addMaintenanceRecord,
  getVehicleStatus,
  getMaintenanceRecords,
} from "../../../services/api";
import clsx from "clsx";

interface AggregatedSensorData {
  lastGpsLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  odometerReading: number;
  engineHours: number;
  fuelLevel: string;
  timestamp: string;
}

interface MaintenanceRecord {
  id: string;
  date: string;
  description: string;
  cost: number;
}

interface UsageAnalytics {
  distanceTraveled: number;
  hoursOperated: number;
}

interface Vehicle {
  id: string;
  make: string;
  vehicleModel: string;
  year: number;
  ecuDeviceId: string;
  aggregatedSensorData: AggregatedSensorData | null;
  lastMaintenanceRecord: MaintenanceRecord | null;
  usageAnalytics: UsageAnalytics | null;
}

const VehicleDetails: React.FC = () => {
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ description: "", date: "", cost: "" });
  const [status, setStatus] = useState<AggregatedSensorData | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [flash, setFlash] = useState(false);

  const fetchVehicleStatus = useCallback(async () => {
    if (!vehicleId) return;

    try {
      const response = await getVehicleStatus(vehicleId);
      console.log("Vehicle status fetched:", response.data);
      setVehicle(response.data);
    } catch (error) {
      console.error("Error fetching vehicle status:", error);
    }
  }, [vehicleId]);

  const fetchMaintenanceRecords = useCallback(async () => {
    try {
      const response = await getMaintenanceRecords(vehicleId);
      console.log("Maintenance records fetched:", response.data);
      setMaintenanceRecords(response.data);
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
    }
  }, [vehicleId]);

  const setupSSE = useCallback(() => {
    if (!vehicleId || eventSource) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const newEventSource = new EventSource(
      `${backendUrl}/vehicles/${vehicleId}/status`
    );

    console.log("Setting up SSE for URL:", newEventSource.url);

    newEventSource.onopen = () => {
      console.log("SSE connection opened for vehicleId:", vehicleId);
    };

    newEventSource.onmessage = (event) => {
      console.log("Received SSE event:", event);
      try {
        const updatedStatus = JSON.parse(event.data);
        console.log("Parsed SSE update:", updatedStatus);

        if (updatedStatus.error) {
          console.error(updatedStatus.error);
          setVehicle(null);
        } else {
          setStatus(updatedStatus);
          setVehicle(updatedStatus);
          setFlash(true); // Trigger flash effect
          setTimeout(() => setFlash(false), 500); // Remove flash effect after 500ms
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    newEventSource.onerror = (error) => {
      console.error("SSE error:", error);
      newEventSource.close();
    };

    setEventSource(newEventSource);
  }, [vehicleId]);

  useEffect(() => {
    if (vehicleId) {
      console.log(
        "Fetching vehicle details and status for vehicleId:",
        vehicleId
      );
      fetchVehicleStatus();
      fetchMaintenanceRecords();
      setupSSE();
    } else {
      console.log("vehicleId is not defined");
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }
    };
  }, [vehicleId, fetchVehicleStatus, fetchMaintenanceRecords, setupSSE]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        cost: parseFloat(form.cost),
      };
      await addMaintenanceRecord(vehicleId, payload);
      handleClose();
      fetchMaintenanceRecords();
    } catch (error: any) {
      console.error("Error adding maintenance record:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        const apiErrors = error.response.data.errors.reduce(
          (acc: any, err: any) => {
            acc[err.property] = Object.values(err.constraints).join(", ");
            return acc;
          },
          {}
        );
        setErrors(apiErrors);
      }
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Vehicle Details Page</h1>
        {vehicle ? (
          <div className={clsx({ "animate-flash": flash })}>
            <h1 className="text-2xl font-bold mb-4">
              {`${vehicle.make} ${vehicle.vehicleModel} (${vehicle.year})`}
            </h1>
            {vehicle.aggregatedSensorData ? (
              <>
                <p className="mb-2">
                  <strong>Last Location:</strong>{" "}
                  {`${vehicle.aggregatedSensorData.lastGpsLocation.latitude.toFixed(
                    4
                  )}° N, ${vehicle.aggregatedSensorData.lastGpsLocation.longitude.toFixed(
                    4
                  )}° W`}
                </p>
                <p className="mb-2">
                  <strong>Last Update:</strong>{" "}
                  {new Date(
                    vehicle.aggregatedSensorData.timestamp
                  ).toLocaleString()}
                </p>
                <p className="mb-2">
                  <strong>Odometer Reading:</strong>{" "}
                  {vehicle.aggregatedSensorData.odometerReading} miles
                </p>
                <p className="mb-2">
                  <strong>Engine Hours:</strong>{" "}
                  {vehicle.aggregatedSensorData.engineHours} hours
                </p>
                <p className="mb-2">
                  <strong>Fuel Level:</strong>{" "}
                  {vehicle.aggregatedSensorData.fuelLevel}
                </p>
              </>
            ) : (
              <p className="mb-2">No sensor data available.</p>
            )}
            <h2 className="text-xl font-bold mt-4 mb-2">
              Maintenance Records:
            </h2>
            <ul className="list-disc pl-5">
              {maintenanceRecords.length > 0 ? (
                maintenanceRecords.map((record) => (
                  <li key={record.id}>
                    {new Date(record.date).toLocaleDateString()} - $
                    {record.cost}
                  </li>
                ))
              ) : (
                <li>No maintenance records available.</li>
              )}
            </ul>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
              onClick={handleOpen}
            >
              Add Maintenance Record
            </button>
            {open && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="bg-white p-8 rounded-lg shadow-lg w-1/2">
                  <h2 className="text-xl font-bold mb-4">
                    Add Maintenance Record
                  </h2>
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="description"
                    >
                      Description
                    </label>
                    <input
                      id="description"
                      name="description"
                      type="text"
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={form.description}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs italic">
                        {errors.description}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="date"
                    >
                      Date
                    </label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={form.date}
                    />
                    {errors.date && (
                      <p className="text-red-500 text-xs italic">
                        {errors.date}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="cost"
                    >
                      Cost
                    </label>
                    <input
                      id="cost"
                      name="cost"
                      type="number"
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={form.cost}
                    />
                    {errors.cost && (
                      <p className="text-red-500 text-xs italic">
                        {errors.cost}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      type="button"
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      type="button"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            <h2 className="text-xl font-bold mt-4 mb-2">Usage Analytics:</h2>
            {vehicle.usageAnalytics ? (
              <>
                <p className="mb-2">
                  <strong>Distance Traveled:</strong>{" "}
                  {vehicle.usageAnalytics.distanceTraveled} miles
                </p>
                <p className="mb-2">
                  <strong>Hours Operated:</strong>{" "}
                  {vehicle.usageAnalytics.hoursOperated} hours
                </p>
              </>
            ) : (
              <p className="mb-2">No usage analytics available.</p>
            )}
          </div>
        ) : (
          <p className="text-lg font-bold mb-2">No vehicle data available.</p>
        )}
      </div>
    </div>
  );
};

export default VehicleDetails;
