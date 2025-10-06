"use client";

import { useState, useEffect } from "react";

export function DashboardGreetingSimple() {
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 12) {
        return "Good Morning";
      } else if (hour >= 12 && hour < 17) {
        return "Good Afternoon";
      } else if (hour >= 17 && hour < 21) {
        return "Good Evening";
      } else {
        return "Good Night";
      }
    };

    setGreeting(getGreeting());
  }, []);

  return <span>{greeting}!</span>;
}
