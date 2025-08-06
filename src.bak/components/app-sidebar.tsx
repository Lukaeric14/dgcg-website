import * as React from "react"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  StickyNote,
  UsersIcon,
} from "lucide-react"

import { NavDocuments } from "./nav-documents"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import { useAuth } from "../contexts/AuthContext"
import { getUserProfile } from "../lib/supabase"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Articles",
      url: "/admin/articles",
      icon: FileTextIcon,
    },
    {
      title: "Newsletter",
      url: "/admin/newsletter",
      icon: DatabaseIcon,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChartIcon,
    },
    {
      title: "Subscribers",
      url: "/admin/subscribers",
      icon: UsersIcon,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: FileCodeIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: "Notes",
      url: "/admin/notes",
      icon: StickyNote,
    },
    {
      name: "Reports",
      url: "#",
      icon: ClipboardListIcon,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: FileIcon,
    },
  ],
}

export function AppSidebar({ 
  onSettingsClick,
  onAccountClick,
  onBillingClick,
  onNotificationsClick,
  onLogoutClick,
  ...props 
}: React.ComponentProps<typeof Sidebar> & {
  onSettingsClick?: () => void
  onAccountClick?: () => void
  onBillingClick?: () => void
  onNotificationsClick?: () => void
  onLogoutClick?: () => void
}) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const profile = await getUserProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const userData = {
    name: userProfile?.full_name || user?.user_metadata?.first_name + ' ' + user?.user_metadata?.last_name || user?.email || 'User',
    email: user?.email || '',
    avatar: userProfile?.avatar_url || user?.user_metadata?.avatar_url || '',
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/admin">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">DGCG Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary 
          items={data.navSecondary} 
          className="mt-auto"
          onSettingsClick={onSettingsClick}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser 
          user={userData} 
          onAccountClick={onAccountClick}
          onBillingClick={onBillingClick}
          onNotificationsClick={onNotificationsClick}
          onLogoutClick={onLogoutClick}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
