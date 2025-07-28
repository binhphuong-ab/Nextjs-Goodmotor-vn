'use client'

import { useEffect, useState } from 'react'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface NotificationProps {
  type: 'success' | 'error' | 'info'
  message: string
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

export default function Notification({ 
  type, 
  message, 
  onClose, 
  autoClose = true, 
  duration = 3000 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for fade out animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-400" />
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" />
      default:
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-green-50 border-green-200'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-green-800'
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`max-w-md w-full min-w-80 ${getBackgroundColor()} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className={`text-sm font-medium ${getTextColor()} break-words`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
              className={`inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600 rounded-md`}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 