import { getDoctorById, getAvailableTimeSlots } from "@/actions/appointments";
import { DoctorProfile } from "./_components/doctor-profile";
import { redirect } from "next/navigation";

export default async function DoctorProfilePage({ params }) {
  const { id } = await params;

  try {
    // Fetch doctor data first
    const doctorData = await getDoctorById(id);
    
    // Try to fetch available slots, but don't fail if there are none
    let slotsData = { days: [] };
    try {
      slotsData = await getAvailableTimeSlots(id);
    } catch (slotsError) {
      console.log("No availability set for doctor:", id);
      // Continue with empty slots - this is not a critical error
    }

    return (
      <DoctorProfile
        doctor={doctorData.doctor}
        availableDays={slotsData.days || []}
      />
    );
  } catch (error) {
    console.error("Error loading doctor profile:", error);
    redirect("/doctors");
  }
}
