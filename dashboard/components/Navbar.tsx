
import React from 'react';

// --- SVG Icons ---
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955M3 10.5v8.25a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75v-4.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v4.5a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V10.5M4.5 12.45v8.25" /></svg>;
const ThermometerIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 3.5c0-1.105.895-2 2-2s2 .895 2 2v9.277a4.5 4.5 0 11-4 0V3.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5v-2" /></svg>;
const CloudIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21.25a8.25 8.25 0 01-6.23-13.434 5.25 5.25 0 0110.435 2.126 5.25 5.25 0 013.795 4.068A8.25 8.25 0 0112 21.25z" /></svg>;
const LeafIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.13 5.423a6.75 6.75 0 0110.154 5.293c.045.438-.11.87-.417 1.177l-4.75 4.75a.75.75 0 01-1.06 0l-4.75-4.75a.75.75 0 010-1.06l4.75-4.75a.75.75 0 01.073-.083zM12 21.75a9.75 9.75 0 01-9.75-9.75c0-3.35 1.69-6.323 4.29-8.127" /></svg>;
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707-.707M6.343 17.657l-.707-.707m12.728 0l-.707.707M6.343 6.343l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z" /></svg>;
const WindIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 4.5h16.5M3.75 6h16.5M3.75 18h16.5" /></svg>;
const SignOutIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>;

// New Icons for Advanced Modules
const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 21v-7.875zM12.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v12.375c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0112.75 21V8.625zM21 4.125C21 3.504 21.504 3 22.125 3h.25c.621 0 1.125.504 1.125 1.125v16.75c0 .621-.504 1.125-1.125 1.125h-.25A1.125 1.125 0 0121 21V4.125z" /></svg>;
const BellIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;

// New Icons for System Management
const DocumentTextIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
// --- End SVG Icons ---

const navItems = [
    { href: '#/', label: 'Dashboard', icon: HomeIcon },
    { type: 'divider' },
    { href: '#/environment', label: 'Environment', icon: ThermometerIcon },
    { href: '#/particulates', label: 'Particulates', icon: CloudIcon },
    { href: '#/air-quality', label: 'Air Quality', icon: LeafIcon },
    { href: '#/uv-radiation', label: 'UV Radiation', icon: SunIcon },
    { href: '#/wind', label: 'Wind', icon: WindIcon },
    { type: 'divider' },
    { href: '#/forecasting', label: 'Forecasting', icon: ChartBarIcon },
    { href: '#/alerts', label: 'Alerts', icon: BellIcon },
    { type: 'divider' },
    { href: '#/reports', label: 'Reports & Export', icon: DocumentTextIcon },
];

const NavLink: React.FC<{item: typeof navItems[0]; isActive: boolean}> = ({ item, isActive }) => {
    if (item.type === 'divider') {
        return <hr className="border-t border-gray-200 dark:border-white/10 my-2 group-hover:mx-3 transition-all duration-300"/>
    }
    
    const Icon = item.icon;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.location.hash = item.href;
    };

    return (
        <li className="relative">
            <a 
              href={item.href}
              onClick={handleClick}
              className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 group-hover:pl-4 ${isActive ? 'bg-blue-600/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-gray-200'}`}
              aria-label={item.label}
              >
                <Icon className="h-6 w-6 flex-shrink-0" />
                <span className="ml-4 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{item.label}</span>
            </a>
            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-600 dark:bg-cyan-400 rounded-r-full"></div>}
        </li>
    );
};

interface NavbarProps {
    currentRoute: string;
    onExpandChange: (isExpanded: boolean) => void;
    onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onExpandChange, onLogout }) => {
    return (
        <nav 
            className="fixed top-0 left-0 h-full bg-white/60 dark:bg-black/30 backdrop-blur-lg border-r border-gray-200 dark:border-white/10 z-20 flex flex-col items-center py-4 group w-20 md:w-24 hover:w-64 transition-all duration-300 ease-in-out"
            onMouseEnter={() => onExpandChange(true)}
            onMouseLeave={() => onExpandChange(false)}
        >
             <div className="flex-shrink-0 mb-8 mt-2">
                <a href="#/" aria-label="Dashboard Home">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                </a>
            </div>
            <ul className="flex flex-col w-full px-3 overflow-y-auto overflow-x-hidden flex-grow">
                {navItems.map((item, index) => (
                    <NavLink key={item.href || `divider-${index}`} item={item} isActive={item.href === currentRoute} />
                ))}
            </ul>
            <div className="w-full px-3 flex-shrink-0">
                <button
                    onClick={onLogout}
                    className="flex items-center p-3 my-1 rounded-lg transition-colors duration-200 w-full group-hover:pl-4 text-gray-500 dark:text-gray-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-300"
                    aria-label="Sign Out"
                >
                    <SignOutIcon className="h-6 w-6 flex-shrink-0" />
                    <span className="ml-4 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">Sign Out</span>
                </button>
            </div>
        </nav>
    );
};
