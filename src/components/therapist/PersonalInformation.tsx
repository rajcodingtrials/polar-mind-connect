import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save, X } from "lucide-react";

interface PersonalInformationProps {
  therapistProfile: {
    name: string;
    years_experience: number;
    certification?: string;
  };
  editedProfile: any;
  setEditedProfile: (profile: any) => void;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const PersonalInformation = ({
  therapistProfile,
  editedProfile,
  setEditedProfile,
  isEditing,
  onEdit,
  onSave,
  onCancel
}: PersonalInformationProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Personal Information</CardTitle>
          {!isEditing ? (
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={onSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={onCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">Professional Name</Label>
            {isEditing ? (
              <Input
                value={editedProfile?.name || ''}
                onChange={(e) => setEditedProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                placeholder="Enter your professional name"
              />
            ) : (
              <p className="text-foreground font-medium">{therapistProfile.name}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">Years of Experience</Label>
            {isEditing ? (
              <Input
                type="number"
                value={editedProfile?.years_experience || 0}
                onChange={(e) => setEditedProfile(prev => prev ? {...prev, years_experience: parseInt(e.target.value) || 0} : null)}
              />
            ) : (
              <p className="text-foreground font-medium">{therapistProfile.years_experience} years</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">Certifications</Label>
            {isEditing ? (
              <Input
                value={editedProfile?.certification || ''}
                onChange={(e) => setEditedProfile(prev => prev ? {...prev, certification: e.target.value} : null)}
                placeholder="Enter your certifications"
              />
            ) : (
              <p className="text-foreground font-medium">{therapistProfile.certification || 'Not specified'}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};