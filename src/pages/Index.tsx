
import { useState } from "react";
import AuthModule from "../components/AuthModule";
import FormModule from "../components/FormModule";
import ReviewModule from "../components/ReviewModule";
import { toast } from "sonner";

export interface FormData {
  id: string;
  dealName: string;
  department: string;
  type: string;
  hoursWorked: number;
  description: string;
  submittedAt: string;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentModule, setCurrentModule] = useState<'form' | 'review'>('form');
  const [submittedData, setSubmittedData] = useState<FormData[]>([]);

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      toast.success("Successfully logged in!");
    } else {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentModule('form');
    toast.success("Successfully logged out!");
  };

  const handleFormSubmit = (data: Omit<FormData, 'id' | 'submittedAt'>) => {
    const newEntry: FormData = {
      ...data,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
    };
    setSubmittedData(prev => [...prev, newEntry]);
    toast.success("Form submitted successfully!");
  };

  const handleFinalSubmit = () => {
    // This will be connected to PostgreSQL later
    console.log("Final submission to database:", submittedData);
    toast.success("Data prepared for database submission!");
  };

  if (!isAuthenticated) {
    return <AuthModule onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Integrow Asset Management</h1>
                <p className="text-sm text-slate-600">Analyst Effort Tracking System</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentModule('form')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentModule === 'form'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Data Entry
            </button>
            <button
              onClick={() => setCurrentModule('review')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentModule === 'review'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Review & Submit ({submittedData.length})
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentModule === 'form' ? (
          <FormModule onSubmit={handleFormSubmit} />
        ) : (
          <ReviewModule 
            data={submittedData} 
            onFinalSubmit={handleFinalSubmit}
            onBack={() => setCurrentModule('form')}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
