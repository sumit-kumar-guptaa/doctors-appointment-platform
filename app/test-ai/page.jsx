/**
 * Medical AI Test Page
 * Page to test all AI systems
 */

import MedicalAITestDashboard from '@/components/medical-ai-test-dashboard';

export default function TestAIPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MedicalAITestDashboard />
    </div>
  );
}

export const metadata = {
  title: 'Medical AI Test Dashboard',
  description: 'Test all production medical AI systems',
};