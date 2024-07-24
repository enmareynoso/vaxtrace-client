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
    total: "12.450",
    average: 15,
    title: "Companies created",
    tooltipText: "See all of the companies created"
  },
  {
    icon: Waypoints,
    total: "86.5%",
    average: 80,
    title: "Total Revenue",
    tooltipText: "See all of the summary"
  },
  {
    icon: BookOpenCheck,
    total: "363,95€",
    average: 30,
    title: "Bounce Rate",
    tooltipText: "See all of the bounce rate"
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
