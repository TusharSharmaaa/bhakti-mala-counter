import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { DailyProgress, getMonthProgress, getProgressLevel, getProgressColor } from '@/lib/dailyProgress';

interface ProgressCalendarProps {
  className?: string;
}

const ProgressCalendar = ({ className }: ProgressCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [progressData, setProgressData] = useState<DailyProgress[]>([]);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Load progress data when month changes
  useEffect(() => {
    loadMonthProgress();
  }, [year, month]);

  const loadMonthProgress = async () => {
    setLoading(true);
    try {
      const data = await getMonthProgress(year, month);
      setProgressData(data);
    } catch (error) {
      console.error('Error loading month progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getProgressForDate = (day: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return progressData.find(progress => progress.date === dateString);
  };

  const getDayProgressLevel = (day: number) => {
    const progress = getProgressForDate(day);
    if (!progress) return 'none';
    return getProgressLevel(progress.jap_count);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);

  return (
    <Card className={`shadow-soft border-border/50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Daily Progress Calendar
        </CardTitle>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            disabled={loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {monthNames[month]} {year}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            disabled={loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading calendar...</p>
          </div>
        ) : (
          <>
            {/* Day names header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="h-10" />;
                }
                
                const progressLevel = getDayProgressLevel(day);
                const progress = getProgressForDate(day);
                const today = isToday(day);
                
                return (
                  <div
                    key={day}
                    className={`
                      h-10 rounded-md flex items-center justify-center text-sm font-medium cursor-pointer
                      transition-all duration-200 hover:scale-105
                      ${getProgressColor(progressLevel)}
                      ${today ? 'ring-2 ring-primary ring-offset-1' : ''}
                      ${progressLevel === 'none' ? 'text-muted-foreground' : 'text-foreground'}
                    `}
                    title={
                      progress
                        ? `${day} ${monthNames[month]}: ${progress.jap_count} japs, ${progress.malas_completed} malas`
                        : `${day} ${monthNames[month]}: No progress`
                    }
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800" />
                  <span>No progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-200 dark:bg-red-900" />
                  <span>1-26 japs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-200 dark:bg-yellow-900" />
                  <span>27-53 japs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-900" />
                  <span>54-107 japs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-900" />
                  <span>108+ japs</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressCalendar;
