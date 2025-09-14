import { useState } from "react";
import { toast } from "sonner";

export function useSubscription() {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("free_user");

  const subscribeToPlan = async (planId) => {
    if (loading) return;

    setLoading(true);
    try {
      console.log("🔄 Subscribing to plan:", planId);
      
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: planId }),
      });

      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response not ok:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("📄 Response data:", data);

      if (data.success) {
        setCurrentPlan(planId);
        toast.success(data.message, {
          description: `You received ${data.creditsAdded} credits!`,
        });
        
        // Reload page to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
        return { success: true, data };
      } else {
        throw new Error(data.error || data.details || "Subscription failed");
      }
    } catch (error) {
      console.error("❌ Subscription error:", error);
      toast.error("Failed to subscribe", {
        description: error.message || "Please try again later",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSubscription = async () => {
    try {
      const response = await fetch("/api/subscribe");
      const data = await response.json();

      if (data.success) {
        setCurrentPlan(data.currentPlan);
        return data;
      }
    } catch (error) {
      console.error("Get subscription error:", error);
    }
    return null;
  };

  return {
    loading,
    currentPlan,
    subscribeToPlan,
    getCurrentSubscription,
  };
}