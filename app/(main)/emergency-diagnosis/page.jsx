import EmergencyDiagnosisPage from '@/components/emergency-diagnosis-page';
import { checkUser } from '@/lib/checkUser';

export default async function EmergencyDiagnosisPageRoute() {
  const user = await checkUser();

  return <EmergencyDiagnosisPage user={user} />;
}