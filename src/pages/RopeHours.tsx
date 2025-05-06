
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const RopeHours = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    ropeHours: "",
    level: "Level 1",
    client: "",
    location: "",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to submit hours",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.from("rope_entries").insert({
        user_id: user.id,
        date: formData.date,
        rope_hours: parseFloat(formData.ropeHours),
        level: formData.level,
        client: formData.client,
        location: formData.location,
        description: formData.description,
      });
      
      if (error) throw error;
      
      toast({
        title: "Hours logged successfully",
        description: "Your rope access hours have been recorded",
      });
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        ropeHours: "",
        level: "Level 1",
        client: "",
        location: "",
        description: ""
      });
      
    } catch (error: any) {
      toast({
        title: "Error logging hours",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Log Rope Access Hours</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Rope Access Hours Entry</CardTitle>
          <CardDescription>
            Record your rope access hours for certification and records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ropeHours">Hours</Label>
                <Input
                  id="ropeHours"
                  name="ropeHours"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="Enter hours"
                  value={formData.ropeHours}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select 
                  value={formData.level} 
                  onValueChange={(value) => handleSelectChange(value, "level")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Level 1">Level 1</SelectItem>
                    <SelectItem value="Level 2">Level 2</SelectItem>
                    <SelectItem value="Level 3">Level 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Input
                  id="client"
                  name="client"
                  placeholder="Client name"
                  value={formData.client}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Work location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Brief description of work performed"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full bg-ndt-600 hover:bg-ndt-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Log Hours"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RopeHours;
