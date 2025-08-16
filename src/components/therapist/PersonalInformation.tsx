import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save, X } from "lucide-react";

interface PersonalInformationProps {
  therapistProfile: {
    name: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    date_of_birth?: string;
    phone?: string;
    country?: string;
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
          {/* First Row */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
            {isEditing ? (
              <Input
                value={editedProfile?.first_name || ''}
                onChange={(e) => setEditedProfile(prev => prev ? {...prev, first_name: e.target.value} : null)}
                placeholder="Enter your first name"
              />
            ) : (
              <p className="text-foreground font-medium">{therapistProfile.first_name || 'Not specified'}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
            {isEditing ? (
              <Input
                value={editedProfile?.last_name || ''}
                onChange={(e) => setEditedProfile(prev => prev ? {...prev, last_name: e.target.value} : null)}
                placeholder="Enter your last name"
              />
            ) : (
              <p className="text-foreground font-medium">{therapistProfile.last_name || 'Not specified'}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
            {isEditing ? (
              <Input
                type="date"
                value={editedProfile?.date_of_birth || ''}
                onChange={(e) => setEditedProfile(prev => prev ? {...prev, date_of_birth: e.target.value} : null)}
              />
            ) : (
              <p className="text-foreground font-medium">{therapistProfile.date_of_birth || 'Not specified'}</p>
            )}
          </div>
          
          {/* Second Row */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
            {isEditing ? (
              <Input
                type="email"
                value={editedProfile?.email || ''}
                onChange={(e) => setEditedProfile(prev => prev ? {...prev, email: e.target.value} : null)}
                placeholder="Enter your email"
              />
            ) : (
              <p className="text-foreground font-medium">{therapistProfile.email || 'Not specified'}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
            {isEditing ? (
              <Input
                type="tel"
                value={editedProfile?.phone || ''}
                onChange={(e) => setEditedProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                placeholder="Enter your phone number"
              />
            ) : (
              <p className="text-foreground font-medium">{therapistProfile.phone || 'Not specified'}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">Country</Label>
            {isEditing ? (
              <Input
                value={editedProfile?.country || ''}
                onChange={(e) => setEditedProfile(prev => prev ? {...prev, country: e.target.value} : null)}
                placeholder="Enter your country"
              />
            ) : (
              <p className="text-foreground font-medium">{therapistProfile.country || 'Not specified'}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};