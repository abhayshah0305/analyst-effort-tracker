
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Star, TrendingUp, Users, Search, Filter, Calendar as CalendarIcon } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  // Fetch all analyst submissions
  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ['analyst-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyst_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching submissions:', error);
        throw error;
      }
      return data as AnalystSubmission[];
    }
  });

  // Fetch leadership ratings
  const { data: ratings = [], isLoading: ratingsLoading } = useQuery({
    queryKey: ['leadership-ratings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leadership_ratings')
        .select('*')
        .order('rated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching ratings:', error);
        throw error;
      }
      return data as LeadershipRating[];
    }
  });

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
          analyst_name: submission.analyst_email.split('@')[0],
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
    },
    onError: (error) => {
      console.error('Error submitting rating:', error);
      toast.error("Failed to submit rating");
    }
  });

  // Update rating mutation
  const updateRatingMutation = useMutation({
    mutationFn: async ({ ratingId, newRating }: { ratingId: string; newRating: number }) => {
      const { error } = await supabase
        .from('leadership_ratings')
        .update({ rating: newRating })
        .eq('id', ratingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadership-ratings'] });
      toast.success("Rating updated successfully!");
    },
    onError: (error) => {
      console.error('Error updating rating:', error);
      toast.error("Failed to update rating");
    }
  });

  const handleRateSubmission = (submission: AnalystSubmission, rating: number) => {
    rateMutation.mutate({ submissionId: submission.id, rating, submission });
  };

  const handleUpdateRating = (ratingId: string, newRating: number) => {
    updateRatingMutation.mutate({ ratingId, newRating });
  };

  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      "Technology": "bg-blue-100 text-blue-800",
      "AMP": "bg-green-100 text-green-800",
      "Sales/Fundraise": "bg-purple-100 text-purple-800",
      "Debrief": "bg-orange-100 text-orange-800",
      "Coverage": "bg-indigo-100 text-indigo-800",
      "Asset Monitoring": "bg-red-100 text-red-800",
      "CRE": "bg-yellow-100 text-yellow-800"
    };
    return colors[department] || "bg-gray-100 text-gray-800";
  };

  const getTypeColor = (type: string) => {
    return type === "Core" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  // Get submissions that haven't been rated yet
  const unratedSubmissions = submissions.filter(submission => 
    !ratings.some(rating => rating.submission_id === submission.id)
  );

  // Filter submissions and ratings
  const filteredUnratedSubmissions = unratedSubmissions.filter(submission => {
    const matchesSearch = submission.deal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.analyst_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || submission.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const filteredRatings = ratings.filter(rating => {
    const matchesSearch = rating.deal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rating.analyst_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || rating.department === departmentFilter;
    const matchesRating = ratingFilter === "all" || rating.rating.toString() === ratingFilter;
    
    return matchesSearch && matchesDepartment && matchesRating;
  });

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

      {/* Filters */}
      <Card className="shadow-lg border-0 bg-white">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by deal name, analyst, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="AMP">AMP</SelectItem>
                <SelectItem value="Sales/Fundraise">Sales/Fundraise</SelectItem>
                <SelectItem value="Debrief">Debrief</SelectItem>
                <SelectItem value="Coverage">Coverage</SelectItem>
                <SelectItem value="Asset Monitoring">Asset Monitoring</SelectItem>
                <SelectItem value="CRE">CRE</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <Star className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>  
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pending Ratings */}
      {filteredUnratedSubmissions.length > 0 && (
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-orange-600" />
              Pending Ratings ({filteredUnratedSubmissions.length})
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
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnratedSubmissions.map((submission) => (
                    <TableRow key={submission.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900 text-xs sm:text-sm">
                        {submission.analyst_email.split('@')[0]}
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
                        <Select onValueChange={(value) => handleRateSubmission(submission, parseInt(value))}>
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Rate" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 ⭐</SelectItem>
                            <SelectItem value="4">4 ⭐</SelectItem>
                            <SelectItem value="3">3 ⭐</SelectItem>
                            <SelectItem value="2">2 ⭐</SelectItem>
                            <SelectItem value="1">1 ⭐</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Ratings */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
            <Star className="w-5 h-5 mr-2 text-green-600" />
            Completed Ratings ({filteredRatings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRatings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Analyst</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Deal/Project</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Department</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Task Date</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Rating</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Rated On</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRatings.map((rating) => (
                    <TableRow key={rating.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900 text-xs sm:text-sm">
                        {rating.analyst_name}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 text-xs sm:text-sm">
                        {rating.deal_name}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getDepartmentColor(rating.department)} text-xs`}>
                          {rating.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getTypeColor(rating.type)} text-xs`}>
                          {rating.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-slate-700">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 text-slate-500" />
                          {new Date(rating.task_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-bold text-lg ${getRatingColor(rating.rating)}`}>
                          {rating.rating} ⭐
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-slate-600">
                        {new Date(rating.rated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select onValueChange={(value) => handleUpdateRating(rating.id, parseInt(value))}>
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Edit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 ⭐</SelectItem>
                            <SelectItem value="4">4 ⭐</SelectItem>
                            <SelectItem value="3">3 ⭐</SelectItem>
                            <SelectItem value="2">2 ⭐</SelectItem>
                            <SelectItem value="1">1 ⭐</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <Star className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">No ratings yet</h3>
              <p className="text-sm sm:text-base text-slate-600">Start rating analyst submissions to see them here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminModule;
