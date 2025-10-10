import { useState, useEffect } from 'react';
import { loadCounter, saveCounter, resetCounter as resetCounterStorage, CounterData } from '@/lib/storage';

export function useCounter() {
  const [counter, setCounter] = useState<CounterData>({
    count: 0,
    today_count: 0,
    last_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);

  // Load counter from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      const data = await loadCounter();
      
      // Check if it's a new day
      const today = new Date().toISOString().split('T')[0];
      if (data.last_date !== today) {
        data.today_count = 0;
        data.last_date = today;
        await saveCounter(data);
      }
      
      setCounter(data);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const increment = async () => {
    const today = new Date().toISOString().split('T')[0];
    const newData: CounterData = {
      count: counter.count + 1,
      today_count: counter.today_count + 1,
      last_date: today,
    };
    
    setCounter(newData);
    await saveCounter(newData);
  };

  const decrement = async () => {
    if (counter.count === 0) return;
    
    const newData: CounterData = {
      count: Math.max(0, counter.count - 1),
      today_count: Math.max(0, counter.today_count - 1),
      last_date: counter.last_date,
    };
    
    setCounter(newData);
    await saveCounter(newData);
  };

  const reset = async () => {
    await resetCounterStorage();
    setCounter({
      count: 0,
      today_count: 0,
      last_date: new Date().toISOString().split('T')[0],
    });
  };

  return {
    counter,
    loading,
    increment,
    decrement,
    reset,
  };
}
