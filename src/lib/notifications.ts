type HourMinute = { hour: number; minute: number };

function msUntilNext({ hour, minute }: HourMinute): number {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

async function show(reg: ServiceWorkerRegistration, title: string, body: string) {
  try {
    await reg.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: "/" },
    });
  } catch (e) {
    // no-op
  }
}

export async function scheduleDailyPrompts() {
  if (!("serviceWorker" in navigator)) return;
  const permission = Notification.permission;
  if (permission !== "granted") return;

  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return;

  const schedules: Array<{ time: HourMinute; title: string; body: string }> = [
    { time: { hour: 7, minute: 0 }, title: "🌸 राधे राधे", body: "begin your day with one peaceful mala." },
    { time: { hour: 12, minute: 0 }, title: "🕉️", body: "बीच दिन में भी, नाम ही सच्चा विश्राम है।" },
    { time: { hour: 18, minute: 0 }, title: "📿", body: "एक माला और… दिन पूर्ण शांति में बदलेगा।" },
  ];

  schedules.forEach(({ time, title, body }) => {
    const scheduleOnce = () => {
      const delay = msUntilNext(time);
      setTimeout(async () => {
        await show(reg, title, body);
        // schedule next day
        setTimeout(async () => {
          await show(reg, title, body);
        }, 24 * 60 * 60 * 1000);
      }, delay);
    };
    scheduleOnce();
  });
}

export async function showTestNotification() {
  if (!("serviceWorker" in navigator)) return;
  if (Notification.permission !== "granted") return;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return;
  await show(reg, "✅ Notifications enabled", "You will receive daily prompts.");
}


