import React, { Suspense } from "react";
import DashboardPage from "./page";
import { BarLoader } from "react-spinners";

const DashboardLayout = () => {
  return (
    <div className="container mx-auto my-32">
      <h1 className="text-6xl font-bold tracking-tight gradient-title">
        Dashboard
      </h1>

      {/* Dashboard Page */}
      <Suspense fallback={<BarLoader className="mt-4" width={"100%"} />}>
        <DashboardPage />
      </Suspense>
    </div>
  );
};

export default DashboardLayout;
