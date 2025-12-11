import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTherapistAuth } from "../hooks/useTherapistAuth";
import TherapistHeader from "../components/therapist/TherapistHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Link2, Unlink, Calendar, LayoutDashboard, CheckCircle2, XCircle } from "lucide-react";

interface LinkedParent {
  id: string;
  parent_user_id: string;
  linked_at: string;
  parent_email: string;
  parent_name: string;
  is_active: boolean;
}

const LinkedParents = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { therapistProfile, loading: profileLoading } = useTherapistAuth();
  const navigate = useNavigate();
  
  const [linkedParents, setLinkedParents] = useState<LinkedParent[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const [parentCode, setParentCode] = useState("");
  const [activating, setActivating] = useState<string | null>(null);
  const [deactivatingAll, setDeactivatingAll] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }
    
    if (!profileLoading && !therapistProfile) {
      navigate("/therapist-dashboard", { replace: true });
      return;
    }
  }, [isAuthenticated, authLoading, therapistProfile, profileLoading, navigate]);

  useEffect(() => {
    if (therapistProfile?.id) {
      fetchLinkedParents();
    }
  }, [therapistProfile?.id]);

  const fetchLinkedParents = async () => {
    if (!therapistProfile?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('linked_parents' as any)
        .select('id, parent_user_id, linked_at, is_active')
        .eq('therapist_id', therapistProfile.id)
        .order('linked_at', { ascending: false });

      if (error) throw error;

      // Fetch parent user data for each linked parent using database function
      const parents: LinkedParent[] = await Promise.all(
        (data || []).map(async (item: any) => {
          // Get parent user details from auth.users via database function
          const { data: userData, error: userError } = await (supabase.rpc as any)('get_user_details', { _user_id: item.parent_user_id }) as { data: Array<{ user_id: string; email: string; name: string }> | null; error: any };

          if (userError || !userData || !Array.isArray(userData) || userData.length === 0) {
            // Fallback if function fails
            return {
              id: item.id,
              parent_user_id: item.parent_user_id,
              linked_at: item.linked_at,
              parent_email: 'Unknown',
              parent_name: 'Unknown',
              is_active: item.is_active || false,
            };
          }

          const userInfo = userData[0];
          const email = userInfo.email || 'Unknown';
          const name = userInfo.name || email.split('@')[0];
          
          return {
            id: item.id,
            parent_user_id: item.parent_user_id,
            linked_at: item.linked_at,
            parent_email: email,
            parent_name: name,
            is_active: item.is_active || false,
          };
        })
      );

      setLinkedParents(parents);
    } catch (error: any) {
      console.error('Error fetching linked parents:', error);
      toast.error('Failed to load linked parents');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkParent = async () => {
    if (!therapistProfile?.id) {
      toast.error('Therapist profile not found');
      return;
    }

    if (!parentEmail.trim() || !parentCode.trim()) {
      toast.error('Please enter both email and code');
      return;
    }

    try {
      setLinking(true);

      // Find the parent by email using database function
      // This function can access auth.users which therapists can't directly query
      const { data: userData, error: userError } = await (supabase.rpc as any)('find_user_by_email', { _email: parentEmail.trim() }) as { data: Array<{ user_id: string; email: string }> | null; error: any };

      if (userError || !userData || !Array.isArray(userData) || userData.length === 0) {
        toast.error('Parent not found with that email');
        return;
      }

      const parentUserId = userData[0].user_id;

      // Verify the code
      const { data: codeData, error: codeError } = await supabase
        .from('parent_codes' as any)
        .select('*')
        .eq('code', parentCode.trim().toUpperCase())
        .eq('is_active', true)
        .eq('parent_user_id', parentUserId)
        .maybeSingle();

      if (codeError || !codeData) {
        toast.error('Invalid or expired code');
        return;
      }

      // Check if code has expired
      if ((codeData as any).expires_at && new Date((codeData as any).expires_at) < new Date()) {
        toast.error('Code has expired');
        return;
      }

      // Check if already linked
      const { data: existingLink } = await supabase
        .from('linked_parents' as any)
        .select('id')
        .eq('therapist_id', therapistProfile.id)
        .eq('parent_user_id', parentUserId)
        .maybeSingle();

      if (existingLink) {
        toast.error('This parent is already linked');
        return;
      }

      // Create the link
      const { error: linkError } = await supabase
        .from('linked_parents' as any)
        .insert({
          therapist_id: therapistProfile.id,
          parent_user_id: parentUserId,
          linked_by_code: (codeData as any).code,
          is_active: false, // New links start as inactive
        });

      if (linkError) throw linkError;

      // Mark code as used
      await supabase
        .from('parent_codes' as any)
        .update({
          is_active: false,
          used_at: new Date().toISOString(),
          used_by_therapist_id: therapistProfile.id,
        })
        .eq('id', (codeData as any).id);

      toast.success('Parent linked successfully!');
      setParentEmail("");
      setParentCode("");
      fetchLinkedParents();
    } catch (error: any) {
      console.error('Error linking parent:', error);
      toast.error(error.message || 'Failed to link parent');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkParent = async (parentId: string, parentUserId: string) => {
    if (!confirm('Are you sure you want to unlink this parent?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('linked_parents' as any)
        .delete()
        .eq('id', parentId)
        .eq('therapist_id', therapistProfile?.id);

      if (error) throw error;

      toast.success('Parent unlinked successfully');
      fetchLinkedParents();
    } catch (error: any) {
      console.error('Error unlinking parent:', error);
      toast.error('Failed to unlink parent');
    }
  };

  const handleActivateParent = async (parentId: string) => {
    if (!therapistProfile?.id) return;

    try {
      setActivating(parentId);

      // First, deactivate all other parents for this therapist
      await supabase
        .from('linked_parents' as any)
        .update({ is_active: false })
        .eq('therapist_id', therapistProfile.id)
        .neq('id', parentId);

      // Then activate the selected parent
      const { error } = await supabase
        .from('linked_parents' as any)
        .update({ is_active: true })
        .eq('id', parentId)
        .eq('therapist_id', therapistProfile.id);

      if (error) throw error;

      toast.success('Parent activated successfully');
      fetchLinkedParents();
    } catch (error: any) {
      console.error('Error activating parent:', error);
      toast.error('Failed to activate parent');
    } finally {
      setActivating(null);
    }
  };

  const handleDeactivateAll = async () => {
    if (!therapistProfile?.id) return;

    try {
      setDeactivatingAll(true);

      const { error } = await supabase
        .from('linked_parents' as any)
        .update({ is_active: false })
        .eq('therapist_id', therapistProfile.id);

      if (error) throw error;

      toast.success('All parents deactivated successfully');
      fetchLinkedParents();
    } catch (error: any) {
      console.error('Error deactivating all parents:', error);
      toast.error('Failed to deactivate all parents');
    } finally {
      setDeactivatingAll(false);
    }
  };

  if (authLoading || profileLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <TherapistHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-700 mb-2">Loading...</h2>
            <p className="text-slate-600">Please wait while we load your parents</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <TherapistHeader />
      <main className="flex-grow container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-2">My Linked Parents</h1>
          <p className="text-sm sm:text-base text-slate-600">Manage your linked parents and connect with new ones</p>
        </div>

        {/* Link New Parent Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Link New Parent
            </CardTitle>
            <CardDescription>
              Enter the parent's email and one-time code to link their account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="parent-email">Parent Email</Label>
                <Input
                  id="parent-email"
                  type="email"
                  placeholder="parent@example.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="parent-code">One-Time Code</Label>
                <Input
                  id="parent-code"
                  type="text"
                  placeholder="ABC123"
                  value={parentCode}
                  onChange={(e) => setParentCode(e.target.value.toUpperCase())}
                  className="mt-1"
                  maxLength={6}
                />
              </div>
            </div>
            <Button
              onClick={handleLinkParent}
              disabled={linking || !parentEmail.trim() || !parentCode.trim()}
              className="w-full md:w-auto"
            >
              {linking ? "Linking..." : "Link Parent"}
            </Button>
          </CardContent>
        </Card>

        {/* Linked Parents List */}
        <Card>
          <CardHeader>
            <div className="mb-3">
              <CardTitle className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5" />
                Linked Parents ({linkedParents.length})
              </CardTitle>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[256px_224px_224px_208px] min-w-[640px] gap-0">
                  <div className="col-span-3 flex items-center">
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• Parents who have linked their accounts with you.</p>
                      <p>• Only one parent can be activated at a time.</p>
                      <p>• Unlinking a parent will remove it from the linked table.</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-start pl-2 sm:pl-4">
                    {linkedParents.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={handleDeactivateAll}
                        disabled={deactivatingAll || linkedParents.every(p => !p.is_active)}
                        className={
                          linkedParents.some(p => p.is_active)
                            ? "!bg-black hover:!bg-gray-800 !text-white !border-black hover:!text-white"
                            : "!text-black hover:!bg-black hover:!text-white !border-black"
                        }
                      >
                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                        {deactivatingAll ? "Deactivating..." : "Deactivate All"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {linkedParents.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-slate-600">No linked parents yet</p>
                <p className="text-sm mt-2 text-slate-500">Link a parent using the form above</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full table-fixed min-w-[560px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-48">Name</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-40">Linked Date</th>
                      <th className="px-2 sm:px-4 pr-4 sm:pr-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-52 min-w-[280px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {linkedParents.map((parent, index) => {
                      // Define alternating row styles with two shades of blue/gray
                      const isEven = index % 2 === 0;
                      const rowStyle = {
                        bgColor: isEven ? 'bg-blue-50' : 'bg-slate-50',
                        hoverColor: isEven ? 'hover:bg-blue-100' : 'hover:bg-slate-100',
                        textColor: isEven ? 'text-blue-900' : 'text-slate-900',
                      };
                      const linkedDate = new Date(parent.linked_at);
                      const formattedDate = linkedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      const formattedTime = linkedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                      
                      return (
                        <tr
                          key={parent.id}
                          className={`${rowStyle.bgColor} ${rowStyle.hoverColor} ${rowStyle.textColor} transition-all duration-300`}
                        >
                          <td className="px-2 sm:px-4 py-3 text-left w-48">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="font-bold text-xs sm:text-sm truncate">
                                  {parent.parent_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-left w-40">
                            <div className="flex items-center text-xs sm:text-sm">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 text-slate-400" />
                              <span className="whitespace-nowrap">{formattedDate} • {formattedTime}</span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 pr-4 sm:pr-6 py-3 text-left w-52 min-w-[280px]">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/user-dashboard?userId=${parent.parent_user_id}`)}
                                className="text-xs px-2 sm:px-3 flex-shrink-0 !bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 hover:!text-white"
                              >
                                <LayoutDashboard className="w-3 h-3 sm:mr-1.5" />
                                <span>Dashboard</span>
                              </Button>
                              {parent.is_active ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  className="text-xs px-2 sm:px-3 flex-shrink-0 bg-black text-white border-black"
                                >
                                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                                  <span className="hidden sm:inline">Activated</span>
                                  <span className="sm:hidden">Activated</span>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleActivateParent(parent.id)}
                                  disabled={activating === parent.id || activating !== null}
                                  className="text-xs px-2 sm:px-3 flex-shrink-0 !text-black hover:!bg-black hover:!text-white !border-black"
                                >
                                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                                  {activating === parent.id ? "Activating..." : "Activate"}
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnlinkParent(parent.id, parent.parent_user_id)}
                                className="text-xs px-2 sm:px-3 flex-shrink-0 !bg-black hover:!bg-gray-800 !text-white !border-black hover:!text-white"
                              >
                                <Unlink className="w-3 h-3 sm:mr-1.5" />
                                <span className="hidden sm:inline">Unlink</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LinkedParents;

