"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { addMaintenanceRecord, getVehicleStatus } from "../../../services/api";
import {
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

const VehicleDetails: React.FC = () => {
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const [vehicle, setVehicle] = useState(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ description: "", date: "", cost: "" });
  const [status, setStatus] = useState(null);

  const fetchVehicleStatus = useCallback(async () => {
    if (!vehicleId) return;

    try {
      const response = await getVehicleStatus(vehicleId);
      console.log("Vehicle status fetched:", response.data);
      setVehicle(response.data);
      setMaintenanceRecords(response.data.maintenanceRecords || []);
    } catch (error) {
      console.error("Error fetching vehicle status:", error);
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

        setStatus(updatedStatus);
        setVehicle(updatedStatus);
        setMaintenanceRecords(updatedStatus.maintenanceRecords || []);
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
      // fetchVehicleStatus();
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
  }, [vehicleId, setupSSE]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await addMaintenanceRecord(vehicleId, form);
      handleClose();
      // fetchVehicleStatus();
    } catch (error) {
      console.error("Error adding maintenance record:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {vehicle ? (
        <>
          <Typography variant="h4" className="mb-4">
            {`${vehicle.make} ${vehicle.vehicleModel} (${vehicle.year})`}
          </Typography>
          <Typography variant="h6" className="mb-2">
            ECU Device ID: {vehicle.ecuDeviceId}
          </Typography>
          <Typography variant="h6" className="mb-2">
            Aggregated Sensor Data:
          </Typography>
          <pre>{JSON.stringify(vehicle.aggregatedSensorData, null, 2)}</pre>
          <Typography variant="h6" className="mb-2">
            Maintenance Records:
          </Typography>
          <ul>
            {maintenanceRecords.map((record: any) => (
              <li key={record.id}>
                {`${record.date}: ${record.description} ($${record.cost})`}
              </li>
            ))}
          </ul>
          <Button
            variant="contained"
            color="primary"
            className="mt-4"
            onClick={handleOpen}
          >
            Add Maintenance Record
          </Button>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add Maintenance Record</DialogTitle>
            <DialogContent>
              <TextField
                name="description"
                label="Description"
                fullWidth
                onChange={handleChange}
              />
              <TextField
                name="date"
                label="Date"
                type="date"
                fullWidth
                onChange={handleChange}
              />
              <TextField
                name="cost"
                label="Cost"
                type="number"
                fullWidth
                onChange={handleChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </DialogActions>
          </Dialog>
          <Typography variant="h6" className="mb-2">
            Usage Analytics:
          </Typography>
          <pre>{JSON.stringify(vehicle.usageAnalytics, null, 2)}</pre>
        </>
      ) : (
        <Typography variant="h6" className="mb-2">
          No vehicle data available.
        </Typography>
      )}
    </div>
  );
};

export default VehicleDetails;
