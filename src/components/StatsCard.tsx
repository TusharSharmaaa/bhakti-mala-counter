import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Target, Calendar, TrendingUp } from "lucide-react";

interface StatsCardProps {
  totalCount: number;
  streak: number;
  todayCount: number;
}

const StatsCard = ({ totalCount, streak, todayCount }: StatsCardProps) => {
  const totalMalas = Math.floor(totalCount / 108);
  const todayMalas = Math.floor(todayCount / 108);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="shadow-soft border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium truncate">Today's Jap</CardTitle>
          <Target className="h-4 w-4 text-primary flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary truncate">{todayCount}</div>
          <p className="text-xs text-muted-foreground truncate">
            {todayMalas} mala{todayMalas !== 1 ? 's' : ''} completed
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium truncate">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-accent flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent truncate">{streak}</div>
          <p className="text-xs text-muted-foreground truncate">
            consecutive days
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium truncate">Total Malas</CardTitle>
          <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{totalMalas}</div>
          <p className="text-xs text-muted-foreground truncate">
            {totalCount.toLocaleString()} total Jap
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium truncate">Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{((todayCount / 108) * 100).toFixed(0)}%</div>
          <p className="text-xs text-muted-foreground break-words">
            of today's mala goal
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCard;
