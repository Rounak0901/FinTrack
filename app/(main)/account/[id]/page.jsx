import React from "react";

const Account = ({ params }) => {
  return (
    <div className="container mx-auto my-32">
      <h1 className="text-6xl font-bold tracking-tight gradient-title">
        Account
      </h1>
      <h3>Account ID: {params.id}</h3>
    </div>
  );
};

export default Account;
