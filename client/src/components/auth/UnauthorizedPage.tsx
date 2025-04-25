import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 rounded-full">
            <ShieldAlert className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Access Denied
        </h1>

        <p className="text-slate-600 mb-6">
          You don't have permission to access this page. Please contact an
          administrator if you believe this is an error.
        </p>

        <div className="flex flex-col space-y-2">
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link to="/login">Login with Different Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
