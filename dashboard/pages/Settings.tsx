import React, { useState } from 'react';

const CogIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.008 1.11-1.212l.558-.201c.54-.195 1.14-.195 1.68 0l.558.201c.55.195 1.02.67 1.11 1.212l.09.542c.03.187.03.376 0 .564l-.09.542a1.325 1.325 0 01-1.11 1.212l-.558.201a1.98 1.98 0 01-1.68 0l-.558-.201a1.325 1.325 0 01-1.11-1.212l-.09-.542a1.47 1.47 0 010-.564z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75a2.25 2.25 0 00-2.25-2.25h-3a2.25 2.25 0 00-2.25 2.25m6 0v2.25a2.25 2.25 0 01-2.25 2.25h-3a2.25 2.25 0 01-2.25-2.25V15.75m6 0h2.25a2.25 2.25 0 002.25-2.25V9.75A2.25 2.25 0 0015.75 7.5h-3a2.25 2.25 0 00-2.25 2.25v3.75m0 0h-2.25a2.25 2.25 0 01-2.25-2.25V9.75A2.25 2.25 0 017.5 7.5h3a2.25 2.25 0 012.25 2.25v3.75" /></svg>;
const UserIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const PencilIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;


const FormRow: React.FC<{label: string, description: string, children: React.ReactNode}> = ({label, description, children}) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-white/10 last:border-b-0">
        <div className="md:col-span-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-200">{label}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
        <div className="md:col-span-2 flex items-center">{children}</div>
    </div>
)

const Toggle: React.FC<{ isOn: boolean; onToggle: () => void; }> = ({ isOn, onToggle }) => {
    return (
        <button onClick={onToggle} className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-[#050816] ${isOn ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    )
}

const selectStyles = "bg-gray-200 dark:bg-gray-700/50 border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 dark:text-white w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors";
const inputStyles = "bg-gray-200 dark:bg-gray-700/50 border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 dark:text-white w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors";

interface SettingsPageProps {
  displayName: string;
  setDisplayName: (name: string) => void;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ displayName, setDisplayName, avatarUrl, setAvatarUrl, theme, setTheme }) => {
    const [saveState, setSaveState] = useState('Save Changes');

    const handleAvatarChange = () => {
        // Add timestamp to bypass caching and get a new random image
        setAvatarUrl(`https://picsum.photos/200?t=${Date.now()}`);
    };

    const handleThemeToggle = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleSave = () => {
        setSaveState('Saving...');
        setTimeout(() => {
            setSaveState('Saved!');
            setTimeout(() => {
                setSaveState('Save Changes');
            }, 2000);
        }, 1500);
    };

  return (
    <div className="space-y-8">
        {/* User Profile Section */}
        <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10">
            <div className="flex items-center mb-6">
                <div className="text-blue-600 dark:text-cyan-400 mr-4"><UserIcon /></div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200">User Profile</h3>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
                 <div className="relative group flex-shrink-0">
                    <img src={avatarUrl} alt="User Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-white/10 shadow-lg"/>
                    <button 
                        onClick={handleAvatarChange}
                        className="absolute inset-0 w-full h-full bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-label="Change avatar"
                    >
                        <PencilIcon />
                    </button>
                </div>
                <div className="w-full">
                    <FormRow label="Display Name" description="This name will be displayed across the application.">
                         <input 
                            type="text" 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className={inputStyles}
                        />
                    </FormRow>
                </div>
            </div>
        </div>

        {/* System Configuration Section */}
        <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10">
            <div className="flex items-center mb-6">
                <div className="text-blue-600 dark:text-cyan-400 mr-4"><CogIcon /></div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200">System Configuration</h3>
            </div>
            <div>
                <FormRow label="UI Refresh Rate" description="How often the dashboard UI updates with new data.">
                    <select className={selectStyles} defaultValue="3000">
                        <option value="1000">1 second</option>
                        <option value="3000">3 seconds</option>
                        <option value="5000">5 seconds</option>
                        <option value="10000">10 seconds</option>
                    </select>
                </FormRow>

                <FormRow label="Dark Mode" description="Enable or disable the dark theme for the interface.">
                    <Toggle isOn={theme === 'dark'} onToggle={handleThemeToggle} />
                </FormRow>

                <FormRow label="Email Notifications" description="Receive email alerts for critical air quality events.">
                    <Toggle isOn={false} onToggle={() => {}} />
                </FormRow>

                <FormRow label="Notification Threshold (PM2.5)" description="Set the PM2.5 level (µg/m³) to trigger a notification.">
                    <input type="number" defaultValue="35" className={inputStyles} />
                </FormRow>
            </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end">
            <button 
                onClick={handleSave}
                className="px-6 py-2 w-40 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:scale-105 transition-all duration-200 shadow-lg shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-[#050816]"
            >
                {saveState}
            </button>
        </div>
    </div>
  );
};