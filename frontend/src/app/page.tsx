import React from "react";
import VehicleList from "./components/VehicleList";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Vehicle Dashboard</h1>
        <VehicleList />
      </div>
    </div>
  );
};

export default Home;
