
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Database, FileCheck, Clock } from "lucide-react";
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
      "Asset Monitoring": "bg-red-100 text-red-800"
    };
    return colors[department] || "bg-gray-100 text-gray-800";
  };

  const getTypeColor = (type: string) => {
    return type === "Core" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-slate-800">
                  Review Entries
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Review your entries before submitting to database
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              className="border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Form
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Entries</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{data.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Total Hours</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{totalHours.toFixed(1)}</p>
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
                    <TableHead className="font-semibold text-slate-700">Deal/Project</TableHead>
                    <TableHead className="font-semibold text-slate-700">Department</TableHead>
                    <TableHead className="font-semibold text-slate-700">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700">Hours</TableHead>
                    <TableHead className="font-semibold text-slate-700">Description</TableHead>
                    <TableHead className="font-semibold text-slate-700">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">
                        {item.dealName}
                      </TableCell>
                      <TableCell>
                        <Badge className={getDepartmentColor(item.department)}>
                          {item.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(item.type)}>
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {item.hoursWorked}h
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-slate-600" title={item.description}>
                          {item.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(item.submittedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Submit Button */}
            <div className="p-6 border-t border-slate-200">
              <div className="flex justify-center">
                <Button 
                  onClick={onFinalSubmit}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8"
                >
                  <Database className="w-5 h-5 mr-2" />
                  Submit to Database
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="text-center py-12">
            <FileCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No entries yet</h3>
            <p className="text-slate-600 mb-4">Start by adding your first entry using the form.</p>
            <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
              Add First Entry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewModule;
