import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Users, Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AdminModuleProps {
  ratedBy: string;
}

interface AnalystSubmission {
  id: string;
  analyst_email: string;
  deal_name: string;
  department: string;
  type: string;
  hours_worked: number;
  description: string;
  task_date: string;
  submitted_at: string;
  rating?: number;
}

interface LeadershipRating {
  id: string;
  submission_id: string;
  rating: number;
  analyst_name: string;
  deal_name: string;
  department: string;
  type: string;
  task_date: string;
  rated_at: string;
  rated_by: string;
}

const AdminModule = ({ ratedBy }: AdminModuleProps) => {
  const queryClient = useQueryClient();
  const [ratingInputs, setRatingInputs] = useState<{ [key: string]: string }>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    submissionId: string;
    rating: number;
  }>({
    open: false,
    submissionId: '',
    rating: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // Helper function to format analyst name from email
  const formatAnalystName = (email: string) => {
    const username = email.split('@')[0];
    return username.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
  };

  // Helper function to get department color
  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      'Technology': 'bg-blue-100 text-blue-800',
      'AMP': 'bg-green-100 text-green-800',
      'Sales/Fundraise': 'bg-purple-100 text-purple-800',
      'Debrief': 'bg-orange-100 text-orange-800',
      'Coverage': 'bg-indigo-100 text-indigo-800',
      'Asset Monitoring': 'bg-pink-100 text-pink-800',
      'CRE': 'bg-yellow-100 text-yellow-800',
      'Residental': 'bg-teal-100 text-teal-800',
      'Equity Enhancer Product': 'bg-red-100 text-red-800',
      'Co-Investments': 'bg-cyan-100 text-cyan-800'
    };
    return colors[department] || 'bg-gray-100 text-gray-800';
  };

  // Helper function to get type color
  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Administrative': 'bg-slate-100 text-slate-800',
      'Research': 'bg-blue-100 text-blue-800',
      'Analysis': 'bg-green-100 text-green-800',
      'Meetings': 'bg-orange-100 text-orange-800',
      'Documentation': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Check if current user is admin using hardcoded list as fallback
  const { data: userRole } = useQuery({
    queryKey: ['user-role', ratedBy],
    queryFn: async () => {
      console.log('Checking user role for:', ratedBy);
      
      // First check hardcoded admin list as fallback
      const ADMIN_EMAILS = [
        "abhay.shah@integrowamc.com",
        "sanchi.jain@integrowamc.com"
      ];
      
      if (ADMIN_EMAILS.includes(ratedBy)) {
        console.log('User is admin (hardcoded check):', true);
        return true;
      }
      
      // Try to query user_roles table, but don't fail if it has issues
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_email', ratedBy)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking admin status:', error);
          // Fall back to hardcoded check
          return ADMIN_EMAILS.includes(ratedBy);
        }
        
        const isAdminUser = data?.role === 'admin';
        console.log('User role data:', data);
        console.log('User is admin:', isAdminUser);
        return isAdminUser;
      } catch (error) {
        console.error('Failed to check user role:', error);
        // Fall back to hardcoded check
        return ADMIN_EMAILS.includes(ratedBy);
      }
    },
    enabled: !!ratedBy
  });

  useEffect(() => {
    if (userRole !== undefined) {
      setIsAdmin(userRole);
      console.log('User is admin:', userRole);
    }
  }, [userRole]);

  // Fetch all analyst submissions (only if admin)
  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ['analyst-submissions'],
    queryFn: async () => {
      console.log('Fetching analyst submissions...');
      const { data, error } = await supabase
        .from('analyst_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching submissions:', error);
        throw error;
      }
      
      console.log('Fetched submissions:', data);
      return data as AnalystSubmission[];
    },
    enabled: isAdmin
  });

  // Fetch leadership ratings (only if admin)
  const { data: ratings = [], isLoading: ratingsLoading } = useQuery({
    queryKey: ['leadership-ratings'],
    queryFn: async () => {
      console.log('Fetching leadership ratings...');
      const { data, error } = await supabase
        .from('leadership_ratings')
        .select('*')
        .order('rated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching ratings:', error);
        throw error;
      }
      
      console.log('Fetched ratings:', data);
      return data as LeadershipRating[];
    },
    enabled: isAdmin
  });

  // Get submissions that haven't been rated yet
  const unratedSubmissions = submissions.filter(submission => 
    !ratings.some(rating => rating.submission_id === submission.id)
  );

  console.log('Total submissions:', submissions.length);
  console.log('Total ratings:', ratings.length);
  console.log('Unrated submissions:', unratedSubmissions.length);

  // Rate submission mutation
  const rateMutation = useMutation({
    mutationFn: async ({ submissionId, rating, submission }: {
      submissionId: string;
      rating: number;
      submission: AnalystSubmission;
    }) => {
      const { error } = await supabase
        .from('leadership_ratings')
        .insert([{
          submission_id: submissionId,
          rating: rating,
          analyst_name: formatAnalystName(submission.analyst_email),
          deal_name: submission.deal_name,
          department: submission.department,
          type: submission.type,
          task_date: submission.task_date,
          rated_by: ratedBy
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadership-ratings'] });
      toast.success("Rating submitted successfully!");
      setConfirmDialog({ open: false, submissionId: '', rating: 0 });
      setRatingInputs({});
    },
    onError: (error) => {
      console.error('Error submitting rating:', error);
      toast.error("Failed to submit rating");
    }
  });

  const handleRatingInputChange = (submissionId: string, value: string) => {
    setRatingInputs(prev => ({ ...prev, [submissionId]: value }));
  };

  const handleSubmitRating = (submission: AnalystSubmission) => {
    const ratingValue = parseInt(ratingInputs[submission.id] || '0');
    if (ratingValue < 1 || ratingValue > 10) {
      toast.error("Rating must be between 1 and 10");
      return;
    }
    setConfirmDialog({
      open: true,
      submissionId: submission.id,
      rating: ratingValue
    });
  };

  const confirmSubmitRating = () => {
    const submission = unratedSubmissions.find(s => s.id === confirmDialog.submissionId);
    if (submission) {
      rateMutation.mutate({
        submissionId: confirmDialog.submissionId,
        rating: confirmDialog.rating,
        submission
      });
    }
  };

  // Show loading state while checking user role
  if (userRole === undefined && ratedBy) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Access Denied
            </h3>
            <p className="text-slate-600">You don't have permission to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submissionsLoading || ratingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800">
                  Admin Dashboard
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-slate-600">
                  Rate analyst submissions and view performance metrics
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Pending Ratings or No Pending Message */}
        {unratedSubmissions.length > 0 ? (
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                Pending Ratings ({unratedSubmissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Analyst</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Deal/Project</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Department</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Type</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Task Date</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Hours</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm hidden md:table-cell">Description</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Rating (1-10)</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unratedSubmissions.map(submission => (
                      <TableRow key={submission.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-900 text-xs sm:text-sm">
                          {formatAnalystName(submission.analyst_email)}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 text-xs sm:text-sm">
                          {submission.deal_name}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getDepartmentColor(submission.department)} text-xs`}>
                            {submission.department}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getTypeColor(submission.type)} text-xs`}>
                            {submission.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-slate-700">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3 text-slate-500" />
                            {new Date(submission.task_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-700 text-xs sm:text-sm">
                          {submission.hours_worked}h
                        </TableCell>
                        <TableCell className="max-w-xs hidden md:table-cell">
                          <div className="truncate text-slate-600 text-xs sm:text-sm" title={submission.description}>
                            {submission.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            className="w-20"
                            placeholder="1-10"
                            value={ratingInputs[submission.id] || ''}
                            onChange={e => handleRatingInputChange(submission.id, e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleSubmitRating(submission)}
                            disabled={!ratingInputs[submission.id] || rateMutation.isPending}
                            size="sm"
                          >
                            Submit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Pending Ratings
                </h3>
                <p className="text-slate-600">All analyst submissions have been rated.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Rating Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit a rating of {confirmDialog.rating} for this submission?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ open: false, submissionId: '', rating: 0 })}
            >
              Cancel
            </Button>
            <Button onClick={confirmSubmitRating} disabled={rateMutation.isPending}>
              {rateMutation.isPending ? 'Submitting...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminModule;
