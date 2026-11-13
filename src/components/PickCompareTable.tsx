import type { Facility } from '@/lib/types';
import type { PickBadges } from '@/lib/pick';

interface Props {
  facilities: Facility[];
  badges: PickBadges;
  perPerson: Map<number, number | null>;
}

const shortName = (f: Facility) => (f.name.length > 8 ? `${f.name.slice(0, 8)}…` : f.name);

/** /pick の「決め手で比べる」表。候補2件以上のときだけ出す */
export default function PickCompareTable({ facilities, badges, perPerson }: Props) {
  return (
    <section className="mt-6">
      <h2 className="text-[15px] font-bold text-text-primary mb-2.5">決め手で比べる</h2>
      <div className="card overflow-hidden text-xs">
        <div className="grid" style={{ gridTemplateColumns: `88px repeat(${facilities.length}, minmax(0, 1fr))` }}>
          <div className="px-3 py-2.5 border-b border-border" />
          {facilities.map((f, idx) => (
            <div key={f.id} className="px-1.5 py-2.5 text-center font-semibold text-text-primary border-b border-border truncate">
              {idx + 1} {shortName(f)}
            </div>
          ))}

          <div className="px-3 py-3 text-text-tertiary border-b border-border/60">1人あたり</div>
          {facilities.map((f) => {
            const pp = perPerson.get(f.id) ?? null;
            const best = badges.cheapestId === f.id;
            return (
              <div key={f.id} className={`px-1.5 py-3 text-center border-b border-border/60 ${best ? 'font-bold text-primary' : 'text-text-primary'}`}>
                {pp !== null ? `¥${pp.toLocaleString()}` : '—'}
              </div>
            );
          })}

          <div className="px-3 py-3 text-text-tertiary border-b border-border/60">最寄駅</div>
          {facilities.map((f) => {
            const best = badges.nearestId === f.id;
            const s = f.nearestStation && (f.walkMinutes ?? 0) > 0 ? `${f.nearestStation.replace(/駅$/, '')} ${f.walkMinutes}分` : '—';
            return (
              <div key={f.id} className={`px-1.5 py-3 text-center border-b border-border/60 ${best ? 'font-bold text-primary' : 'text-text-primary'}`}>
                {s}
              </div>
            );
          })}

          <div className="px-3 py-3 text-text-tertiary border-b border-border/60">水風呂</div>
          {facilities.map((f) => (
            <div key={f.id} className={`px-1.5 py-3 text-center border-b border-border/60 ${f.features.waterBath ? 'font-bold text-primary' : 'text-text-tertiary'}`}>
              {f.features.waterBath ? (f.features.waterBathTemp ? `${f.features.waterBathTemp}℃` : '○') : '—'}
            </div>
          ))}

          <div className="px-3 py-3 text-text-tertiary">外気浴</div>
          {facilities.map((f) => (
            <div key={f.id} className={`px-1.5 py-3 text-center ${f.features.outdoorAir ? 'font-bold text-primary' : 'text-text-tertiary'}`}>
              {f.features.outdoorAir ? '○' : '—'}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
