"use client";

import React, { useEffect, useState } from "react";
import { getVehicles, createVehicle } from "../../services/api";
import { useRouter } from "next/navigation";

const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    make: "",
    vehicleModel: "",
    year: "",
    ecuDeviceId: "",
  });
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const response = await getVehicles();
    setVehicles(response.data);
  };

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
      const vehicleData = {
        ...form,
        year: Number(form.year), // Convert year to a number
      };
      await createVehicle(vehicleData);
      handleClose();
      fetchVehicles();
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.errors) {
        const apiErrors = error.response.data.errors.reduce(
          (acc: any, err: any) => {
            acc[err.property] = Object.values(err.constraints).join(", ");
            return acc;
          },
          {}
        );
        setErrors(apiErrors);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <div className="container mx-auto">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleOpen}
      >
        Add Vehicle
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {vehicles.map((vehicle: any) => (
          <div
            key={vehicle.id}
            className="block p-6 bg-white rounded-lg shadow-md hover:bg-gray-100"
            onClick={() => router.push(`/vehicles/${vehicle.id}`)}
          >
            <h5 className="text-lg font-bold mb-2">{`${vehicle.make} ${vehicle.vehicleModel} (${vehicle.year})`}</h5>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">Add New Vehicle</h2>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="make"
              >
                Make
              </label>
              <input
                id="make"
                name="make"
                type="text"
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.make ? "border-red-500" : ""
                }`}
              />
              {errors.make && (
                <p className="text-red-500 text-xs italic">{errors.make}</p>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="vehicleModel"
              >
                Model
              </label>
              <input
                id="vehicleModel"
                name="vehicleModel"
                type="text"
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.vehicleModel ? "border-red-500" : ""
                }`}
              />
              {errors.vehicleModel && (
                <p className="text-red-500 text-xs italic">
                  {errors.vehicleModel}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="year"
              >
                Year
              </label>
              <input
                id="year"
                name="year"
                type="number"
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.year ? "border-red-500" : ""
                }`}
              />
              {errors.year && (
                <p className="text-red-500 text-xs italic">{errors.year}</p>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="ecuDeviceId"
              >
                ECU Device ID
              </label>
              <input
                id="ecuDeviceId"
                name="ecuDeviceId"
                type="text"
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.ecuDeviceId ? "border-red-500" : ""
                }`}
              />
              {errors.ecuDeviceId && (
                <p className="text-red-500 text-xs italic">
                  {errors.ecuDeviceId}
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
    </div>
  );
};

export default VehicleList;
