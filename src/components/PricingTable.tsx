import { Plan } from '@/lib/types';

interface PricingTableProps {
  plans: Plan[];
}

export default function PricingTable({ plans }: PricingTableProps) {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-text-secondary">
            <th className="text-left font-medium py-2.5 px-4 md:px-3">プラン</th>
            <th className="text-right font-medium py-2.5 px-4 md:px-3">料金(税込)</th>
            <th className="text-right font-medium py-2.5 px-4 md:px-3">時間</th>
            <th className="text-right font-medium py-2.5 px-4 md:px-3">人数</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, i) => (
            <tr
              key={i}
              className={`border-b border-border/50 ${i === 0 ? 'bg-saunako/5' : ''}`}
            >
              <td className="py-3 px-4 md:px-3 text-text-primary font-medium whitespace-nowrap">
                {plan.name}
                {i === 0 && (
                  <span className="ml-2 text-[10px] font-semibold text-saunako bg-saunako/10 px-1.5 py-0.5 rounded">
                    最安
                  </span>
                )}
              </td>
              <td className="py-3 px-4 md:px-3 text-right text-text-primary font-bold whitespace-nowrap">
                ¥{plan.price.toLocaleString()}
              </td>
              <td className="py-3 px-4 md:px-3 text-right text-text-secondary whitespace-nowrap">
                {plan.duration}分
              </td>
              <td className="py-3 px-4 md:px-3 text-right text-text-secondary whitespace-nowrap">
                {plan.capacity}名
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
