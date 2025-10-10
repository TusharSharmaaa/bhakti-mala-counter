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
          <CardTitle className="text-sm font-medium">Today's Japa</CardTitle>
          <Target className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{todayCount}</div>
          <p className="text-xs text-muted-foreground">
            {todayMalas} mala{todayMalas !== 1 ? 's' : ''} completed
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{streak}</div>
          <p className="text-xs text-muted-foreground">
            consecutive days
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Malas</CardTitle>
          <Calendar className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMalas}</div>
          <p className="text-xs text-muted-foreground">
            {totalCount.toLocaleString()} total japa
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{((todayCount / 108) * 100).toFixed(0)}%</div>
          <p className="text-xs text-muted-foreground">
            of today's mala goal
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCard;
