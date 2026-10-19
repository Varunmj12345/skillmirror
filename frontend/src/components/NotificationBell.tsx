import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { alertService, SmartAlert } from '../services/alertService';

interface NotificationBellProps {
  placement?: 'sidebar' | 'bottom-up' | 'top-down' | 'auto';
}

const NotificationBell: React.FC<NotificationBellProps> = ({ placement = 'sidebar' }) => {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const loadAlerts = async () => {
    try {
      const res: any = await alertService.getAlerts();
      const alertList = Array.isArray(res) ? res : (res?.data || []);
      setAlerts(alertList);
      setUnreadCount(alertList.filter((a: SmartAlert) => !a.is_read).length);
    } catch (err) {
      console.error('Failed to load alerts', err);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleMarkAllRead = async () => {
    try {
      await alertService.markAllRead();
      loadAlerts();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'skill_gap': return 'fa-chart-pie text-amber-400';
      case 'roadmap': return 'fa-route text-amber-400';
      case 'interview': return 'fa-microphone text-amber-400';
      case 'readiness': return 'fa-check text-amber-400';
      case 'market': return 'fa-briefcase text-zinc-300';
      case 'predictive_risk': return 'fa-triangle-exclamation text-amber-500';
      case 'opportunity': return 'fa-bolt text-amber-400';
      case 'behavioral': return 'fa-user-gear text-zinc-400';
      case 'regression': return 'fa-chart-line-down text-rose-400';
      case 'achievement': return 'fa-trophy text-amber-400';
      default: return 'fa-bell text-zinc-400';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-1.5 py-0.2 border border-rose-500/40 bg-rose-500/10 text-rose-400 text-[8px] font-mono font-bold uppercase">[ CRITICAL ]</span>;
      case 'medium':
        return <span className="px-1.5 py-0.2 border border-amber-400/40 bg-amber-400/10 text-amber-400 text-[8px] font-mono font-bold uppercase">[ HIGH ]</span>;
      default:
        return <span className="px-1.5 py-0.2 border border-zinc-800 bg-zinc-950 text-zinc-400 text-[8px] font-mono font-bold uppercase">[ NOTICE ]</span>;
    }
  };

  const positionClasses = placement === 'top-down'
    ? 'top-full mt-2 right-0 w-80 max-w-[calc(100vw-2rem)]'
    : placement === 'sidebar'
    ? 'bottom-0 left-full ml-4 w-80 sm:w-96'
    : 'bottom-full mb-2 left-0 sm:left-auto sm:right-0 w-80 sm:w-96';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        title="Notifications"
        className={`w-7 h-7 bg-zinc-950 border transition-all flex items-center justify-center relative ${
          isOpen
            ? 'border-amber-400 text-amber-400'
            : 'border-zinc-800 hover:border-amber-400/60 text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <i className="fa-solid fa-bell text-xs" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] bg-amber-400 text-zinc-950 text-[9px] font-mono font-black flex items-center justify-center border border-zinc-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute ${positionClasses} w-80 sm:w-96 max-h-[500px] bg-zinc-950 border border-zinc-800 shadow-[0_16px_40px_rgba(0,0,0,0.9)] z-[100] flex flex-col overflow-hidden`}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/90 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400" />
              <div>
                <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider">
                  SIGNALS & ALERTS
                </h3>
                <p className="text-[9px] font-mono text-zinc-500 uppercase">Autonomous Early Warning</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[9px] font-mono font-bold text-zinc-400 hover:text-amber-400 uppercase tracking-wider transition-colors"
                >
                  [ Mark All ]
                </button>
              )}
              <span
                onClick={() => {
                  setIsOpen(false);
                  router.push('/smart-alerts');
                }}
                className="text-[10px] font-mono font-bold text-amber-400 hover:underline uppercase tracking-wider cursor-pointer"
              >
                [ All ]
              </span>
            </div>
          </div>

          {/* Alert Stream */}
          <div className="overflow-y-auto max-h-80 sm-scrollbar divide-y divide-zinc-850">
            {(alerts?.length || 0) === 0 ? (
              <div className="p-8 text-center space-y-2">
                <i className="fa-solid fa-shield-check text-zinc-700 text-2xl" />
                <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Zero Active Anomalies</p>
                <p className="text-[10px] font-mono text-zinc-600">All skill benchmarks and signals nominal.</p>
              </div>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 transition-colors ${
                    !alert.is_read ? 'bg-amber-400/[0.04]' : 'hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 w-6 h-6 border border-zinc-800 bg-zinc-900 flex items-center justify-center text-[10px] flex-shrink-0">
                      <i className={`fa-solid ${getAlertIcon(alert.alert_type)}`} />
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        {getPriorityBadge(alert.priority)}
                        <span className="text-[9px] font-mono text-zinc-500 truncate">
                          {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'REALTIME'}
                        </span>
                      </div>

                      <p className={`text-[11px] font-mono leading-relaxed ${
                        !alert.is_read ? 'text-zinc-100 font-bold' : 'text-zinc-400'
                      }`}>
                        {alert.message}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">
                          {alert.impact_score > 0 ? `Impact: ${alert.impact_score}%` : 'Vector Logged'}
                        </span>
                        <div className="flex gap-2">
                          {!alert.is_read && (
                            <button
                              onClick={() => alertService.markAsRead(alert.id).then(loadAlerts)}
                              className="text-[9px] font-mono font-bold text-amber-400 hover:underline uppercase"
                            >
                              [Read]
                            </button>
                          )}
                          <button
                            onClick={() => alertService.dismiss(alert.id).then(loadAlerts)}
                            className="text-[9px] font-mono font-bold text-zinc-500 hover:text-rose-400 uppercase"
                          >
                            [Dismiss]
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-2.5 border-t border-zinc-800 bg-zinc-900/90 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/smart-alerts');
              }}
              className="w-full py-2 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider transition-all"
            >
              LAUNCH SIGNALS COMMAND CENTER &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
