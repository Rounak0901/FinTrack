"use client";
import { SignUp } from "@clerk/nextjs";
import React, { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page on load
  }, []);
  return <SignUp />;
}
