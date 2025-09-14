import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get doctor's availability
export async function GET(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Find the doctor
    const doctor = await prisma.user.findFirst({
      where: doctorId ? { id: doctorId } : { clerkUserId: userId },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get availability slots
    const availability = await prisma.availability.findMany({
      where: {
        doctorId: doctor.id,
        ...dateFilter,
      },
      orderBy: {
        startTime: 'asc',
      },
      include: {
        appointment: {
          include: {
            patient: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ availability, doctor: { id: doctor.id, name: doctor.name } });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

// Create/Update doctor's availability
export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slots, replaceAll = true } = await request.json();

    // Find the doctor
    const doctor = await prisma.user.findUnique({
      where: { clerkUserId: userId, role: 'DOCTOR' },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Validate slots
    if (!Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: 'Invalid slots data' }, { status: 400 });
    }

    // Process in transaction
    const result = await prisma.$transaction(async (tx) => {
      // If replaceAll is true, delete existing available slots
      if (replaceAll) {
        await tx.availability.deleteMany({
          where: {
            doctorId: doctor.id,
            status: 'AVAILABLE', // Only delete available slots, not booked ones
            startTime: {
              gte: new Date(), // Only delete future slots
            }
          }
        });
      }

      // Create new slots
      const createdSlots = await tx.availability.createMany({
        data: slots.map(slot => ({
          doctorId: doctor.id,
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
          status: slot.status || 'AVAILABLE',
        }))
      });

      return createdSlots;
    });

    return NextResponse.json({
      success: true,
      message: `Created ${result.count} availability slots`,
      slotsCreated: result.count
    });

  } catch (error) {
    console.error('Error creating availability:', error);
    return NextResponse.json(
      { error: 'Failed to create availability slots' },
      { status: 500 }
    );
  }
}

// Update specific availability slot
export async function PATCH(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slotId, startTime, endTime, status } = await request.json();

    // Find the doctor
    const doctor = await prisma.user.findUnique({
      where: { clerkUserId: userId, role: 'DOCTOR' },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Update the slot
    const updatedSlot = await prisma.availability.update({
      where: {
        id: slotId,
        doctorId: doctor.id, // Ensure doctor owns the slot
      },
      data: {
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(status && { status }),
      }
    });

    return NextResponse.json({
      success: true,
      slot: updatedSlot
    });

  } catch (error) {
    console.error('Error updating availability slot:', error);
    return NextResponse.json(
      { error: 'Failed to update availability slot' },
      { status: 500 }
    );
  }
}

// Delete availability slot
export async function DELETE(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get('slotId');

    if (!slotId) {
      return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 });
    }

    // Find the doctor
    const doctor = await prisma.user.findUnique({
      where: { clerkUserId: userId, role: 'DOCTOR' },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Check if slot has appointment
    const slot = await prisma.availability.findUnique({
      where: { id: slotId },
      include: { appointment: true }
    });

    if (slot?.appointment) {
      return NextResponse.json(
        { error: 'Cannot delete slot with existing appointment' },
        { status: 400 }
      );
    }

    // Delete the slot
    await prisma.availability.delete({
      where: {
        id: slotId,
        doctorId: doctor.id, // Ensure doctor owns the slot
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Availability slot deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting availability slot:', error);
    return NextResponse.json(
      { error: 'Failed to delete availability slot' },
      { status: 500 }
    );
  }
}