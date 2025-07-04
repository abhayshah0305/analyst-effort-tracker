
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Clock, Building, Tag, CalendarIcon, AlertCircle, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FormData } from "../pages/Index";

interface FormModuleProps {
  onSubmit: (data: Omit<FormData, 'id' | 'submittedAt'>) => void;
}

interface EntryFormData {
  dealName: string;
  department: string;
  type: string;
  hoursWorked: string;
  description: string;
  taskDate: string;
}

const FormModule = ({ onSubmit }: FormModuleProps) => {
  const [entries, setEntries] = useState<EntryFormData[]>([{
    dealName: "",
    department: "",
    type: "",
    hoursWorked: "",
    description: "",
    taskDate: ""
  }]);
  const [validationErrors, setValidationErrors] = useState<{ [key: number]: { [key: string]: string } }>({});

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

  const types = [
    { value: "Core", label: "Core" },
    { value: "Project", label: "Project" }
  ];

  const validateEntry = (entry: EntryFormData, index: number) => {
    const errors: { [key: string]: string } = {};

    // Deal name validation
    if (!entry.dealName.trim()) {
      errors.dealName = "Deal name is required";
    } else if (entry.dealName.length > 50) {
      errors.dealName = "Deal name must be 50 characters or less";
    }

    // Department validation
    if (!entry.department) {
      errors.department = "Department is required";
    }

    // Type validation
    if (!entry.type) {
      errors.type = "Type is required";
    }

    // Hours validation
    if (!entry.hoursWorked) {
      errors.hoursWorked = "Hours worked is required";
    } else {
      const hours = parseFloat(entry.hoursWorked);
      if (isNaN(hours) || hours <= 0) {
        errors.hoursWorked = "Hours must be greater than 0";
      } else if (hours > 200) {
        errors.hoursWorked = "Hours cannot exceed 200";
      }
    }

    // Description validation (now optional)
    if (entry.description.trim() && entry.description.length > 1000) {
      errors.description = "Description must be 1000 characters or less";
    }

    // Task date validation
    if (!entry.taskDate) {
      errors.taskDate = "Task date is required";
    } else {
      const taskDate = new Date(entry.taskDate);
      const today = new Date();
      const minDate = new Date('2020-01-01');
      
      if (taskDate > today) {
        errors.taskDate = "Task date cannot be in the future";
      } else if (taskDate < minDate) {
        errors.taskDate = "Task date cannot be before 2020";
      }
    }

    return errors;
  };

  const validateAllEntries = () => {
    const allErrors: { [key: number]: { [key: string]: string } } = {};
    let hasErrors = false;

    entries.forEach((entry, index) => {
      const errors = validateEntry(entry, index);
      if (Object.keys(errors).length > 0) {
        allErrors[index] = errors;
        hasErrors = true;
      }
    });

    setValidationErrors(allErrors);
    return !hasErrors;
  };

  const handleAddEntry = () => {
    setEntries(prev => [...prev, {
      dealName: "",
      department: "",
      type: "",
      hoursWorked: "",
      description: "",
      taskDate: ""
    }]);
  };

  const handleRemoveEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter((_, i) => i !== index));
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        // Reindex remaining errors
        const reindexedErrors: { [key: number]: { [key: string]: string } } = {};
        Object.keys(newErrors).forEach(key => {
          const keyNum = parseInt(key);
          if (keyNum > index) {
            reindexedErrors[keyNum - 1] = newErrors[keyNum];
          } else if (keyNum < index) {
            reindexedErrors[keyNum] = newErrors[keyNum];
          }
        });
        return reindexedErrors;
      });
    }
  };

  const updateEntry = (index: number, field: keyof EntryFormData, value: string) => {
    setEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ));
    
    // Clear validation error for this field
    if (validationErrors[index]?.[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          [field]: ''
        }
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllEntries()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    try {
      // Submit all entries
      entries.forEach(entry => {
        onSubmit({
          dealName: entry.dealName.trim(),
          department: entry.department,
          type: entry.type,
          hoursWorked: parseFloat(entry.hoursWorked),
          description: entry.description.trim(),
          taskDate: entry.taskDate
        });
      });

      // Reset form to single empty entry
      setEntries([{
        dealName: "",
        department: "",
        type: "",
        hoursWorked: "",
        description: "",
        taskDate: ""
      }]);
      setValidationErrors({});
      
      toast.success(`${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} added to review list!`);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error("Failed to submit form. Please try again.");
    }
  };

  // Check if all required fields are filled for all entries
  const allEntriesValid = entries.every((entry, index) => {
    const errors = validateEntry(entry, index);
    return entry.dealName && entry.department && entry.type && 
           entry.hoursWorked && entry.taskDate && 
           Object.keys(errors).length === 0;
  });

  return (
    <Card className="max-w-full mx-auto shadow-lg border-0 bg-white">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">
                Analyst Effort Entry
              </CardTitle>
              <CardDescription className="text-slate-600">
                Record your work details and time allocation
              </CardDescription>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAddEntry}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {entries.map((entry, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3 relative">
              {entries.length > 1 && (
                <Button
                  type="button"
                  onClick={() => handleRemoveEntry(index)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              
              {entries.length > 1 && (
                <div className="text-sm font-medium text-slate-600 mb-3">
                  Entry {index + 1}
                </div>
              )}
              
              {/* Single Row Layout - All fields on one row */}
              <div className="grid grid-cols-12 gap-3">
                {/* Deal/Project Name */}
                <div className="col-span-2 space-y-1">
                  <Label htmlFor={`dealName-${index}`} className="text-xs font-medium text-slate-700 flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    Deal Name *
                  </Label>
                  <Input
                    id={`dealName-${index}`}
                    type="text"
                    placeholder="Deal name"
                    value={entry.dealName}
                    maxLength={50}
                    onChange={(e) => updateEntry(index, 'dealName', e.target.value)}
                    className={cn(
                      "h-9 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500",
                      validationErrors[index]?.dealName && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                    required
                  />
                  {validationErrors[index]?.dealName && (
                    <div className="flex items-center gap-1 text-red-600 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors[index].dealName}
                    </div>
                  )}
                </div>

                {/* Department */}
                <div className="col-span-2 space-y-1">
                  <Label htmlFor={`department-${index}`} className="text-xs font-medium text-slate-700 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Department *
                  </Label>
                  <Select 
                    value={entry.department} 
                    onValueChange={(value) => updateEntry(index, 'department', value)}
                    required
                  >
                    <SelectTrigger className={cn(
                      "h-9 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500",
                      validationErrors[index]?.department && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}>
                      <SelectValue placeholder="Dept" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-lg z-50">
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept} className="hover:bg-slate-50">
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors[index]?.department && (
                    <div className="flex items-center gap-1 text-red-600 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors[index].department}
                    </div>
                  )}
                </div>

                {/* Type */}
                <div className="col-span-1 space-y-1">
                  <Label className="text-xs font-medium text-slate-700">Type *</Label>
                  <Select 
                    value={entry.type} 
                    onValueChange={(value) => updateEntry(index, 'type', value)}
                    required
                  >
                    <SelectTrigger className={cn(
                      "h-9 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500",
                      validationErrors[index]?.type && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-lg z-50">
                      {types.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="hover:bg-slate-50">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors[index]?.type && (
                    <div className="flex items-center gap-1 text-red-600 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors[index].type}
                    </div>
                  )}
                </div>

                {/* Task Date */}
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    Date *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-9 justify-start text-left font-normal text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500",
                          !entry.taskDate && "text-muted-foreground",
                          validationErrors[index]?.taskDate && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {entry.taskDate ? format(new Date(entry.taskDate), "MMM dd") : <span>Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={entry.taskDate ? new Date(entry.taskDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            updateEntry(index, 'taskDate', format(date, "yyyy-MM-dd"));
                          }
                        }}
                        disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {validationErrors[index]?.taskDate && (
                    <div className="flex items-center gap-1 text-red-600 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors[index].taskDate}
                    </div>
                  )}
                </div>

                {/* Hours Worked */}
                <div className="col-span-1 space-y-1">
                  <Label htmlFor={`hoursWorked-${index}`} className="text-xs font-medium text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Hours *
                  </Label>
                  <Input
                    id={`hoursWorked-${index}`}
                    type="number"
                    step="0.5"
                    min="0"
                    max="200"
                    placeholder="Hrs"
                    value={entry.hoursWorked}
                    onChange={(e) => updateEntry(index, 'hoursWorked', e.target.value)}
                    className={cn(
                      "h-9 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500",
                      validationErrors[index]?.hoursWorked && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                    required
                  />
                  {validationErrors[index]?.hoursWorked && (
                    <div className="flex items-center gap-1 text-red-600 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors[index].hoursWorked}
                    </div>
                  )}
                </div>

                {/* Description - smaller and on same row */}
                <div className="col-span-4 space-y-1">
                  <Label htmlFor={`description-${index}`} className="text-xs font-medium text-slate-700">
                    Description
                  </Label>
                  <Input
                    id={`description-${index}`}
                    type="text"
                    placeholder="Brief description (optional)"
                    value={entry.description}
                    onChange={(e) => updateEntry(index, 'description', e.target.value)}
                    maxLength={200}
                    className={cn(
                      "h-9 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500",
                      validationErrors[index]?.description && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  <div className="flex justify-between items-center">
                    {validationErrors[index]?.description && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors[index].description}
                      </div>
                    )}
                    <div className="text-xs text-slate-500 ml-auto">
                      {entry.description.length}/200
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 disabled:opacity-50"
            disabled={!allEntriesValid}
          >
            Add {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormModule;
