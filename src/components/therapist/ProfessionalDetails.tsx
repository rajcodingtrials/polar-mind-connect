import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X } from "lucide-react";

interface ProfessionalDetailsProps {
  therapistProfile: {
    bio?: string;
    hourly_rate_30min?: number;
    hourly_rate_60min?: number;
    specializations: string[];
    certification?: string;
    education?: string;
    languages?: string[];
  };
  editedProfile: any;
  setEditedProfile: (profile: any) => void;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ProfessionalDetails = ({
  therapistProfile,
  editedProfile,
  setEditedProfile,
  isEditing,
  onEdit,
  onSave,
  onCancel
}: ProfessionalDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Professional Details</CardTitle>
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
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">30-min Session Rate</Label>
            {isEditing ? (
              <Input
                type="number"
                step="0.01"
                value={editedProfile?.hourly_rate_30min || ''}
                onChange={(e) => setEditedProfile(prev => prev ? {...prev, hourly_rate_30min: parseFloat(e.target.value) || null} : null)}
                placeholder="0.00"
              />
            ) : (
              <p className="text-foreground font-medium">
                ${therapistProfile.hourly_rate_30min || 'Not set'}
              </p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">60-min Session Rate</Label>
            {isEditing ? (
              <Input
                type="number"
                step="0.01"
                value={editedProfile?.hourly_rate_60min || ''}
                onChange={(e) => setEditedProfile(prev => prev ? {...prev, hourly_rate_60min: parseFloat(e.target.value) || null} : null)}
                placeholder="0.00"
              />
            ) : (
              <p className="text-foreground font-medium">
                ${therapistProfile.hourly_rate_60min || 'Not set'}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">Professional Bio</Label>
          {isEditing ? (
            <Textarea
              value={editedProfile?.bio || ''}
              onChange={(e) => setEditedProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
              rows={4}
              placeholder="Tell clients about your background and approach..."
            />
          ) : (
            <p className="text-foreground leading-relaxed">{therapistProfile.bio || 'No bio provided'}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">Certifications & Licenses</Label>
          {isEditing ? (
            <Textarea
              value={editedProfile?.certification || ''}
              onChange={(e) => setEditedProfile(prev => prev ? {...prev, certification: e.target.value} : null)}
              rows={3}
              placeholder="List your certifications and licenses..."
            />
          ) : (
            <p className="text-foreground leading-relaxed">{therapistProfile.certification || 'Not specified'}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">Education</Label>
          {isEditing ? (
            <Textarea
              value={editedProfile?.education || ''}
              onChange={(e) => setEditedProfile(prev => prev ? {...prev, education: e.target.value} : null)}
              rows={3}
              placeholder="Describe your educational background..."
            />
          ) : (
            <p className="text-foreground leading-relaxed">{therapistProfile.education || 'Not specified'}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">Languages</Label>
          <div className="flex flex-wrap gap-2">
            {therapistProfile.languages && therapistProfile.languages.length > 0 ? (
              therapistProfile.languages.map((lang, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">Not specified</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">Specializations</Label>
          <div className="flex flex-wrap gap-2">
            {therapistProfile.specializations.map((spec, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};