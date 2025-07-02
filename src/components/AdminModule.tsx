
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Database, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Submission {
  id: string;
  analyst_email: string;
  deal_name: string;
  department: string;
  type: string;
  hours_worked: number;
  description: string;
  submitted_at: string;
  rating?: number;
}

interface AdminModuleProps {
  ratedBy: string;
}

const AdminModule = ({ ratedBy }: AdminModuleProps) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  const departments = ["Technology", "AMP", "Sales/Fundraise", "Debrief", "Coverage", "Asset Monitoring"];

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // Fetch all submissions - for admin users, the RLS policy should allow this
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('analyst_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        toast.error("Failed to fetch submissions: " + submissionsError.message);
        return;
      }

      // Fetch existing ratings for this rater
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('leadership_ratings')
        .select('submission_id, rating')
        .eq('rated_by', ratedBy);

      if (ratingsError) {
        console.error('Error fetching ratings:', ratingsError);
        toast.error("Failed to fetch existing ratings: " + ratingsError.message);
        return;
      }

      // Create ratings map
      const ratingsMap = ratingsData?.reduce((acc, rating) => {
        acc[rating.submission_id] = rating.rating;
        return acc;
      }, {} as { [key: string]: number }) || {};

      // Filter out submissions that already have ratings (pending submissions only)
      const pendingSubmissions = submissionsData?.filter(submission => 
        !ratingsMap[submission.id]
      ) || [];

      setSubmissions(pendingSubmissions);
      setRatings({});
    } catch (error) {
      console.error('Error in fetchSubmissions:', error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (submissionId: string, rating: number) => {
    if (rating >= 1 && rating <= 10) {
      setRatings(prev => ({ ...prev, [submissionId]: rating }));
    }
  };

  const submitRating = async (submissionId: string) => {
    const rating = ratings[submissionId];
    if (!rating || rating < 1 || rating > 10) {
      return;
    }

    try {
      // Find the submission to get analyst and deal info
      const submission = submissions.find(sub => sub.id === submissionId);
      if (!submission) {
        toast.error("Submission not found");
        return;
      }

      // Insert new rating into leadership_ratings table with department and type
      const { error: ratingsError } = await supabase
        .from('leadership_ratings')
        .insert({
          submission_id: submissionId,
          rated_by: ratedBy,
          rating,
          analyst_name: submission.analyst_email,
          deal_name: submission.deal_name,
          department: submission.department,
          type: submission.type
        });

      if (ratingsError) {
        console.error('Error submitting rating:', ratingsError);
        toast.error("Failed to submit rating");
        return;
      }

      // Update the analyst_submissions table with the rating
      const { error: updateError } = await supabase
        .from('analyst_submissions')
        .update({ rating })
        .eq('id', submissionId);

      if (updateError) {
        console.error('Error updating submission with rating:', updateError);
        toast.error("Failed to update submission with rating");
        return;
      }

      // Remove the rated submission from the local state
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
      setRatings(prev => {
        const newRatings = { ...prev };
        delete newRatings[submissionId];
        return newRatings;
      });

      toast.success("Rating submitted successfully!");
    } catch (error) {
      console.error('Error in submitRating:', error);
      toast.error("Failed to submit rating");
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      "Technology": "bg-blue-100 text-blue-800",
      "AMP": "bg-green-100 text-green-800",
      "Sales/Fundraise": "bg-purple-100 text-purple-800",
      "Debrief": "bg-orange-100 text-orange-800",
      "Coverage": "bg-indigo-100 text-indigo-800",
      "Asset Monitoring": "bg-red-100 text-red-800"
    };
    return colors[department] || "bg-gray-100 text-gray-800";
  };

  const getTypeColor = (type: string) => {
    return type === "Core" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
  };

  const totalSubmissions = submissions.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-slate-600">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">
                Admin Dashboard - Pending Ratings
              </CardTitle>
              <CardDescription className="text-slate-600">
                Review and rate pending analyst submissions (1-10 scale)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Pending Submissions</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{totalSubmissions}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Awaiting Review</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{totalSubmissions}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      {submissions.length > 0 ? (
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">Analyst</TableHead>
                    <TableHead className="font-semibold text-slate-700">Deal/Project</TableHead>
                    <TableHead className="font-semibold text-slate-700">Department</TableHead>
                    <TableHead className="font-semibold text-slate-700">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700">Hours</TableHead>
                    <TableHead className="font-semibold text-slate-700">Description</TableHead>
                    <TableHead className="font-semibold text-slate-700">Rating (1-10)</TableHead>
                    <TableHead className="font-semibold text-slate-700">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">
                        {submission.analyst_email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {submission.deal_name}
                      </TableCell>
                      <TableCell>
                        <Badge className={getDepartmentColor(submission.department)}>
                          {submission.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(submission.type)}>
                          {submission.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {submission.hours_worked}h
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-slate-600" title={submission.description}>
                          {submission.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={ratings[submission.id] || ''}
                          onChange={(e) => handleRatingChange(submission.id, parseInt(e.target.value))}
                          className="w-16 h-8"
                          placeholder="1-10"
                        />
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={!ratings[submission.id] || ratings[submission.id] < 1 || ratings[submission.id] > 10}
                            >
                              Submit
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Rating Submission</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to submit a rating of <strong>{ratings[submission.id]}</strong> for <strong>{submission.analyst_email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>'s work on <strong>{submission.deal_name}</strong>?
                                <br /><br />
                                This action will remove the submission from your pending list.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => submitRating(submission.id)}>
                                Yes, Submit Rating
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
          <CardContent className="text-center py-12">
            <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No pending submissions</h3>
            <p className="text-slate-600">
              All submissions have been rated or there are no submissions to review.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminModule;
