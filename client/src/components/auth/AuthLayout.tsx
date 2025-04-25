import React from "react";
import { MessageSquare, Check } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  features?: string[];
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  features = [
    "Customize your chat widget",
    "Create context-aware AI responses",
    "Embed on any website with ease",
  ],
}) => {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - dark with features */}
      <div className="hidden md:flex md:w-1/2 bg-[#111827] text-white flex-col justify-center items-center p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Join Us Today</h2>
          <p className="text-slate-300 mb-8">
            Create an account to access our chat widget platform and start
            building your own AI assistants.
          </p>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <div className="mr-3 flex-shrink-0">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - light with form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center md:hidden">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="text-slate-500 mt-2">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
