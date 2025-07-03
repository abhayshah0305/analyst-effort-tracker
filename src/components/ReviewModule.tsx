
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileCheck, Clock, Calendar } from "lucide-react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { FormData } from "../pages/Index";

interface ReviewModuleProps {
  data: FormData[];
  onFinalSubmit: () => void;
  onBack: () => void;
}

const ReviewModule = ({ data, onFinalSubmit, onBack }: ReviewModuleProps) => {
  const totalHours = data.reduce((sum, item) => sum + item.hoursWorked, 0);

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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800">
                  Review Entries
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-slate-600">
                  Review your entries before submitting
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              className="border-slate-300 hover:bg-slate-50 w-full sm:w-auto"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Form
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-blue-800">Total Entries</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-900">{data.length}</p>
            </div>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="text-xs sm:text-sm font-medium text-green-800">Total Hours</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-900">{totalHours.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {data.length > 0 ? (
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm min-w-[120px]">Deal/Project</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm min-w-[100px]">Department</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm min-w-[80px]">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm min-w-[90px]">Task Date</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm min-w-[70px]">Hours</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm min-w-[150px] hidden sm:table-cell">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900 text-xs sm:text-sm">
                        <div className="max-w-[120px] truncate" title={item.dealName}>
                          {item.dealName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getDepartmentColor(item.department)} text-xs`}>
                          <span className="hidden sm:inline">{item.department}</span>
                          <span className="sm:hidden">{item.department.substring(0, 3)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getTypeColor(item.type)} text-xs`}>
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-slate-700">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {new Date(item.taskDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700 text-xs sm:text-sm">
                        {item.hoursWorked}h
                      </TableCell>
                      <TableCell className="max-w-xs hidden sm:table-cell">
                        <div className="truncate text-slate-600 text-xs sm:text-sm" title={item.description}>
                          {item.description}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Submit Button with Confirmation Dialog */}
            <div className="p-4 sm:p-6 border-t border-slate-200">
              <div className="flex justify-center">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 sm:px-8 w-full sm:w-auto"
                    >
                      Submit
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to submit {data.length} entries? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onFinalSubmit}>
                        Yes, Submit
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="text-center py-8 sm:py-12 px-4">
            <FileCheck className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">No entries yet</h3>
            <p className="text-sm sm:text-base text-slate-600 mb-4">Start by adding your first entry using the form.</p>
            <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Add First Entry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewModule;
