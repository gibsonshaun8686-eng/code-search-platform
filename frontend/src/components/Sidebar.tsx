import React from 'react';
import { ChevronRight, Home, Save, Settings, LogOut, Users, BarChart3 } from 'lucide-react';

interface SidebarProps {
  currentOrg?: { slug: string; name: string };
  onNavigate?: (path: string) => void;
}

export default function Sidebar({ currentOrg, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen sticky top-0 overflow-y-auto">
      {/* Org Switcher */}
      <div className="p-4 border-b border-gray-800">
        <button className="w-full flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg">
          <div>
            <div className="text-sm font-semibold">{currentOrg?.name || 'Personal'}</div>
            <div className="text-xs text-gray-400">{currentOrg?.slug || 'personal'}</div>
          </div>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="p-4 space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Main</h3>

        <NavLink
          icon={<Home size={18} />}
          label="Dashboard"
          href="/dashboard"
          onClick={() => onNavigate?.('/dashboard')}
        />
        <NavLink
          icon={<Save size={18} />}
          label="Saved Searches"
          href="/saved-searches"
          onClick={() => onNavigate?.('/saved-searches')}
        />
      </nav>

      {/* Organization */}
      {currentOrg && (
        <nav className="p-4 space-y-2 border-t border-gray-800">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Organization</h3>
          <NavLink
            icon={<Users size={18} />}
            label="Members"
            href={`/org/${currentOrg.slug}/members`}
            onClick={() => onNavigate?.(`/org/${currentOrg.slug}/members`)}
          />
          <NavLink
            icon={<BarChart3 size={18} />}
            label="Analytics"
            href={`/org/${currentOrg.slug}/analytics`}
            onClick={() => onNavigate?.(`/org/${currentOrg.slug}/analytics`)}
          />
          <NavLink
            icon={<Settings size={18} />}
            label="Settings"
            href={`/org/${currentOrg.slug}/settings`}
            onClick={() => onNavigate?.(`/org/${currentOrg.slug}/settings`)}
          />
        </nav>
      )}

      {/* Account */}
      <nav className="p-4 space-y-2 border-t border-gray-800 mt-auto">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Account</h3>
        <NavLink
          icon={<Settings size={18} />}
          label="Settings"
          href="/settings/account"
          onClick={() => onNavigate?.('/settings/account')}
        />
        <NavLink
          icon={<LogOut size={18} />}
          label="Logout"
          href="/auth/logout"
          onClick={() => onNavigate?.('/auth/logout')}
          className="text-red-400 hover:bg-red-900/30"
        />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
        <p>Code Search Platform v0.1.0</p>
      </div>
    </aside>
  );
}

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick?: () => void;
  className?: string;
}

function NavLink({ icon, label, href, onClick, className = '' }: NavLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${className}`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </a>
  );
}
