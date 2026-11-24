import React from 'react';
import { Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export interface SupervisorMetricsData {
  totalStudents: number;
  hoursVerified: number;
  pendingReviews: number;
  atRiskStudents: number;
}

export default function DashboardMetrics({
  data,
}: {
  data?: SupervisorMetricsData | null;
}) {
  const totalStudents = data?.totalStudents ?? 0;
  const pendingReviews = data?.pendingReviews ?? 0;
  const hoursVerified = data?.hoursVerified ?? 0;
  const atRiskStudents = data?.atRiskStudents ?? 0;

  const metrics = [
    {
      title: "Assigned Students",
      value: String(totalStudents),
      description: "Assigned to your supervision",
      icon: <Users size={20} />,
      colorTheme: "text-blue-600",
      bgTheme: "bg-blue-50",
    },
    {
      title: "Pending Reviews",
      value: String(pendingReviews),
      description: "Awaiting your approval",
      icon: <Clock size={20} />,
      colorTheme: "text-amber-600",
      bgTheme: "bg-amber-50",
    },
    {
      title: "Hours Verified",
      value: String(hoursVerified),
      description: "Approved activity hours",
      icon: <CheckCircle size={20} />,
      colorTheme: "text-teal-600",
      bgTheme: "bg-teal-50",
    },
    {
      title: "At-Risk Students",
      value: String(atRiskStudents),
      description: "Low recent engagement",
      icon: <AlertTriangle size={20} />,
      colorTheme: "text-rose-600",
      bgTheme: "bg-rose-50",
      alert: atRiskStudents > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`relative overflow-hidden bg-white border rounded-xl p-6 shadow-sm transition-all hover:shadow-md ${
            metric.alert ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-200'
          }`}
        >
          {metric.alert && (
            <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${metric.bgTheme} ${metric.colorTheme}`}>
              {metric.icon}
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{metric.value}</h3>
            <p className="text-sm font-semibold text-slate-700">{metric.title}</p>
            <p className="text-xs text-slate-500 mt-1">{metric.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
