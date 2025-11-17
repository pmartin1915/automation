import { mockActivities } from '@/data/mockData';
import { CheckCircle, FileText, GitBranch, TestTube } from 'lucide-react';

export default function ActivityFeed() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'test':
        return <TestTube className="w-4 h-4 text-green-600" />;
      case 'commit':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'push':
        return <GitBranch className="w-4 h-4 text-purple-600" />;
      case 'session':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-3">
      {mockActivities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
          <div className="mt-0.5">{getIcon(activity.type)}</div>
          <div className="flex-1">
            <p className="text-sm text-gray-900">{activity.message}</p>
            <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
