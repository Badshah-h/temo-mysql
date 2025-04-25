import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  title,
  description,
  to,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="p-3 bg-primary/10 rounded-full text-primary mb-4">
          {icon}
        </div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-4">{description}</p>
        <Button asChild variant="outline" size="sm" className="mt-auto">
          <Link to={to}>{title}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActionCard;
