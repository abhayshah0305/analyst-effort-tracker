
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Clock, Building, Tag, CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FormData } from "../pages/Index";

interface FormModuleProps {
  onSubmit: (data: Omit<FormData, 'id' | 'submittedAt'>) => void;
}

const FormModule = ({ onSubmit }: FormModuleProps) => {
  const [formData, setFormData] = useState({
    dealName: "",
    department: "",
    type: "",
    hoursWorked: "",
    description: "",
    taskDate: ""
  });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

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

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Deal name validation
    if (!formData.dealName.trim()) {
      errors.dealName = "Deal name is required";
    } else if (formData.dealName.length > 50) {
      errors.dealName = "Deal name must be 50 characters or less";
    }

    // Department validation
    if (!formData.department) {
      errors.department = "Department is required";
    }

    // Type validation
    if (!formData.type) {
      errors.type = "Type is required";
    }

    // Hours validation
    if (!formData.hoursWorked) {
      errors.hoursWorked = "Hours worked is required";
    } else {
      const hours = parseFloat(formData.hoursWorked);
      if (isNaN(hours) || hours <= 0) {
        errors.hoursWorked = "Hours must be greater than 0";
      } else if (hours > 24) {
        errors.hoursWorked = "Hours cannot exceed 24 per day";
      }
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.length < 10) {
      errors.description = "Description must be at least 10 characters";
    } else if (formData.description.length > 1000) {
      errors.description = "Description must be 1000 characters or less";
    }

    // Task date validation
    if (!formData.taskDate) {
      errors.taskDate = "Task date is required";
    } else {
      const taskDate = new Date(formData.taskDate);
      const today = new Date();
      const minDate = new Date('2020-01-01');
      
      if (taskDate > today) {
        errors.taskDate = "Task date cannot be in the future";
      } else if (taskDate < minDate) {
        errors.taskDate = "Task date cannot be before 2020";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    try {
      onSubmit({
        dealName: formData.dealName.trim(),
        department: formData.department,
        type: formData.type,
        hoursWorked: parseFloat(formData.hoursWorked),
        description: formData.description.trim(),
        taskDate: formData.taskDate
      });

      // Reset form
      setFormData({
        dealName: "",
        department: "",
        type: "",
        hoursWorked: "",
        description: "",
        taskDate: ""
      });
      setValidationErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error("Failed to submit form. Please try again.");
    }
  };

  // Check if all required fields are filled AND there are no validation errors
  const hasValidationErrors = Object.values(validationErrors).some(error => error !== "");
  const isFormValid = formData.dealName && formData.department && formData.type && 
                     formData.hoursWorked && formData.description && formData.taskDate &&
                     !hasValidationErrors;

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-white">
      <CardHeader className="pb-6">
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
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Deal/Project Name */}
          <div className="space-y-2">
            <Label htmlFor="dealName" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Deal Name / Project Name *
            </Label>
            <Input
              id="dealName"
              type="text"
              placeholder="Enter deal or project name"
              value={formData.dealName}
              maxLength={50}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, dealName: e.target.value }));
                if (validationErrors.dealName) {
                  setValidationErrors(prev => ({ ...prev, dealName: '' }));
                }
              }}
              className={cn(
                "h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500",
                validationErrors.dealName && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              required
            />
            {validationErrors.dealName && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.dealName}
              </div>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Department *
            </Label>
            <Select 
              value={formData.department} 
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, department: value }));
                if (validationErrors.department) {
                  setValidationErrors(prev => ({ ...prev, department: '' }));
                }
              }}
              required
            >
              <SelectTrigger className={cn(
                "h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500",
                validationErrors.department && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-lg">
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept} className="hover:bg-slate-50">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.department && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.department}
              </div>
            )}
          </div>

          {/* Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">Type *</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, type: value }));
                if (validationErrors.type) {
                  setValidationErrors(prev => ({ ...prev, type: '' }));
                }
              }}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Core" id="core" className="border-slate-300" />
                <Label htmlFor="core" className="text-sm text-slate-700 cursor-pointer">Core</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Project" id="project" className="border-slate-300" />
                <Label htmlFor="project" className="text-sm text-slate-700 cursor-pointer">Project</Label>
              </div>
            </RadioGroup>
            {validationErrors.type && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.type}
              </div>
            )}
          </div>

          {/* Task Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Task Date *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-11 justify-start text-left font-normal border-slate-300 focus:border-blue-500 focus:ring-blue-500",
                    !formData.taskDate && "text-muted-foreground",
                    validationErrors.taskDate && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.taskDate ? format(new Date(formData.taskDate), "PPP") : <span>Pick task date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.taskDate ? new Date(formData.taskDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setFormData(prev => ({ ...prev, taskDate: format(date, "yyyy-MM-dd") }));
                      if (validationErrors.taskDate) {
                        setValidationErrors(prev => ({ ...prev, taskDate: '' }));
                      }
                    }
                  }}
                  disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {validationErrors.taskDate && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.taskDate}
              </div>
            )}
          </div>

          {/* Hours Worked */}
          <div className="space-y-2">
            <Label htmlFor="hoursWorked" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Hours Worked *
            </Label>
            <Input
              id="hoursWorked"
              type="number"
              step="0.5"
              min="0"
              max="24"
              placeholder="Enter hours worked"
              value={formData.hoursWorked}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, hoursWorked: e.target.value }));
                if (validationErrors.hoursWorked) {
                  setValidationErrors(prev => ({ ...prev, hoursWorked: '' }));
                }
              }}
              className={cn(
                "h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500",
                validationErrors.hoursWorked && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              required
            />
            {validationErrors.hoursWorked && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.hoursWorked}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of the work performed..."
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }));
                if (validationErrors.description) {
                  setValidationErrors(prev => ({ ...prev, description: '' }));
                }
              }}
              className={cn(
                "min-h-[120px] border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none",
                validationErrors.description && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              required
            />
            <div className="flex justify-between items-center">
              {validationErrors.description && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.description}
                </div>
              )}
              <div className="text-xs text-slate-500 ml-auto">
                {formData.description.length}/1000 characters
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 disabled:opacity-50"
            disabled={!isFormValid}
          >
            Add Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormModule;
