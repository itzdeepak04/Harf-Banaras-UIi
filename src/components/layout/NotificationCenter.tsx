import React, { useEffect, useState } from 'react';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import { connectNotificationSocket } from '../../socket/notification.socket';
import { RealtimeNotification } from '../../socket/notification.types';

export const NotificationCenter: React.FC = () => {
  const token = useAppSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      return;
    }

    const socket = connectNotificationSocket(token, (notification) => {
      setNotifications((current) => [notification, ...current].slice(0, 12));
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const unreadCount = notifications.length;

  const openNotification = (notification: RealtimeNotification) => {
    setNotifications((current) => current.filter((item) => item.id !== notification.id));
    setOpen(false);
    navigate(notification.route);
  };

  if (!token) return null;

  return (
    <div className="notification-center">
      <button
        type="button"
        className="notification-center__trigger"
        aria-label="Open notifications"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <BellOutlined aria-hidden="true" />
        {unreadCount > 0 && <b>{unreadCount > 9 ? '9+' : unreadCount}</b>}
      </button>
      {open && (
        <div className="notification-center__panel">
          <div className="notification-center__header">
            <strong>Notifications</strong>
            {unreadCount > 0 && <button type="button" onClick={() => setNotifications([])}>Clear all</button>}
          </div>
          {notifications.length === 0 ? (
            <p className="notification-center__empty">You are all caught up.</p>
          ) : (
            notifications.map((notification) => (
              <button
                type="button"
                className="notification-center__item"
                key={notification.id}
                onClick={() => openNotification(notification)}
              >
                <span className="notification-center__item-dot" />
                <span><strong>{notification.title}</strong><small>{notification.message}</small><em>{new Date(notification.createdAt).toLocaleTimeString()}</em></span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
