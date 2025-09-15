import EmergencyVideoCall from "./video-call-ui";

export default async function VideoCallPage({ searchParams }) {
  const { sessionId, token, appointmentId } = await searchParams;

  return (
    <EmergencyVideoCall 
      sessionId={sessionId} 
      token={token} 
      appointmentId={appointmentId}
    />
  );
}
