import React from "react";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

type StatusType = "online" | "offline" | "checking";

interface StatusItemProps {
  label: string;
  status: StatusType;
}

const StatusItem: React.FC<StatusItemProps> = ({ label, status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "offline":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "checking":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "online":
        return "Online";
      case "offline":
        return "Offline";
      case "checking":
        return "Checking...";
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "online":
        return "text-green-500";
      case "offline":
        return "text-red-500";
      case "checking":
        return "text-amber-500";
      default:
        return "";
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-1.5">
        {getStatusIcon()}
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    </div>
  );
};

export default StatusItem;
