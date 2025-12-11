import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Camera,
  Save,
  Loader2,
  Upload,
  Trash2,
  ImagePlus
} from 'lucide-react';
import bodycloneLogo from '@/assets/bodyclone-logo.jpg';

interface ProfileData {
  full_name: string | null;
  age: number | null;
  gender: string | null;
  phone_number: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Editable fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoading(true);
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (profileData) {
            setProfile(profileData);
            setFullName(profileData.full_name || '');
            setAge(profileData.age?.toString() || '');
            setGender((profileData.gender as 'male' | 'female' | 'other') || 'male');
            setPhoneNumber(profileData.phone_number || '');
            setAvatarUrl(profileData.avatar_url);
          }

          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
          
          setUserRole(roleData?.role || null);
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          age: age ? parseInt(age) : null,
          gender,
          phone_number: phoneNumber || null,
          avatar_url: avatarUrl,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache-busting parameter
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(urlWithTimestamp);

      toast({
        title: 'Avatar uploaded',
        description: 'Click "Save Changes" to update your profile.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload avatar.',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    
    setUploadingAvatar(true);
    try {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.jpeg`, `${user.id}/avatar.webp`]);

      // Update profile to remove avatar_url
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(null);
      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);

      toast({
        title: 'Avatar removed',
        description: 'Your profile picture has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove avatar.',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for the password reset link.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send password reset email.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-nav border-b border-primary/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={bodycloneLogo} alt="BodyClone" className="w-10 h-10 rounded-lg border border-primary/30" />
            <span className="font-heading font-bold text-xl gradient-text hidden sm:block">Profile</span>
          </div>

          <Button 
            variant="hero" 
            size="sm" 
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 relative z-10 max-w-2xl">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border border-primary/20 mb-6"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group mb-4">
              <div className="w-28 h-28 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-md overflow-hidden">
                {avatarUrl || profile?.avatar_url ? (
                  <img src={avatarUrl || profile?.avatar_url || ''} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-14 h-14 text-primary-foreground" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-background/80 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
            </div>
            
            {/* Avatar Action Buttons */}
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="border-primary/20 hover:border-primary/40"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                {avatarUrl || profile?.avatar_url ? 'Change' : 'Upload'}
              </Button>
              {(avatarUrl || profile?.avatar_url) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>

            <h2 className="text-xl font-heading font-bold gradient-text">
              {profile?.full_name || 'User'}
            </h2>
            <p className="text-muted-foreground capitalize text-sm">
              {userRole || 'Patient'}
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-background/50 border-primary/20 focus:border-primary"
              />
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                value={user.email || ''}
                disabled
                className="bg-background/30 border-primary/10 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+919999999999"
                className="bg-background/50 border-primary/20 focus:border-primary"
              />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Age
              </Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                min="1"
                max="150"
                className="bg-background/50 border-primary/20 focus:border-primary"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Gender
              </Label>
              <div className="flex gap-3">
                {(['male', 'female', 'other'] as const).map((g) => (
                  <Button
                    key={g}
                    type="button"
                    variant={gender === g ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGender(g)}
                    className={`flex-1 capitalize ${
                      gender === g 
                        ? 'bg-primary text-primary-foreground' 
                        : 'border-primary/20 hover:border-primary/40'
                    }`}
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>

            {/* Role (Read Only) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Role
              </Label>
              <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm capitalize">
                {userRole || 'Patient'}
              </div>
              <p className="text-xs text-muted-foreground">Contact support to change your role</p>
            </div>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 border border-primary/20"
        >
          <h3 className="font-heading font-bold text-lg mb-4">Account</h3>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start border-primary/20 hover:border-primary/40"
              onClick={handlePasswordReset}
            >
              Reset Password
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/40"
            >
              Delete Account
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
