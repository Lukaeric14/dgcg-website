import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import ArticlesManager from '../articles/ArticlesManager';
import SubscribersManager from '../subscribers/SubscribersManager';
import NewsletterManager from '../newsletters/NewsletterManager';
import NotesManager from '../notes/NotesManager';
import { AccountDialog } from '../../shared/AccountDialog';
import { activityLogger, Activity } from '../../../lib/activityLogger';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "../../ui/sidebar";
import { AppSidebar } from '../../shared/app-sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../ui/breadcrumb';
import { Separator } from '../../ui/separator';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { 
  FileText, 
  Users, 
  BarChart3, 
  PlusCircle,
  Mail,
  TrendingUp
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  // Account dialog state
  const [accountDialogOpen, setAccountDialogOpen] = React.useState(false);
  const [accountDialogTab, setAccountDialogTab] = React.useState("profile");
  
  // Determine current section based on URL
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path.includes('/articles')) return 'articles';
    if (path.includes('/newsletter')) return 'newsletter';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/subscribers')) return 'subscribers';
    if (path.includes('/notes')) return 'notes';
    return 'dashboard';
  };

  const currentSection = getCurrentSection();
  
  // Check if user is admin by fetching their profile from the database
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = React.useState(true);
  const [stats, setStats] = React.useState({
    articles: 0,
    newsletters: 0,
    subscribers: 0,
    totalSent: 0
  });
  const [activities, setActivities] = React.useState<Activity[]>([]);

  // Handle dialog opens
  const handleSettingsClick = () => {
    setAccountDialogTab("settings");
    setAccountDialogOpen(true);
  };

  const handleAccountClick = () => {
    setAccountDialogTab("profile");
    setAccountDialogOpen(true);
  };

  const handleBillingClick = () => {
    setAccountDialogTab("billing");
    setAccountDialogOpen(true);
  };

  const handleNotificationsClick = () => {
    setAccountDialogTab("notifications");
    setAccountDialogOpen(true);
  };

  const handleLogoutClick = async () => {
    await signOut();
  };

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsCheckingPermissions(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('users_profiles')
          .select('type')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(profile?.type === 'admin');
        }
      } catch (error) {
        console.error('Error in checkAdminStatus:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingPermissions(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;

      try {
        // Fetch articles count
        const { count: articlesCount } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true });

        // Fetch newsletters count
        const { count: newslettersCount } = await supabase
          .from('newsletters')
          .select('*', { count: 'exact', head: true });

        // Fetch subscribers count (free_user and paid_user with newsletter_subscribed = true)
        const { count: subscribersCount } = await supabase
          .from('users_profiles')
          .select('*', { count: 'exact', head: true })
          .in('type', ['free_user', 'paid_user'])
          .eq('newsletter_subscribed', true);

        // Fetch total emails sent
        const { count: totalSentCount } = await supabase
          .from('newsletter_sends')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'sent');
        
        setStats({
          articles: articlesCount || 0,
          newsletters: newslettersCount || 0,
          subscribers: subscribersCount || 0,
          totalSent: totalSentCount || 0
        });

        // Fetch recent activities
        const recentActivities = await activityLogger.getRecentActivities(5);
        setActivities(recentActivities);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [isAdmin]);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while checking permissions
  if (isCheckingPermissions) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-content">
          <h1>Checking Permissions...</h1>
          <p>Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="admin-permission-denied">
        <div className="permission-denied-content">
          <h1>Access Denied</h1>
          <p>You don't have permissions to visit this screen.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        onSettingsClick={handleSettingsClick}
        onAccountClick={handleAccountClick}
        onBillingClick={handleBillingClick}
        onNotificationsClick={handleNotificationsClick}
        onLogoutClick={handleLogoutClick}
      />
      <SidebarInset>
        <header className="admin-header">
          <div className="admin-header-content">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/admin">Admin</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {currentSection === 'dashboard' ? 'Dashboard' : 
                     currentSection === 'articles' ? 'Articles' :
                     currentSection === 'newsletter' ? 'Newsletter' :
                     currentSection === 'analytics' ? 'Analytics' :
                     currentSection === 'subscribers' ? 'Subscribers' : 'Dashboard'}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="admin-header-user">
            <span className="admin-welcome">Welcome back, {(() => {
              const name = user.email?.split('@')[0];
              return name ? name.charAt(0).toUpperCase() + name.slice(1) : 'User';
            })()}</span>
          </div>
        </header>
        
        <div className="admin-content">
          {currentSection === 'articles' ? (
            <ArticlesManager />
          ) : currentSection === 'subscribers' ? (
            <SubscribersManager />
          ) : currentSection === 'newsletter' ? (
            <NewsletterManager />
          ) : currentSection === 'notes' ? (
            <NotesManager />
          ) : (
            <>
              <div className="admin-content-header">
                <h1 className="admin-page-title">Dashboard</h1>
                <p className="admin-page-description">
                  Overview of your content management system
                </p>
              </div>

          {/* Stats Cards */}
          <div className="admin-stats-grid">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.articles}</div>
                <p className="text-xs text-muted-foreground">
                  Published articles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.subscribers}</div>
                <p className="text-xs text-muted-foreground">
                  Active newsletter subscribers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Newsletters</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newsletters}</div>
                <p className="text-xs text-muted-foreground">
                  Created newsletters
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSent}</div>
                <p className="text-xs text-muted-foreground">
                  Total newsletter emails delivered
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="admin-quick-actions">
            <h2 className="admin-section-title">Quick Actions</h2>
            <div className="admin-actions-grid">
              <Card className="admin-action-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    Create New Article
                  </CardTitle>
                  <CardDescription>
                    Start writing a new blog post or article
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link to="/admin/articles">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="admin-action-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Send Newsletter
                  </CardTitle>
                  <CardDescription>
                    Create and send newsletter to subscribers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/admin/newsletter">Compose</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="admin-action-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    View Analytics
                  </CardTitle>
                  <CardDescription>
                    Check website performance and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/admin/analytics">View Reports</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="admin-recent-activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your content management system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="admin-activity-list">
                  {activities.length === 0 ? (
                    <div className="admin-activity-empty">
                      <p>No recent activities to display.</p>
                      <p className="text-sm text-muted-foreground">
                        Activities will appear here as users interact with your system.
                      </p>
                    </div>
                  ) : (
                    activities.map((activity) => {
                      const formatted = activityLogger.formatActivityForDisplay(activity);
                      return (
                        <div key={activity.id} className="admin-activity-item">
                          <div className="admin-activity-icon">
                            <span className="activity-emoji">{formatted.icon}</span>
                          </div>
                          <div className="admin-activity-content">
                            <p className="admin-activity-title">{formatted.title}</p>
                            <p className="admin-activity-description">
                              {formatted.description}
                            </p>
                            <p className="admin-activity-time">{formatted.timeAgo}</p>
                          </div>
                          <Badge 
                            variant={activity.type.includes('error') ? 'destructive' : 
                                   activity.type.includes('delete') ? 'destructive' :
                                   activity.type.includes('publish') || activity.type.includes('sent') ? 'default' : 'secondary'}
                          >
                            {activity.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
            </>
          )}
        </div>
      </SidebarInset>
      
      {/* Account Dialog */}
      <AccountDialog 
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        initialTab={accountDialogTab}
      />
    </SidebarProvider>
  );
};

export default AdminDashboard;
