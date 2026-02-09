import { TimeSlotGroup } from '@/lib/types';

interface TimeSlotTableProps {
  timeSlots: TimeSlotGroup[];
}

export default function TimeSlotTable({ timeSlots }: TimeSlotTableProps) {
  return (
    <div className="flex flex-col gap-4">
      {timeSlots.map((group, i) => {
        const times = group.startTimes;
        const isRange = times.length > 12;

        return (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary">{group.label}</span>
              {group.note && (
                <span className="text-xs text-text-tertiary">({group.note})</span>
              )}
            </div>
            {isRange ? (
              <p className="text-sm text-text-secondary">
                {times[0]}〜{times[times.length - 1]}
                {(() => {
                  const [h1, m1] = times[0].split(':').map(Number);
                  const [h2, m2] = times[1].split(':').map(Number);
                  const interval = (h2 * 60 + m2) - (h1 * 60 + m1);
                  return `（${interval}分間隔）`;
                })()}
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {times.map((time) => (
                  <span
                    key={time}
                    className="px-2 py-1 text-xs font-medium bg-[#FFF5F4] text-primary rounded"
                  >
                    {time}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
