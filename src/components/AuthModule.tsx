
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail } from "lucide-react";

interface AuthModuleProps {
  onLogin: (success: boolean, email?: string) => void;
}

const AuthModule = ({ onLogin }: AuthModuleProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Hardcoded credentials
  const VALID_CREDENTIALS = [
    { email: "harshal.mali@integrowamc.com", password: "Harshal123!#" },
    { email: "vikash.gupta@integrowamc.com", password: "Vikash123!#" },
    { email: "chinmay.panvelkar@integrowamc.com", password: "Chinmay123!#" },
    { email: "nikunj.miyani@integrowamc.com", password: "Nikunj123!#" },
    { email: "pratyush.gadodia@integrowamc.com", password: "Pratyush123!#" },
    { email: "siddhanth.bakliwal@integrowamc.com", password: "Siddhanth123!#" },
    { email: "abhay.shah@integrowamc.com", password: "Abhay123!#" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const isValid = VALID_CREDENTIALS.some(cred => 
      cred.email === email && cred.password === password
    );
    
    onLogin(isValid, isValid ? email : undefined);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <img 
              src="/lovable-uploads/dd6990e4-a19f-465b-b933-fcde114afb5e.png" 
              alt="Integrow Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Welcome Back</CardTitle>
          <CardDescription className="text-slate-600">
            Integrow Asset Management<br />
            Analyst Effort Tracking System
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 text-center">
              <strong>Demo Credentials:</strong><br />
              Use any of the provided email addresses<br />
              with their corresponding passwords
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthModule;
