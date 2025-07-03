import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileCheck, Clock, Calendar, Edit2, Trash2, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
  onEditEntry: (id: string, updatedEntry: Omit<FormData, 'id' | 'submittedAt'>) => void;
  onDeleteEntry: (id: string) => void;
}

const ReviewModule = ({ data, onFinalSubmit, onBack, onEditEntry, onDeleteEntry }: ReviewModuleProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<FormData, 'id' | 'submittedAt'>>({
    dealName: "",
    department: "",
    type: "",
    hoursWorked: 0,
    description: "",
    taskDate: ""
  });

  const totalHours = data.reduce((sum, item) => sum + item.hoursWorked, 0);

  const departments = [
    "Technology",
    "AMP",
    "Sales/Fundraise",
    "Debrief",
    "Coverage",
    "Asset Monitoring",
    "CRE",
    "Residental",
    "Equity Enhancer Product",
    "Co-Investments"
  ];

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

  const handleEdit = (item: FormData) => {
    setEditingId(item.id);
    setEditForm({
      dealName: item.dealName,
      department: item.department,
      type: item.type,
      hoursWorked: item.hoursWorked,
      description: item.description,
      taskDate: item.taskDate
    });
  };

  const handleSaveEdit = () => {
    if (editingId) {
      onEditEntry(editingId, editForm);
      setEditingId(null);
      setEditForm({
        dealName: "",
        department: "",
        type: "",
        hoursWorked: 0,
        description: "",
        taskDate: ""
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      dealName: "",
      department: "",
      type: "",
      hoursWorked: 0,
      description: "",
      taskDate: ""
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
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
              size="icon"
              className="border-slate-300 hover:bg-slate-50 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
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
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <>
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
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this entry? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => onDeleteEntry(item.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Edit Form Row */}
                      {editingId === item.id && (
                        <TableRow className="bg-blue-50">
                          <TableCell colSpan={7} className="p-6">
                            <div className="space-y-4">
                              <h4 className="font-medium text-slate-800 mb-4">Edit Entry</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-dealName" className="text-sm font-medium">Deal Name</Label>
                                  <Input
                                    id="edit-dealName"
                                    value={editForm.dealName}
                                    onChange={(e) => setEditForm(f => ({ ...f, dealName: e.target.value }))}
                                    maxLength={50}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="edit-department" className="text-sm font-medium">Department</Label>
                                  <Select 
                                    value={editForm.department} 
                                    onValueChange={(value) => setEditForm(f => ({ ...f, department: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {departments.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                          {dept}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Type</Label>
                                  <RadioGroup
                                    value={editForm.type}
                                    onValueChange={(value) => setEditForm(f => ({ ...f, type: value }))}
                                    className="flex space-x-6"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="Core" id="edit-core" />
                                      <Label htmlFor="edit-core">Core</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="Project" id="edit-project" />
                                      <Label htmlFor="edit-project">Project</Label>
                                    </div>
                                  </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Task Date</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !editForm.taskDate && "text-muted-foreground"
                                        )}
                                      >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {editForm.taskDate ? format(new Date(editForm.taskDate), "PPP") : <span>Pick date</span>}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <CalendarComponent
                                        mode="single"
                                        selected={editForm.taskDate ? new Date(editForm.taskDate) : undefined}
                                        onSelect={(date) => {
                                          if (date) {
                                            setEditForm(f => ({ ...f, taskDate: format(date, "yyyy-MM-dd") }));
                                          }
                                        }}
                                        disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="edit-hours" className="text-sm font-medium">Hours Worked</Label>
                                  <Input
                                    id="edit-hours"
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="24"
                                    value={editForm.hoursWorked}
                                    onChange={(e) => setEditForm(f => ({ ...f, hoursWorked: parseFloat(e.target.value) || 0 }))}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                                <Textarea
                                  id="edit-description"
                                  value={editForm.description}
                                  onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                                  className="min-h-[80px]"
                                />
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                                  <Save className="w-4 h-4 mr-1" />
                                  Save
                                </Button>
                                <Button onClick={handleCancelEdit} size="sm" variant="outline">
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
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
