'use client'

import { useState, useCallback, useEffect } from 'react'
import Notification from './Notification'

export interface NotificationData {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

interface NotificationContainerProps {
  onNotificationAdd?: (showNotification: (notification: Omit<NotificationData, 'id'>) => void) => void
}

export default function NotificationContainer({ onNotificationAdd }: NotificationContainerProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  const addNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification: NotificationData = {
      ...notification,
      id
    }
    
    setNotifications(prev => [...prev, newNotification])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  // Expose addNotification function to parent component
  useEffect(() => {
    if (onNotificationAdd) {
      onNotificationAdd(addNotification)
    }
  }, [onNotificationAdd, addNotification])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ 
            transform: `translateY(${index * 80}px)` 
          }}
          className="transition-transform duration-300"
        >
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
            duration={notification.duration}
          />
        </div>
      ))}
    </div>
  )
} 