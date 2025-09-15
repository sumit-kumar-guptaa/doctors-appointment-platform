import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Vonage } from '@vonage/server-sdk';
import { Auth } from '@vonage/auth';
import { db as prisma } from '@/lib/prisma';

// Initialize Vonage Video API client
const credentials = new Auth({
  applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY,
});

const options = {
  restHost: 'https://video.vonage.com',
};

const vonage = new Vonage(credentials, options);

// Create a new video session
export async function POST(request) {
  try {
    const { userId } = auth();
    const body = await request.json();
    const { appointmentId, sessionType = 'consultation', mediaMode = 'routed' } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create a new Vonage Video session
    const session = await vonage.video.createSession({
      mediaMode: mediaMode, // 'routed' or 'relayed'
      archiveMode: 'manual', // 'always' or 'manual'
      location: undefined, // Optional: IP address for server location
    });

    const sessionId = session.sessionId;

    // Generate tokens for both participant types
    const doctorToken = vonage.video.generateClientToken(sessionId, {
      role: 'publisher',
      data: JSON.stringify({ 
        userType: 'doctor',
        userId: userId,
        appointmentId: appointmentId 
      }),
      expireTime: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    });

    const patientToken = vonage.video.generateClientToken(sessionId, {
      role: 'publisher',
      data: JSON.stringify({ 
        userType: 'patient',
        userId: userId,
        appointmentId: appointmentId 
      }),
      expireTime: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    });

    // Store session info in database if appointment exists
    if (appointmentId) {
      await prisma.appointment.update({
        where: { 
          id: appointmentId,
          OR: [
            { userId: userId },
            { doctorId: userId }
          ]
        },
        data: {
          videoSessionId: sessionId,
          videoTokens: JSON.stringify({
            doctorToken: doctorToken,
            patientToken: patientToken,
            createdAt: new Date().toISOString()
          })
        }
      });
    }

    return NextResponse.json({
      success: true,
      session: {
        sessionId: sessionId,
        applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID,
        tokens: {
          doctor: doctorToken,
          patient: patientToken
        },
        config: {
          mediaMode: mediaMode,
          archiveMode: 'manual',
          sessionType: sessionType
        }
      },
      appointmentId: appointmentId
    });

  } catch (error) {
    console.error('Vonage video session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create video session' },
      { status: 500 }
    );
  }
}

