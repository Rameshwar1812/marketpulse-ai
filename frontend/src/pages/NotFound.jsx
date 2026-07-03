import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export const NotFound = () => {
  return (
    <div className="flex h-[calc(100vh-120px)] w-full flex-col items-center justify-center text-center space-y-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <AlertCircle className="h-8 w-8 stroke-1" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-800">404 - Page Not Found</h2>
        <p className="text-xs text-slate-500 font-semibold max-w-xs">
          The requested intelligence panel or compliance queue route does not exist.
        </p>
      </div>
      <Link 
        to="/dashboard" 
        className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer shadow-md shadow-indigo-100"
      >
        Return to Overview Dashboard
      </Link>
    </div>
  );
};
export default NotFound;
