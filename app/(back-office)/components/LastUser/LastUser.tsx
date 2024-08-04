import { CustomIcon } from '@/components/Customicon'
import { Building } from 'lucide-react'
import React from 'react'

export function LastUser() {
  return (
    <div className="p-5 rounded-lg shadow-sm bg-background">
            <div className="flex items-center gap-x-2">
                <CustomIcon icon={Building} />
                <p className="text-xl">ALL USERS</p>
            </div>
            <div>
                <p>Table</p>
            </div>
        </div>
  )
}
