import { useState, useEffect } from "react";
import AuthModule from "../components/AuthModule";
import FormModule from "../components/FormModule";
import ReviewModule from "../components/ReviewModule";
import AdminModule from "../components/AdminModule";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface FormData {
  id: string;
  dealName: string;
  department: string;
  type: string;
  hoursWorked: number;
  description: string;
  taskDate: string;
  submittedAt: string;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentModule, setCurrentModule] = useState<'form' | 'review' | 'admin'>('form');
  const [submittedData, setSubmittedData] = useState<FormData[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<string>("");

  // Define admin emails
  const ADMIN_EMAILS = ["abhay.shah@integrowamc.com"
  // Add other admin emails here if needed
  ];
  const isAdmin = ADMIN_EMAILS.includes(loggedInUser);

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setIsAuthenticated(true);
        setLoggedInUser(session.user.email);
        console.log('Session found:', session.user.email);
      }
    };
    checkSession();

    // Listen for auth state changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      if (session?.user?.email) {
        setIsAuthenticated(true);
        setLoggedInUser(session.user.email);
      } else {
        setIsAuthenticated(false);
        setLoggedInUser("");
        setCurrentModule('form');
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const handleLogin = (success: boolean, email?: string) => {
    if (success && email) {
      setIsAuthenticated(true);
      setLoggedInUser(email);
      toast.success("Successfully logged in!");
    } else {
      toast.error("Invalid credentials. Please try again.");
    }
  };
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setCurrentModule('form');
      setLoggedInUser("");
      setSubmittedData([]);
      toast.success("Successfully logged out!");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Logout failed");
    }
  };
  const getFirstName = (email: string) => {
    const namePart = email.split('@')[0];
    const firstName = namePart.split('.')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };
  const handleFormSubmit = (data: Omit<FormData, 'id' | 'submittedAt'>) => {
    // Only store locally, don't save to database yet
    const newEntry: FormData = {
      ...data,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString()
    };
    setSubmittedData(prev => [...prev, newEntry]);
    toast.success("Entry added to review list!");
  };
  const handleFinalSubmit = async () => {
    if (submittedData.length === 0) {
      toast.error("No entries to submit!");
      return;
    }
    try {
      // Prepare data for database insertion
      const dataToInsert = submittedData.map(entry => ({
        analyst_email: loggedInUser,
        deal_name: entry.dealName,
        department: entry.department,
        type: entry.type,
        hours_worked: entry.hoursWorked,
        description: entry.description,
        task_date: entry.taskDate
      }));

      // Insert all entries to database
      const {
        error
      } = await supabase.from('analyst_submissions').insert(dataToInsert);
      if (error) {
        console.error('Error saving to database:', error);
        toast.error("Failed to save to database. Please try again.");
        return;
      }

      // Clear local data after successful submission
      setSubmittedData([]);
      toast.success("Submitted Successfully");

      // Switch back to form view
      setCurrentModule('form');
    } catch (error) {
      console.error('Error submitting entries:', error);
      toast.error("Failed to submit entries. Please try again.");
    }
  };
  if (!isAuthenticated) {
    return <AuthModule onLogin={handleLogin} />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 pr-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center flex-shrink-0">
                <img src="/lovable-uploads/dd6990e4-a19f-465b-b933-fcde114afb5e.png" alt="Integrow Logo" className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-slate-800 leading-tight">
                  <span className="block sm:hidden">Integrow Asset Management</span>
                  <span className="hidden sm:block lg:hidden">Integrow Asset Management</span>
                  <span className="hidden lg:block">Integrow Asset Management</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block leading-tight">
                  <span className="block sm:hidden lg:block">Analyst Effort Tracking System</span>
                  <span className="hidden sm:block lg:hidden">Analyst Tracking</span>
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors flex-shrink-0">
                <span className="truncate max-w-16 sm:max-w-24 lg:max-w-none">Hi {getFirstName(loggedInUser)}!</span>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-4 lg:space-x-8 overflow-x-auto">
            <button onClick={() => setCurrentModule('form')} className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${currentModule === 'form' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              Data Entry
            </button>
            <button onClick={() => setCurrentModule('review')} className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${currentModule === 'review' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              <span className="hidden sm:inline">Review & Submit</span>
              <span className="sm:hidden">Review</span> ({submittedData.length})
            </button>
            {isAdmin && <button onClick={() => setCurrentModule('admin')} className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${currentModule === 'admin' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                <span className="hidden sm:inline">Admin Dashboard</span>
                <span className="sm:hidden">Admin</span>
              </button>}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {currentModule === 'form' ? <FormModule onSubmit={handleFormSubmit} /> : currentModule === 'review' ? <ReviewModule data={submittedData} onFinalSubmit={handleFinalSubmit} onBack={() => setCurrentModule('form')} /> : currentModule === 'admin' && isAdmin ? <AdminModule ratedBy={loggedInUser} /> : null}
      </main>
    </div>;
};
export default Index;
