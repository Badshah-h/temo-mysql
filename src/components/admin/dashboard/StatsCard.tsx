import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: string | number;
  loading?: boolean;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  loading = false,
  icon,
  trend,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <h3 className="text-2xl font-bold mt-1">{value}</h3>
            )}

            {trend && (
              <div className="flex items-center mt-2">
                <span
                  className={`text-xs font-medium ${trend.positive ? "text-green-600" : "text-red-600"}`}
                >
                  {trend.positive ? "+" : "-"}
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  vs last week
                </span>
              </div>
            )}
          </div>

          {icon && (
            <div className="p-2 bg-primary/10 rounded-md text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
