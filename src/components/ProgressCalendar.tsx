import { useState, useEffect } from 'react';
import { useCounter } from '@/hooks/useCounter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { DailyProgress, getMonthProgress } from '@/lib/dailyProgress';
import { toast } from 'sonner';

interface ProgressCalendarProps {
  className?: string;
}

const ProgressCalendar = ({ className }: ProgressCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [progressData, setProgressData] = useState<DailyProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const { counter } = useCounter();

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
      // Merge with localStorage if available
      const localKey = `rjc:v1:logs:${year}-${String(month + 1).padStart(2,'0')}`;
      let merged = data;
      try {
        const raw = localStorage.getItem(localKey);
        if (raw) {
          const local = JSON.parse(raw) as { days: { date: string; malas: number; japs?: number }[] };
          const map = new Map<string, DailyProgress>();
          data.forEach(d => map.set(d.date, d));
          local.days.forEach(ld => {
            const existing = map.get(ld.date);
            if (existing) {
              existing.malas_completed = ld.malas;
              existing.jap_count = ld.japs ?? existing.jap_count;
            } else {
              map.set(ld.date, {
                id: ld.date,
                user_id: '',
                date: ld.date,
                jap_count: ld.japs || 0,
                malas_completed: ld.malas,
                created_at: '',
                updated_at: '',
              });
            }
          });
          merged = Array.from(map.values());
        }
      } catch {}
      setProgressData(merged);
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
    // kept for compatibility, but color now derives from malas bands
    const progress = getProgressForDate(day);
    if (!progress) return 'none';
    return progress.jap_count > 0 ? 'some' as any : 'none';
  };

  const getMalasBg = (malas: number) => {
    if (malas <= 0) return '#f3f4f6'; // neutral-100
    if (malas <= 5) return '#fef3c7'; // amber-100
    if (malas <= 10) return '#fde68a'; // amber-200
    if (malas <= 15) return '#fbbf24'; // amber-400
    return '#86efac'; // green-300
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
            
            {/* Calendar grid with malas count */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="h-10" />;
                }
                
                const progressLevel = getDayProgressLevel(day);
                const progress = getProgressForDate(day);
                const today = isToday(day);
                // Override today's cell with live counter to prevent drift
                const isTodayCell = today;
                const liveMalas = Math.floor(counter.today_count / 108);
                const liveJaps = counter.today_count;
                const malas = isTodayCell ? liveMalas : (progress?.malas_completed ?? 0);
                const japs = isTodayCell ? liveJaps : (progress?.jap_count ?? 0);
                
                return (
                  <div
                    key={day}
                    className={`
                      h-16 rounded-md flex flex-col items-center justify-center text-sm font-medium cursor-pointer
                      transition-all duration-200 hover:scale-105
                      ${today ? 'ring-2 ring-primary ring-offset-1' : ''}
                      ${malas === 0 ? 'text-muted-foreground' : 'text-foreground'}
                    `}
                    style={{ backgroundColor: getMalasBg(malas) }}
                    title={
                      (progress || isTodayCell)
                        ? `${day} ${monthNames[month]}: ${japs} japs, ${malas} malas`
                        : `${day} ${monthNames[month]}: No progress`
                    }
                    onClick={() => {
                      if (progress || isTodayCell) {
                        toast(`${day} ${monthNames[month]}`, { description: `${malas} mala${malas===1?'':'s'} • ${japs} japs` });
                      }
                    }}
                  >
                    <div className="text-[10px] opacity-80">{day}</div>
                    <div className="text-base font-semibold leading-none">{malas === 0 ? '—' : malas}</div>
                    <div className="text-[10px] opacity-80">{malas === 0 ? '' : (malas === 1 ? 'mala' : 'malas')}</div>
                  </div>
                );
              })}
            </div>
            
            {/* Month total malas (include today's live) */}
            <div className="mt-4 text-xs text-muted-foreground">
              {(() => {
                const base = progressData.reduce((sum, d) => sum + (d.malas_completed || 0), 0);
                const todayDate = new Date();
                const isSameMonth = todayDate.getMonth() === month && todayDate.getFullYear() === year;
                const todayKey = `${year}-${String(month + 1).padStart(2,'0')}-${String(todayDate.getDate()).padStart(2,'0')}`;
                const recordedToday = progressData.find(d => d.date === todayKey)?.malas_completed || 0;
                const liveToday = Math.floor(counter.today_count / 108);
                const total = isSameMonth ? (base - recordedToday + liveToday) : base;
                return `Total malas this month: ${total}`;
              })()}
            </div>

            {/* Legend (malas ranges) */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f3f4f6' }} />
                  <span>0 malas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fef3c7' }} />
                  <span>1–5 malas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fde68a' }} />
                  <span>6–10 malas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fbbf24' }} />
                  <span>11–15 malas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#86efac' }} />
                  <span>15+ malas</span>
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
