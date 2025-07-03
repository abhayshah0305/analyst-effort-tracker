
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
import { FileText, Clock, Building, Tag, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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

  const departments = [
    "Technology",
    "AMP",
    "Sales/Fundraise",
    "Debrief",
    "Coverage",
    "Asset Monitoring",
    "CRE"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dealName || !formData.department || !formData.type || 
        !formData.hoursWorked || !formData.description || !formData.taskDate) {
      return;
    }

    onSubmit({
      dealName: formData.dealName,
      department: formData.department,
      type: formData.type,
      hoursWorked: parseFloat(formData.hoursWorked),
      description: formData.description,
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
  };

  const isFormValid = formData.dealName && formData.department && formData.type && 
                     formData.hoursWorked && formData.description && formData.taskDate;

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
              onChange={(e) => setFormData(prev => ({ ...prev, dealName: e.target.value }))}
              className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Department *
            </Label>
            <Select 
              value={formData.department} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              required
            >
              <SelectTrigger className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
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
          </div>

          {/* Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">Type *</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
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
                    !formData.taskDate && "text-muted-foreground"
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
                    }
                  }}
                  disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
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
              placeholder="Enter hours worked"
              value={formData.hoursWorked}
              onChange={(e) => setFormData(prev => ({ ...prev, hoursWorked: e.target.value }))}
              className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
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
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[120px] border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              required
            />
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
