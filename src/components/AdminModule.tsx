
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Star, Database, Users } from "lucide-react";
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
      // Fetch all submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('analyst_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        toast.error("Failed to fetch submissions");
        return;
      }

      // Fetch existing ratings for this rater
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('leadership_ratings')
        .select('submission_id, rating')
        .eq('rated_by', ratedBy);

      if (ratingsError) {
        console.error('Error fetching ratings:', ratingsError);
        toast.error("Failed to fetch existing ratings");
        return;
      }

      // Create ratings map
      const ratingsMap = ratingsData?.reduce((acc, rating) => {
        acc[rating.submission_id] = rating.rating;
        return acc;
      }, {} as { [key: string]: number }) || {};

      // Combine submissions with ratings
      const submissionsWithRatings = submissionsData?.map(submission => ({
        ...submission,
        rating: ratingsMap[submission.id]
      })) || [];

      setSubmissions(submissionsWithRatings);
      setRatings(ratingsMap);
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
      toast.error("Please enter a rating between 1 and 10");
      return;
    }

    try {
      // Check if rating exists, if so update, otherwise insert
      const { data: existingRating } = await supabase
        .from('leadership_ratings')
        .select('id')
        .eq('submission_id', submissionId)
        .eq('rated_by', ratedBy)
        .single();

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from('leadership_ratings')
          .update({ rating, rated_at: new Date().toISOString() })
          .eq('submission_id', submissionId)
          .eq('rated_by', ratedBy);

        if (error) {
          console.error('Error updating rating:', error);
          toast.error("Failed to update rating");
          return;
        }
      } else {
        // Insert new rating
        const { error } = await supabase
          .from('leadership_ratings')
          .insert({
            submission_id: submissionId,
            rated_by: ratedBy,
            rating
          });

        if (error) {
          console.error('Error submitting rating:', error);
          toast.error("Failed to submit rating");
          return;
        }
      }

      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId ? { ...sub, rating } : sub
        )
      );

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
  const ratedSubmissions = submissions.filter(sub => sub.rating).length;
  const averageRating = submissions.filter(sub => sub.rating).reduce((sum, sub) => sum + (sub.rating || 0), 0) / (ratedSubmissions || 1);

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
                Admin Dashboard - Leadership Ratings
              </CardTitle>
              <CardDescription className="text-slate-600">
                Review and rate analyst submissions (1-10 scale)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Submissions</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{totalSubmissions}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Rated</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{ratedSubmissions}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Pending</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{totalSubmissions - ratedSubmissions}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Avg Rating</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {ratedSubmissions > 0 ? averageRating.toFixed(1) : 'N/A'}
              </p>
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
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={ratings[submission.id] || submission.rating || ''}
                            onChange={(e) => handleRatingChange(submission.id, parseInt(e.target.value))}
                            className="w-16 h-8"
                            placeholder="1-10"
                          />
                          {submission.rating && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => submitRating(submission.id)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={!ratings[submission.id] || ratings[submission.id] < 1 || ratings[submission.id] > 10}
                        >
                          {submission.rating ? 'Update' : 'Submit'}
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
          <CardContent className="text-center py-12">
            <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No submissions yet</h3>
            <p className="text-slate-600">Analyst submissions will appear here for rating.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminModule;
