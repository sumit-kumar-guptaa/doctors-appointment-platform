// /app/doctors/[id]/page.jsx
import { getDoctorById, getAvailableTimeSlots } from "@/actions/appointments";
import { DoctorProfile } from "./_components/doctor-profile";
import { redirect } from "next/navigation";

export default async function DoctorProfilePage({ params }) {
  try {
    // Fetch doctor data and available slots in parallel
    const [doctorData, slotsData] = await Promise.all([
      getDoctorById(params.id),
      getAvailableTimeSlots(params.id),
    ]);

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
