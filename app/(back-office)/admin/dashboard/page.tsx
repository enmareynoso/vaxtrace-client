import {Navbar} from '../../components/Navbar/Navbar';
//import Sidebar from '@/components/Dashboard/Sidebar'
import React, { ReactNode } from 'react'
import { Button } from "@/components/ui/button"
import { CardSummary } from '../../components/CardSummary/CardSummary'
import { BookOpenCheck, UserRound, Waypoints } from 'lucide-react'
import { LastUser } from '../../components/LastUser/LastUser'

const dataCardsSummary = [
  {
    icon: UserRound,
    total: "20/07/2010",
    average: 15,
    title: "User Birthday",
    tooltipText: "G"
  },
  {
    icon: Waypoints,
    total: "14",
    average: 80,
    title: "Age",
    tooltipText: "G"
  },
  {
    icon: BookOpenCheck,
    total: "6",
    average: 30,
    title: "Recommended Vaccines",
    tooltipText: "Recommended Vaccines According to Age"
  },
]

export default function page({children}:{children:ReactNode}) {
  return (
    <div>
      <h2 className='text-2xl mb-4'>Dashboard</h2>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-20">
    {dataCardsSummary.map(({ icon, total, average, title, tooltipText }) => (
          <CardSummary
            key={title}
            icon={icon}
            total={total}
            average={average}
            title={title}
            tooltipText={tooltipText}
          />
        ))}
          </div>
          <div className="grid grid-cols-1 mt-12 xl:grid-cols-2 md:gap-x-10">
        <LastUser/>
      </div>
    
    </div>
  );
}
