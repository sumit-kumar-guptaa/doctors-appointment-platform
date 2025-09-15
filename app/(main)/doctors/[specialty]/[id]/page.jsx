import { getDoctorById, getAvailableTimeSlots } from "@/actions/appointments";
import { DoctorProfile } from "./_components/doctor-profile";
import { redirect } from "next/navigation";

export default async function DoctorProfilePage({ params }) {
  const { id } = await params;

  try {
    console.log("📋 Loading doctor profile page for ID:", id);
    
    // Fetch doctor data first
    const doctorResponse = await getDoctorById(id);
    
    if (!doctorResponse || !doctorResponse.doctor) {
      console.error("❌ Doctor not found:", id);
      redirect("/doctors");
    }

    // Fetch available slots with improved error handling
    let slotsData = { days: [], success: false };
    try {
      slotsData = await getAvailableTimeSlots(id);
      console.log("📅 Available slots fetched:", slotsData.days?.length || 0, "days");
    } catch (slotsError) {
      console.warn("⚠️ No availability set for doctor:", id, slotsError.message);
      // Continue with empty slots - this is not a critical error
      slotsData = { 
        days: [], 
        success: false, 
        message: "Doctor availability not set yet"
      };
    }

    console.log("✅ Doctor profile loaded successfully");

    return (
      <DoctorProfile
        doctor={doctorResponse.doctor}
        availableDays={slotsData.days || []}
        availabilityMessage={slotsData.message}
      />
    );
  } catch (error) {
    console.error("❌ Error loading doctor profile:", error);
    redirect("/doctors");
  }
}
