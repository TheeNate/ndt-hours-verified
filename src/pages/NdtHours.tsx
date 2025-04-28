import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

const NdtHours = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [methodInput, setMethodInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [currentEntry, setCurrentEntry] = useState({
    id: "",
    entry_date: "",
    method: "",
    location: "",
    hours: 0,
    company: "",
    supervisor: "",
  });

  // Fetch entries, methods, and companies when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Fetch entries for the current user
        const { data: entriesData, error: entriesError } = await supabase
          .from("ndt_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("entry_date", { ascending: false });
          
        if (entriesError) throw entriesError;
        
        // Fetch methods
        const { data: methodsData, error: methodsError } = await supabase
          .from("methods")
          .select("*")
          .order("name");
          
        if (methodsError) throw methodsError;
        
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from("companies")
          .select("*")
          .order("name");
          
        if (companiesError) throw companiesError;
        
        setEntries(entriesData || []);
        setMethods(methodsData || []);
        setCompanies(companiesData || []);
      } catch (error: any) {
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);

  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('companies').select('count');
        if (error) {
          console.error('Supabase connection error:', error);
        } else {
          console.log('Supabase connected successfully:', data);
        }
      } catch (err) {
        console.error('Connection test failed:', err);
      }
    };
    testConnection();
  }, []);

  const handleAddEntry = async () => {
    // Validate required fields
    if (!currentEntry.entry_date || !currentEntry.method || !currentEntry.company) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) return;
    
    try {
      const newEntry = {
        ...currentEntry,
        user_id: user.id,
      };
      
      const { error } = await supabase.from("ndt_entries").insert(newEntry);
      
      if (error) throw error;
      
      // Add method if it doesn't exist yet
      if (!methods.some(m => m.name === currentEntry.method)) {
        await supabase.from("methods").insert({ name: currentEntry.method });
        setMethods([...methods, { name: currentEntry.method }]);
      }
      
      // Add company if it doesn't exist yet
      if (!companies.some(c => c.name === currentEntry.company)) {
        await supabase.from("companies").insert({ name: currentEntry.company });
        setCompanies([...companies, { name: currentEntry.company }]);
      }
      
      // Refresh entries
      const { data: entriesData } = await supabase
        .from("ndt_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false });
      
      setEntries(entriesData || []);
      
      toast({
        title: "Entry added",
        description: "Your NDT hours entry has been added successfully.",
      });
      
      // Reset form and close dialog
      setCurrentEntry({
        id: "",
        entry_date: "",
        method: "",
        location: "",
        hours: 0,
        company: "",
        supervisor: "",
      });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error adding entry",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditEntry = async () => {
    try {
      const { error } = await supabase
        .from("ndt_entries")
        .update({
          entry_date: currentEntry.entry_date,
          method: currentEntry.method,
          location: currentEntry.location,
          hours: currentEntry.hours,
          company: currentEntry.company,
          supervisor: currentEntry.supervisor,
        })
        .eq("id", currentEntry.id);
      
      if (error) throw error;
      
      // Add method if it doesn't exist yet
      if (!methods.some(m => m.name === currentEntry.method)) {
        await supabase.from("methods").insert({ name: currentEntry.method });
        setMethods([...methods, { name: currentEntry.method }]);
      }
      
      // Add company if it doesn't exist yet
      if (!companies.some(c => c.name === currentEntry.company)) {
        await supabase.from("companies").insert({ name: currentEntry.company });
        setCompanies([...companies, { name: currentEntry.company }]);
      }
      
      // Update entries state
      setEntries(entries.map(e => 
        e.id === currentEntry.id ? { ...e, ...currentEntry } : e
      ));
      
      toast({
        title: "Entry updated",
        description: "Your NDT hours entry has been updated successfully.",
      });
      
      // Close dialog
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error updating entry",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ndt_entries")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Update entries state
      setEntries(entries.filter(e => e.id !== id));
      
      toast({
        title: "Entry deleted",
        description: "Your NDT hours entry has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting entry",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Calculate totals by method
  const methodTotals = entries.reduce((acc, entry) => {
    const method = entry.method;
    acc[method] = (acc[method] || 0) + entry.hours;
    return acc;
  }, {} as Record<string, number>);

  const totalHours = (Object.values(methodTotals) as number[])
  .reduce((sum, hours) => sum + hours, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">NDT Hours</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your Non-Destructive Testing hours
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-ndt-600 hover:bg-ndt-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add NDT Hours Entry</DialogTitle>
              <DialogDescription>
                Add a new entry to track your NDT hours
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="entry_date" className="text-right">
                  Date
                </Label>
                <Input
                  id="entry_date"
                  type="date"
                  value={currentEntry.entry_date}
                  onChange={e => setCurrentEntry({ ...currentEntry, entry_date: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="method" className="text-right">
                  Method
                </Label>
                <div className="col-span-3 relative">
                  {methodInput ? (
                    <Input
                      id="method"
                      value={methodInput}
                      onChange={e => {
                        setMethodInput(e.target.value);
                        setCurrentEntry({ ...currentEntry, method: e.target.value });
                      }}
                      className="pr-16"
                    />
                  ) : (
                    <Select
                      value={currentEntry.method}
                      onValueChange={value => {
                        if (value === "add_new") {
                          setMethodInput("");
                        } else {
                          setCurrentEntry({ ...currentEntry, method: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                      <SelectContent>
                        {methods.map((method) => (
                          <SelectItem key={method.name} value={method.name}>
                            {method.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="add_new">+ Add new method</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {methodInput && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => {
                        setMethodInput("");
                        setCurrentEntry({ ...currentEntry, method: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Company
                </Label>
                <div className="col-span-3 relative">
                  {companyInput ? (
                    <Input
                      id="company"
                      value={companyInput}
                      onChange={e => {
                        setCompanyInput(e.target.value);
                        setCurrentEntry({ ...currentEntry, company: e.target.value });
                      }}
                      className="pr-16"
                    />
                  ) : (
                    <Select
                      value={currentEntry.company}
                      onValueChange={value => {
                        if (value === "add_new") {
                          setCompanyInput("");
                        } else {
                          setCurrentEntry({ ...currentEntry, company: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.name} value={company.name}>
                            {company.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="add_new">+ Add new company</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {companyInput && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => {
                        setCompanyInput("");
                        setCurrentEntry({ ...currentEntry, company: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={currentEntry.location}
                  onChange={e => setCurrentEntry({ ...currentEntry, location: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g. Houston, TX"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hours" className="text-right">
                  Hours
                </Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={currentEntry.hours}
                  onChange={e => setCurrentEntry({ ...currentEntry, hours: parseFloat(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supervisor" className="text-right">
                  Supervisor
                </Label>
                <Input
                  id="supervisor"
                  value={currentEntry.supervisor}
                  onChange={e => setCurrentEntry({ ...currentEntry, supervisor: e.target.value })}
                  className="col-span-3"
                  placeholder="Supervisor's name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEntry} className="bg-ndt-600 hover:bg-ndt-700">
                Add Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Hours</CardTitle>
            <CardDescription>All NDT hours combined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalHours}</div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Hours by Method</CardTitle>
            <CardDescription>Breakdown of hours by NDT method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(Object.entries(methodTotals) as [string, number][]).map(
                ([method, hours]) => (
                  <div key={method} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">{method}</div>
                    <div className="text-xl font-semibold">{hours} hrs</div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>NDT Hours Log</CardTitle>
          <CardDescription>
            Your recorded NDT hours and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-ndt-600" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No entries found. Add your first NDT hours entry.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {entry.entry_date ? format(new Date(entry.entry_date), "MMM d, yyyy") : "N/A"}
                      </TableCell>
                      <TableCell>{entry.method}</TableCell>
                      <TableCell>{entry.company}</TableCell>
                      <TableCell>{entry.location}</TableCell>
                      <TableCell>{entry.hours}</TableCell>
                      <TableCell>{entry.supervisor}</TableCell>
                      <TableCell className="text-right flex justify-end space-x-2">
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={(e) => {
                                // Prevent the click from immediately opening and closing the dialog
                                e.stopPropagation();
                                setCurrentEntry({...entry});
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit NDT Hours Entry</DialogTitle>
                              <DialogDescription>
                                Make changes to your NDT hours entry
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit_entry_date" className="text-right">
                                  Date
                                </Label>
                                <Input
                                  id="edit_entry_date"
                                  type="date"
                                  value={currentEntry.entry_date}
                                  onChange={e => setCurrentEntry({ ...currentEntry, entry_date: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit_method" className="text-right">
                                  Method
                                </Label>
                                <div className="col-span-3 relative">
                                  {methodInput ? (
                                    <Input
                                      id="edit_method"
                                      value={methodInput}
                                      onChange={e => {
                                        setMethodInput(e.target.value);
                                        setCurrentEntry({ ...currentEntry, method: e.target.value });
                                      }}
                                      className="pr-16"
                                    />
                                  ) : (
                                    <Select
                                      value={currentEntry.method}
                                      onValueChange={value => {
                                        if (value === "add_new") {
                                          setMethodInput("");
                                        } else {
                                          setCurrentEntry({ ...currentEntry, method: value });
                                        }
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a method" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {methods.map((method) => (
                                          <SelectItem key={method.name} value={method.name}>
                                            {method.name}
                                          </SelectItem>
                                        ))}
                                        <SelectItem value="add_new">+ Add new method</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                  {methodInput && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3"
                                      onClick={() => {
                                        setMethodInput("");
                                        setCurrentEntry({ ...currentEntry, method: "" });
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit_company" className="text-right">
                                  Company
                                </Label>
                                <div className="col-span-3 relative">
                                  {companyInput ? (
                                    <Input
                                      id="edit_company"
                                      value={companyInput}
                                      onChange={e => {
                                        setCompanyInput(e.target.value);
                                        setCurrentEntry({ ...currentEntry, company: e.target.value });
                                      }}
                                      className="pr-16"
                                    />
                                  ) : (
                                    <Select
                                      value={currentEntry.company}
                                      onValueChange={value => {
                                        if (value === "add_new") {
                                          setCompanyInput("");
                                        } else {
                                          setCurrentEntry({ ...currentEntry, company: value });
                                        }
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a company" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {companies.map((company) => (
                                          <SelectItem key={company.name} value={company.name}>
                                            {company.name}
                                          </SelectItem>
                                        ))}
                                        <SelectItem value="add_new">+ Add new company</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                  {companyInput && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3"
                                      onClick={() => {
                                        setCompanyInput("");
                                        setCurrentEntry({ ...currentEntry, company: "" });
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit_location" className="text-right">
                                  Location
                                </Label>
                                <Input
                                  id="edit_location"
                                  value={currentEntry.location}
                                  onChange={e => setCurrentEntry({ ...currentEntry, location: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit_hours" className="text-right">
                                  Hours
                                </Label>
                                <Input
                                  id="edit_hours"
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={currentEntry.hours}
                                  onChange={e => setCurrentEntry({ ...currentEntry, hours: parseFloat(e.target.value) })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit_supervisor" className="text-right">
                                  Supervisor
                                </Label>
                                <Input
                                  id="edit_supervisor"
                                  value={currentEntry.supervisor}
                                  onChange={e => setCurrentEntry({ ...currentEntry, supervisor: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleEditEntry} className="bg-ndt-600 hover:bg-ndt-700">
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NdtHours;
