import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all doctors' availability for booking
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const doctorId = searchParams.get('doctorId');

    // Build filters
    const doctorFilter = {
      role: 'DOCTOR',
      verificationStatus: 'VERIFIED',
      ...(specialty && { specialty }),
      ...(doctorId && { id: doctorId }),
    };

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else {
      // Default to next 30 days
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      
      dateFilter.startTime = {
        gte: now,
        lte: thirtyDaysFromNow,
      };
    }

    // Get doctors with their availability
    const doctorsWithAvailability = await prisma.user.findMany({
      where: doctorFilter,
      include: {
        doctorAvailabilities: {
          where: {
            ...dateFilter,
            status: 'AVAILABLE',
          },
          orderBy: {
            startTime: 'asc',
          },
          include: {
            appointment: {
              select: {
                id: true,
                status: true,
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc',
      }
    });

    // Filter out doctors with no available slots
    const doctorsWithSlots = doctorsWithAvailability
      .filter(doctor => doctor.doctorAvailabilities.length > 0)
      .map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        imageUrl: doctor.imageUrl,
        description: doctor.description,
        verificationStatus: doctor.verificationStatus,
        availableSlots: doctor.doctorAvailabilities.length,
        nextAvailable: doctor.doctorAvailabilities[0]?.startTime,
        availability: doctor.doctorAvailabilities.map(slot => ({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status,
          isBooked: !!slot.appointment
        }))
      }));

    // Group availability by date for easier frontend handling
    const availabilityByDate = {};
    doctorsWithSlots.forEach(doctor => {
      doctor.availability.forEach(slot => {
        const dateKey = slot.startTime.toISOString().split('T')[0];
        if (!availabilityByDate[dateKey]) {
          availabilityByDate[dateKey] = {};
        }
        if (!availabilityByDate[dateKey][doctor.id]) {
          availabilityByDate[dateKey][doctor.id] = [];
        }
        availabilityByDate[dateKey][doctor.id].push(slot);
      });
    });

    return NextResponse.json({
      doctors: doctorsWithSlots,
      availabilityByDate,
      totalDoctors: doctorsWithSlots.length,
      totalSlots: doctorsWithSlots.reduce((acc, doctor) => acc + doctor.availableSlots, 0)
    });

  } catch (error) {
    console.error('Error fetching doctors availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors availability' },
      { status: 500 }
    );
  }
}

// Get specific doctor's availability
export async function POST(request) {
  try {
    const { doctorId, date } = await request.json();

    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 });
    }

    // Build date filter
    let dateFilter = {};
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);
      
      dateFilter = {
        startTime: {
          gte: targetDate,
          lt: nextDay,
        }
      };
    } else {
      // Next 7 days by default
      const now = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(now.getDate() + 7);
      
      dateFilter = {
        startTime: {
          gte: now,
          lte: sevenDaysFromNow,
        }
      };
    }

    // Get doctor with availability
    const doctor = await prisma.user.findUnique({
      where: {
        id: doctorId,
        role: 'DOCTOR',
        verificationStatus: 'VERIFIED',
      },
      include: {
        doctorAvailabilities: {
          where: {
            ...dateFilter,
            status: 'AVAILABLE',
          },
          orderBy: {
            startTime: 'asc',
          }
        }
      }
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Group slots by date
    const slotsByDate = doctor.doctorAvailabilities.reduce((acc, slot) => {
      const dateKey = slot.startTime.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status
      });
      return acc;
    }, {});

    return NextResponse.json({
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        imageUrl: doctor.imageUrl,
        description: doctor.description,
      },
      slotsByDate,
      totalAvailableSlots: doctor.doctorAvailabilities.length
    });

  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor availability' },
      { status: 500 }
    );
  }
}