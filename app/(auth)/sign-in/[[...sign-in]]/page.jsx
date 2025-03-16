"use client";
import { SignIn } from "@clerk/nextjs";
import React, { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page on load
  }, []);
  return (
    <SignIn
      path="/sign-in"
      routing="path"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard" // Redirect to dashboard after sign-in
      afterSignUpUrl="/onboarding" // Redirect to onboarding after sign-up
    />
  );
}
