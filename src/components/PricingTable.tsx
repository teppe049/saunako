import { Plan } from '@/lib/types';

interface PricingTableProps {
  plans: Plan[];
}

/** プラン1件の1人あたり料金（人数不明なら null） */
function perPerson(plan: Plan): number | null {
  if (plan.price <= 0 || plan.capacity <= 0) return null;
  return Math.ceil(plan.price / plan.capacity);
}

export default function PricingTable({ plans }: PricingTableProps) {
  // 「最安」は配列順ではなく実際の最安値に付ける
  const cheapestPrice = Math.min(...plans.filter((p) => p.price > 0).map((p) => p.price));
  const perPersonValues = plans.map(perPerson).filter((v): v is number => v !== null);
  const cheapestPerPerson = perPersonValues.length > 0 ? Math.min(...perPersonValues) : null;

  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-text-secondary">
            <th className="text-left font-medium py-2.5 px-4 md:px-3">プラン</th>
            <th className="text-right font-medium py-2.5 px-4 md:px-3">料金(税込)</th>
            {/* モバイルは料金セル内に1人あたりを併記し、列は md 以上でのみ表示（横スクロールを避ける） */}
            <th className="hidden md:table-cell text-right font-medium py-2.5 px-4 md:px-3">1人あたり</th>
            <th className="text-right font-medium py-2.5 px-4 md:px-3">時間</th>
            <th className="text-right font-medium py-2.5 px-4 md:px-3">人数</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, i) => {
            const pp = perPerson(plan);
            return (
              <tr
                key={i}
                className={`border-b border-border/50 ${plan.price === cheapestPrice ? 'bg-saunako/5' : ''}`}
              >
                <td className="py-3 px-4 md:px-3 text-text-primary font-medium whitespace-nowrap">
                  {plan.name}
                  {plan.price === cheapestPrice && (
                    <span className="ml-2 text-[10px] font-semibold text-saunako bg-saunako/10 px-1.5 py-0.5 rounded">
                      最安
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 md:px-3 text-right text-text-primary font-bold whitespace-nowrap">
                  ¥{plan.price.toLocaleString()}
                  {pp !== null && (
                    <span className={`block md:hidden text-xs font-normal ${pp === cheapestPerPerson ? 'text-saunako' : 'text-text-secondary'}`}>
                      1人 ¥{pp.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="hidden md:table-cell py-3 px-4 md:px-3 text-right whitespace-nowrap">
                  {pp !== null ? (
                    <span className={pp === cheapestPerPerson ? 'text-saunako font-semibold' : 'text-text-secondary'}>
                      ¥{pp.toLocaleString()}
                      {pp === cheapestPerPerson && plans.length > 1 && (
                        <span className="ml-1 text-[10px] font-semibold">お得</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-text-tertiary">—</span>
                  )}
                </td>
                <td className="py-3 px-4 md:px-3 text-right text-text-secondary whitespace-nowrap">
                  {plan.duration}分
                </td>
                <td className="py-3 px-4 md:px-3 text-right text-text-secondary whitespace-nowrap">
                  {plan.capacity}名
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
