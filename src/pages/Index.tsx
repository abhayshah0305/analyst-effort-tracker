
import { useState, useEffect } from "react";
import AuthModule from "../components/AuthModule";
import FormModule from "../components/FormModule";
import ReviewModule from "../components/ReviewModule";
import AdminModule from "../components/AdminModule";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [currentModule, setCurrentModule] = useState<'form' | 'review' | 'admin'>('form');
  const [submittedData, setSubmittedData] = useState<FormData[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<string>("");

  // Define admin emails
  const ADMIN_EMAILS = [
    "abhay.shah@integrowamc.com",
    // Add other admin emails here if needed
  ];

  const isAdmin = ADMIN_EMAILS.includes(loggedInUser);

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setIsAuthenticated(true);
        setLoggedInUser(session.user.email);
        console.log('Session found:', session.user.email);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (session?.user?.email) {
          setIsAuthenticated(true);
          setLoggedInUser(session.user.email);
        } else {
          setIsAuthenticated(false);
          setLoggedInUser("");
          setCurrentModule('form');
        }
      }
    );

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
      submittedAt: new Date().toISOString(),
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
        description: entry.description
      }));

      // Insert all entries to database
      const { error } = await supabase
        .from('analyst_submissions')
        .insert(dataToInsert);

      if (error) {
        console.error('Error saving to database:', error);
        toast.error("Failed to save to database. Please try again.");
        return;
      }

      // Clear local data after successful submission
      setSubmittedData([]);
      toast.success(`Successfully submitted ${dataToInsert.length} entries to database!`);
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/dd6990e4-a19f-465b-b933-fcde114afb5e.png" 
                  alt="Integrow Logo" 
                  className="w-10 h-10 object-contain" 
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Integrow Asset Management</h1>
                <p className="text-sm text-slate-600">Analyst Effort Tracking System</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors">
                <span>Hi {getFirstName(loggedInUser)}!</span>
                <ChevronDown className="h-4 w-4" />
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
            {isAdmin && (
              <button
                onClick={() => setCurrentModule('admin')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentModule === 'admin'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Admin Dashboard
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentModule === 'form' ? (
          <FormModule onSubmit={handleFormSubmit} />
        ) : currentModule === 'review' ? (
          <ReviewModule 
            data={submittedData} 
            onFinalSubmit={handleFinalSubmit}
            onBack={() => setCurrentModule('form')}
          />
        ) : currentModule === 'admin' && isAdmin ? (
          <AdminModule ratedBy={loggedInUser} />
        ) : null}
      </main>
    </div>
  );
};

export default Index;
