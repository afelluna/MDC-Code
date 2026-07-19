import { Wifi, Server, Clock, Sun, Moon } from 'lucide-react';

interface FooterBarProps {
  socketConnected: boolean;
  serverIp: string;
  lastUpdateLabel: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function FooterBar({ socketConnected, serverIp, lastUpdateLabel, theme, onToggleTheme }: FooterBarProps) {
  return (
    <div className="footer-bar">
      <div className="footer-item">
        <Wifi size={16} />
        <span>Connection</span>
        <span className={`status-dot ${socketConnected ? 'live' : 'idle'}`} />
        <strong>{socketConnected ? 'Live' : 'Mock'}</strong>
      </div>
      <div className="footer-item">
        <Server size={16} />
        <span>Server</span>
        <span className="status-dot live" />
        <strong className="font-mono">{serverIp}</strong>
      </div>
      <div className="footer-item">
        <Clock size={16} />
        <span>Last Update</span>
        <span className="status-dot live" />
        <strong>{lastUpdateLabel}</strong>
      </div>
      <div className="footer-item footer-item-theme">
        <button
          type="button"
          className={`theme-toggle ${theme}`}
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <Sun size={13} className="theme-toggle-icon sun" />
          <Moon size={13} className="theme-toggle-icon moon" />
          <span className="theme-toggle-thumb" />
        </button>
        <strong>{theme === 'dark' ? 'Dark' : 'Light'} Mode</strong>
      </div>
    </div>
  );
}
