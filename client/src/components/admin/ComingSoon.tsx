import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle } from "lucide-react";
import AdminLayout from "./AdminLayout";

interface ComingSoonProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title = "Coming Soon",
  description = "This feature is currently under development and will be available soon.",
  showBackButton = true,
}) => {
  return (
    <AdminLayout>
      <div className="flex items-center justify-center h-full py-12">
        <Card className="w-full max-w-md mx-auto text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">{description}</p>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  We're working hard to bring you this feature. Check back soon
                  for updates!
                </p>
              </div>
              {showBackButton && (
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                  >
                    Go Back
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ComingSoon;