// Get existing session info
export async function GET(request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');
    const sessionId = searchParams.get('sessionId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (appointmentId) {
      // Get session info from appointment
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          OR: [
            { userId: userId },
            { doctorId: userId }
          ]
        },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
              image: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!appointment) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        );
      }

      if (!appointment.videoSessionId) {
        return NextResponse.json(
          { error: 'Video session not initialized for this appointment' },
          { status: 404 }
        );
      }

      // Parse stored tokens
      let tokens = null;
      if (appointment.videoTokens) {
        try {
          tokens = JSON.parse(appointment.videoTokens);
        } catch (e) {
          console.error('Error parsing video tokens:', e);
        }
      }

      // Generate new tokens if needed or expired
      if (!tokens || isTokenExpired(tokens)) {
        const doctorToken = vonage.video.generateClientToken(appointment.videoSessionId, {
          role: 'publisher',
          data: JSON.stringify({ 
            userType: 'doctor',
            userId: appointment.doctorId,
            appointmentId: appointmentId 
          }),
          expireTime: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
        });

        const patientToken = vonage.video.generateClientToken(appointment.videoSessionId, {
          role: 'publisher',
          data: JSON.stringify({ 
            userType: 'patient',
            userId: appointment.userId,
            appointmentId: appointmentId 
          }),
          expireTime: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
        });

        tokens = {
          doctorToken: doctorToken,
          patientToken: patientToken,
          createdAt: new Date().toISOString()
        };

        // Update tokens in database
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            videoTokens: JSON.stringify(tokens)
          }
        });
      }

      // Determine user role and return appropriate token
      const isDoctor = userId === appointment.doctorId;
      const userToken = isDoctor ? tokens.doctorToken : tokens.patientToken;

      return NextResponse.json({
        success: true,
        session: {
          sessionId: appointment.videoSessionId,
          applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID,
          token: userToken,
          userRole: isDoctor ? 'doctor' : 'patient'
        },
        appointment: {
          id: appointment.id,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status,
          doctor: appointment.doctor,
          patient: appointment.user
        }
      });

    } else if (sessionId) {
      // Direct session access - generate new token
      const token = vonage.video.generateClientToken(sessionId, {
        role: 'publisher',
        data: JSON.stringify({ 
          userType: 'user',
          userId: userId 
        }),
        expireTime: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 hours
      });

      return NextResponse.json({
        success: true,
        session: {
          sessionId: sessionId,
          applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID,
          token: token,
          userRole: 'participant'
        }
      });

    } else {
      return NextResponse.json(
        { error: 'appointmentId or sessionId required' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Get video session error:', error);
    return NextResponse.json(
      { error: 'Failed to get video session info' },
      { status: 500 }
    );
  }
}

// Start/Stop recording
export async function PATCH(request) {
  try {
    const { userId } = auth();
    const body = await request.json();
    const { sessionId, action, appointmentId } = body; // action: 'start' or 'stop'

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (action === 'start') {
      // Start recording
      const archive = await vonage.video.startArchive(sessionId, {
        name: `Medical Consultation - ${appointmentId}`,
        outputMode: 'composed',
        layout: {
          type: 'bestFit'
        },
        hasAudio: true,
        hasVideo: true
      });

      // Store archive ID in appointment
      if (appointmentId) {
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            recordingId: archive.id,
            recordingStatus: 'started'
          }
        });
      }

      return NextResponse.json({
        success: true,
        archive: {
          id: archive.id,
          status: archive.status,
          name: archive.name,
          createdAt: archive.createdAt
        }
      });

    } else if (action === 'stop') {
      // Get recording ID from appointment
      let archiveId = body.archiveId;
      
      if (!archiveId && appointmentId) {
        const appointment = await prisma.appointment.findUnique({
          where: { id: appointmentId }
        });
        archiveId = appointment?.recordingId;
      }

      if (!archiveId) {
        return NextResponse.json(
          { error: 'Archive ID not found' },
          { status: 404 }
        );
      }

      // Stop recording
      const archive = await vonage.video.stopArchive(archiveId);

      // Update appointment status
      if (appointmentId) {
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            recordingStatus: 'stopped',
            recordingUrl: archive.url || null
          }
        });
      }

      return NextResponse.json({
        success: true,
        archive: {
          id: archive.id,
          status: archive.status,
          url: archive.url,
          duration: archive.duration
        }
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Recording control error:', error);
    return NextResponse.json(
      { error: 'Failed to control recording' },
      { status: 500 }
    );
  }
}

// Delete/cleanup session
export async function DELETE(request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (appointmentId) {
      // Clean up appointment video data
      await prisma.appointment.update({
        where: { 
          id: appointmentId,
          OR: [
            { userId: userId },
            { doctorId: userId }
          ]
        },
        data: {
          videoSessionId: null,
          videoTokens: null,
          recordingId: null,
          recordingStatus: null
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Video session cleaned up successfully'
      });
    }

    return NextResponse.json(
      { error: 'appointmentId required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup session' },
      { status: 500 }
    );
  }
}

// Helper function to check if token is expired
function isTokenExpired(tokens) {
  if (!tokens.createdAt) return true;
  
  const createdTime = new Date(tokens.createdAt).getTime();
  const currentTime = Date.now();
  const hoursDifference = (currentTime - createdTime) / (1000 * 60 * 60);
  
  // Tokens expire after 23 hours (refresh before 24h limit)
  return hoursDifference > 23;
}