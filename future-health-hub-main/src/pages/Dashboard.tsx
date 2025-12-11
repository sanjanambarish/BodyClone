import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  LogOut, 
  User, 
  Pill, 
  Activity, 
  Brain, 
  MessageSquare, 
  Users, 
  FileText,
  Bell,
  Settings,
  Calendar,
  Heart,
  Thermometer,
  Droplets,
  AlertCircle,
  Search,
  History,
  Stethoscope,
  AlertTriangle,
  MoreHorizontal,
  Camera,
  Loader2
} from 'lucide-react';
import bodycloneLogo from '@/assets/bodyclone-logo.jpg';

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; age: number | null; gender: string | null; avatar_url: string | null } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, age, gender, avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setProfile(profileData);

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setUserRole(roleData?.role || null);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

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

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      // Update profile in database
      await supabase
        .from('profiles')
        .update({ avatar_url: urlWithTimestamp })
        .eq('user_id', user.id);

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: urlWithTimestamp } : null);

      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated.',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const medicalCategories = [
    { icon: AlertCircle, title: 'Current Complaint', description: 'Present medical issues', color: 'text-red-400', bgColor: 'bg-red-500/20' },
    { icon: Search, title: 'Previous Investigation', description: 'Test results & diagnostics', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    { icon: History, title: 'Past History', description: 'Medical history records', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
    { icon: Stethoscope, title: 'Ongoing Treatment', description: 'Current medications & plans', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    { icon: AlertTriangle, title: 'Allergies', description: 'Allergy documentation', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
    { icon: MoreHorizontal, title: 'Other', description: 'Additional medical info', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  ];

  const patientFeatures = [
    { icon: Pill, title: 'My Medicines', description: 'View and manage your prescriptions', color: 'text-cyan-400' },
    { icon: Activity, title: 'Health Vitals', description: 'Track temperature, BP, sugar levels', color: 'text-green-400' },
    { icon: Brain, title: 'AI Health Check', description: 'Voice-based health assessment', color: 'text-purple-400' },
    { icon: MessageSquare, title: 'Medical Chatbot', description: '24/7 AI health assistant', color: 'text-blue-400' },
    { icon: Calendar, title: 'Appointments', description: 'Schedule doctor visits', color: 'text-orange-400' },
    { icon: FileText, title: 'Documents', description: 'Medical records & reports', color: 'text-pink-400' },
  ];

  const doctorFeatures = [
    { icon: Users, title: 'My Patients', description: 'View and manage patients', color: 'text-cyan-400' },
    { icon: FileText, title: 'Prescriptions', description: 'Write and manage prescriptions', color: 'text-green-400' },
    { icon: Calendar, title: 'Appointments', description: 'Manage your schedule', color: 'text-purple-400' },
    { icon: Activity, title: 'Patient Vitals', description: 'Monitor patient health', color: 'text-blue-400' },
    { icon: Brain, title: 'AI Validation', description: 'Drug interaction checks', color: 'text-orange-400' },
    { icon: MessageSquare, title: 'Consultations', description: 'Virtual patient support', color: 'text-pink-400' },
  ];

  const features = userRole === 'doctor' ? doctorFeatures : patientFeatures;

  const quickStats = [
    { icon: Pill, label: 'Medicines', value: '0', color: 'bg-cyan-500/20 text-cyan-400' },
    { icon: Heart, label: 'Heart Rate', value: '--', color: 'bg-red-500/20 text-red-400' },
    { icon: Thermometer, label: 'Temperature', value: '--', color: 'bg-orange-500/20 text-orange-400' },
    { icon: Droplets, label: 'Blood Sugar', value: '--', color: 'bg-purple-500/20 text-purple-400' },
  ];

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
            <img src={bodycloneLogo} alt="BodyClone" className="w-10 h-10 rounded-lg border border-primary/30" />
            <span className="font-heading font-bold text-xl gradient-text hidden sm:block">BodyClone</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center">3</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="ml-2">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 relative z-10">
        {/* Patient Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="glass-card rounded-2xl p-6 border border-primary/20">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Photo & Basic Info */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-md overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-primary-foreground" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center cursor-pointer"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-primary" />
                    )}
                  </button>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-heading font-bold gradient-text mb-1">
                    {profile?.full_name || 'User'}
                  </h1>
                  <p className="text-muted-foreground capitalize text-sm mb-2">
                    {userRole || 'Patient'}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-muted-foreground">
                      Age: <span className="text-foreground font-medium">{profile?.age ?? '--'}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-muted-foreground">
                      Gender: <span className="text-foreground font-medium capitalize">{profile?.gender ?? '--'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Medical Information Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-heading font-bold mb-4">Medical Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {medicalCategories.map((category, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="glass-card rounded-xl p-4 border border-primary/10 hover:border-primary/30 transition-all duration-300 group text-center"
              >
                <div className={`w-12 h-12 rounded-xl ${category.bgColor} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1">{category.title}</h3>
                <p className="text-xs text-muted-foreground hidden md:block">{category.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="glass-card rounded-xl p-4 border border-primary/10"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-heading font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card rounded-xl p-6 border border-primary/10 text-left hover:border-primary/30 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 glass-card rounded-xl p-6 border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-bold text-lg">AI Features Coming Soon!</h3>
              <p className="text-muted-foreground text-sm">
                Prescription scanner, health assessments, and personalized wellness tips.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
