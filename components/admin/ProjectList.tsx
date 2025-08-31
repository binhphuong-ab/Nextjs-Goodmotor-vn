'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Calendar, MapPin, Building, Star } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import Notification from '../Notification'
import ConfirmDialog from '../ConfirmDialog'
import { IProject } from '@/models/Project'

interface ProjectListProps {
  projects: IProject[]
  onEdit: (project: IProject) => void
  onDelete: (projectId: string) => void
}

export default function ProjectList({ projects, onEdit, onDelete }: ProjectListProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    project: IProject | null
  }>({
    isOpen: false,
    project: null
  })

  const formatDate = (date: string | Date) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      completed: 'bg-green-100 text-green-800',
      ongoing: 'bg-blue-100 text-blue-800',
      planned: 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getProjectTypeBadge = (projectType: string) => {
    const typeLabels = {
      'new-installation': 'New Installation',
      'system-upgrade': 'System Upgrade',
      'maintenance-contract': 'Maintenance Contract',
      'emergency-repair': 'Emergency Repair',
      'consultation': 'Consultation',
      'custom-solution': 'Custom Solution'
    }
    
    return typeLabels[projectType as keyof typeof typeLabels] || projectType
  }

  const handleDelete = (project: IProject) => {
    setConfirmDialog({
      isOpen: true,
      project
    })
  }

  const handleConfirmDelete = () => {
    if (confirmDialog.project) {
      onDelete(confirmDialog.project._id)
      setConfirmDialog({ isOpen: false, project: null })
    }
  }

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, project: null })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Project
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type & Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location & Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project._id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    {project.images && project.images.length > 0 ? (
                      <Image
                        className="h-12 w-12 rounded-lg object-cover"
                        src={getImageUrl(project.images[0].url)}
                        alt={project.images[0].alt || project.title}
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {project.title}
                      </div>
                      {project.featured && (
                        <Star className="ml-2 h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <div 
                      className="text-sm text-gray-500 truncate max-w-xs"
                      dangerouslySetInnerHTML={{ 
                        __html: project.description.length > 60 
                          ? project.description.substring(0, 60) + '...' 
                          : project.description 
                      }}
                    />
                  </div>
                </div>
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{project.client}</div>
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 mb-1">
                  {getProjectTypeBadge(project.projectType)}
                </div>
                {getStatusBadge(project.status)}
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-900 mb-1">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  {project.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  {formatDate(project.completionDate)}
                </div>
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(project)}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project)}
                    className="text-red-600 hover:text-red-900 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {projects.length === 0 && (
        <div className="text-center py-8">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first project.</p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${confirmDialog.project?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger={true}
      />
    </div>
  )
} 