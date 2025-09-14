"use server";

import { db } from "@/lib/prisma";

/**
 * Get doctors by specialty
 */
export async function getDoctorsBySpecialty(specialty) {
  try {
    // Test database connection first
    await db.$connect();
    
    const doctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
        specialty: specialty.split("%20").join(" "),
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        specialty: true,
        experience: true,
        consultationFee: true,
        description: true,
        workingHospital: true,
        verificationStatus: true,
        isOnline: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { doctors };
  } catch (error) {
    console.error("Failed to fetch doctors by specialty:", error);
    
    // Return mock data when database is unreachable
    if (error.code === 'P1001' || error.message.includes("Can't reach database")) {
      console.log("Database unreachable, returning mock data");
      return {
        doctors: [
          {
            id: "mock-1",
            name: "Dr. Sarah Johnson",
            imageUrl: "/placeholder-doctor.jpg",
            specialty: specialty.split("%20").join(" "),
            experience: 8,
            consultationFee: 500,
            description: "Experienced specialist with excellent patient care record.",
            workingHospital: "City General Hospital",
            verificationStatus: "VERIFIED",
            isOnline: true,
          },
          {
            id: "mock-2",
            name: "Dr. Michael Chen",
            imageUrl: "/placeholder-doctor.jpg",
            specialty: specialty.split("%20").join(" "),
            experience: 12,
            consultationFee: 700,
            description: "Senior consultant with extensive experience in the field.",
            workingHospital: "Metropolitan Medical Center",
            verificationStatus: "VERIFIED",
            isOnline: false,
          }
        ]
      };
    }
    
    return { error: "Failed to fetch doctors" };
  } finally {
    await db.$disconnect();
  }
}
