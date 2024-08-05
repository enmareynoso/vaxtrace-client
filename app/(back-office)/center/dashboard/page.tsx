import React from "react";
import { BookOpenCheck, UserRound, Waypoints } from "lucide-react";
import { CardSummary } from "@/components/dashboard/CardSummary";
import { LastUser } from "@/components/dashboard/LastUser";

const dataCardsSummary = [
  {
    icon: UserRound,
    total: "15",
    average: 12,
    title: "User Birthday",
    tooltipText: "G",
  },
  {
    icon: Waypoints,
    total: "20",
    average: 70,
    title: "Age",
    tooltipText: "G",
  },
  {
    icon: BookOpenCheck,
    total: "5",
    average: 25,
    title: "Recommended Vaccines",
    tooltipText: "Recommended Vaccines According to Age",
  },
];

const CenterDashboardPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl mb-4">Vaccination Center Dashboard</h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-20">
        {dataCardsSummary.map(
          ({ icon: Icon, total, average, title, tooltipText }) => (
            <CardSummary
              key={title}
              icon={Icon}
              total={total}
              average={average}
              title={title}
              tooltipText={tooltipText}
            />
          )
        )}
      </div>
      <div className="grid grid-cols-1 mt-12 xl:grid-cols-2 md:gap-x-10">
        <LastUser />
      </div>
    </div>
  );
};

export default CenterDashboardPage;
