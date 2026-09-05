import Link from 'next/link';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AskAI from '@/components/AskAI';
import { getAllFacilities } from '@/lib/facilities';
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'));

// 掲載施設数は固定値にしない（トップ・layout と同じ営業中件数を使い、ページ間で数がずれないようにする）
const FACILITY_COUNT = getAllFacilities().length;

export const metadata: Metadata = {
  // absolute 指定。template（%s | サウナ子）に通すと二重化する（Issue #167）
  title: { absolute: '個室サウナのよくある質問30選 | 料金・予約・カップル利用 | サウナ子' },
  description: `個室サウナの疑問をまとめて解決。料金相場（60分3,000円〜）、カップルや男女2人での利用、水着の要否、安く使うコツ、初心者の持ち物まで、全国${FACILITY_COUNT}施設を掲載するサウナ子が解説します。`,
  alternates: {
    canonical: 'https://www.saunako.jp/faq',
  },
  openGraph: {
    title: '個室サウナのよくある質問30選 | 料金・予約・カップル利用',
    description: '個室サウナの疑問をまとめて解決。料金相場、カップル利用、水着の要否、安く使うコツ、初心者の持ち物まで解説します。',
  },
};

const faqCategories = [
  {
    title: '個室サウナについて',
    items: [
      {
        q: '個室サウナとは？',
        a: '一般的なサウナとは異なり、完全プライベートな空間でサウナを楽しめる施設です。自分だけ（またはグループだけ）の空間で、時間を気にせずリラックスできるのが魅力です。サウナ子では「他のグループと共有がない状態で使えるサウナ」を個室サウナと定義し、屋内個室・グループ貸切・常設のバレルサウナまでを掲載しています。',
      },
      {
        q: '一般的なサウナとの違いは？',
        a: '最大の違いはプライバシーです。他のお客さんの目を気にせず、自分のペースでサウナを楽しめます。温度やロウリュのタイミングも自分で調整可能な施設が多いです。会話をしながら入れる、水着や湯浴み着で入れる、スマホを持ち込めるといった点も、大型サウナにはない個室サウナならではの自由さです。',
      },
      {
        q: '「プライベートサウナ」と「個室サウナ」は違うもの？',
        a: 'ほぼ同じ意味で使われています。施設によって「プライベートサウナ」「完全個室サウナ」「貸切サウナ」と呼び方が分かれているだけで、いずれも他のグループと空間を共有しない点は共通です。サウナ子ではこれらをまとめて検索できるようにしています。',
      },
      {
        q: '一人でも利用できる？',
        a: 'はい、多くの個室サウナは1名から利用可能です。一人で集中して整いたいときにもぴったりです。ただし2名以上の料金設定しかない施設や、1名だと割高になる施設もあるため、料金表の最低人数を確認してから予約するのがおすすめです。',
      },
      {
        q: 'カップルや男女2人で一緒に入れる？',
        a: '入れます。個室サウナは男女の区別なく同じ空間を使えるため、カップルや夫婦での利用が多いのが特徴です。大型サウナのように男女別に分かれることがないので、2人で会話しながら過ごせます。水着や館内着の着用ルールは施設ごとに異なるので、予約前にご確認ください。',
      },
      {
        q: '友人同士やグループでも使える？',
        a: '使えます。3〜6名程度まで対応する施設や、10名以上のグループ貸切に対応する施設もあります。人数が増えるほど1人あたりの料金は下がる傾向があるため、複数人での利用はコスパの面でもおすすめです。',
      },
      {
        q: 'サウナ初心者でも大丈夫？',
        a: '大丈夫です。むしろ個室サウナは初心者にこそ向いています。周りの目を気にせず、無理のないペースで出入りでき、分からないことがあってもパートナーや友人と相談しながら進められるためです。温度もマイルドな設定の施設が多く、初めての方でも入りやすくなっています。',
      },
    ],
  },
  {
    title: '予約・料金について',
    items: [
      {
        q: '予約方法は？',
        a: '各施設の公式サイトやSTORES予約（旧Coubic）などの予約サービスから予約できます。サウナ子では各施設ページに予約リンクを掲載しているので、そこから直接予約ページへ進めます。',
      },
      {
        q: '料金の相場は？',
        a: '1室あたり60分3,000円〜10,000円程度が一般的です。都心部は高め、地方は安めの傾向があります。注意したいのは、多くの施設が「1人あたり」ではなく「1室あたり」の料金設定である点です。2人で利用すれば1人あたりの負担は半分になります。',
      },
      {
        q: 'できるだけ安く利用するには？',
        a: '3つの方法があります。①平日の日中を狙う（土日祝より2〜3割安い施設が多い）②2人以上で利用して1室料金を割る③最低利用時間ぴったりのコースを選ぶ。サウナ子の検索では料金順の並び替えができるほか、施設ページに1人あたりの料金も表示しているので比較しやすくなっています。',
      },
      {
        q: '当日予約や飛び込みでも入れる？',
        a: '施設によります。予約枠が埋まりやすい人気施設は数日前から満室になることも多い一方、当日の空き枠をオンラインで公開している施設もあります。確実に入りたい場合は事前予約、急に時間ができた場合は予約サイトで当日枠を確認するのが確実です。',
      },
      {
        q: 'キャンセルポリシーは？',
        a: '施設によって異なります。前日までは無料、当日は50〜100%といった設定が一般的です。個室サウナは1枠を貸し切る形式のため、大型サウナよりキャンセル規定が厳しめの傾向があります。各施設の公式サイトで事前にご確認ください。',
      },
      {
        q: '料金以外にかかる費用はある？',
        a: 'タオルレンタル代、館内着代、ドリンク代などが別料金の施設があります。一方でこれらがすべて込みの施設も多く、その場合は表示料金だけで利用できます。サウナ子では各施設ページにアメニティの有無を掲載しています。',
      },
    ],
  },
  {
    title: '利用方法について',
    items: [
      {
        q: '持ち物は何が必要？',
        a: 'タオルやアメニティは施設に用意されていることが多いです。着替えと水分補給用の飲み物があれば十分です。水着着用が必要な施設では水着も忘れずに。詳細は各施設のページをご確認ください。',
      },
      {
        q: '利用時間はどのくらい？',
        a: '60分〜180分のコースが一般的です。初めての方は90分あると、サウナ・水風呂・休憩を3セットこなして着替えるまで余裕をもって過ごせます。60分だと2セットでやや慌ただしく感じることがあります。',
      },
      {
        q: '水風呂やロウリュって何？',
        a: '水風呂はサウナ後に体を冷やすための冷水浴です。ロウリュはサウナストーンに水をかけて蒸気を発生させることを指します。個室サウナではセルフロウリュを楽しめる施設も多いです。',
      },
      {
        q: '水風呂がない施設もある？',
        a: 'あります。個室サウナはスペースの制約から、水風呂の代わりにシャワーやミストで体を冷やす施設も少なくありません。水風呂を重視する方は、サウナ子の検索で水風呂の有無・温度を条件に絞り込めます。',
      },
      {
        q: '水着は必要？裸でも入れる？',
        a: '施設によって分かれます。完全個室で鍵がかかるタイプは裸でも問題ない施設が多く、一方で共用部分を通る構造の施設や男女混合利用を想定した施設では水着・湯浴み着の着用が必須です。予約前に各施設のルールをご確認ください。',
      },
      {
        q: '24時間営業や深夜でも使える個室サウナはある？',
        a: 'あります。数は限られますが、24時間営業または深夜まで営業している個室サウナが全国にあります。終電を逃した日や早朝のリフレッシュに使えます。サウナ子では24時間利用できる施設をまとめた記事も用意しています。',
      },
      {
        q: '食事や飲み物の持ち込みはできる？',
        a: '施設によります。持ち込み自由の施設、ドリンクのみ可の施設、完全に不可の施設と対応が分かれます。個室サウナは貸切のため比較的自由度が高く、サウナ後の食事とセットで楽しめる施設もあります。',
      },
      {
        q: '子ども連れでも利用できる？',
        a: '年齢制限を設けている施設が多く、小学生以上のみ・中学生以上のみといった条件が一般的です。家族利用を想定した施設もあるため、お子様連れの場合は事前に各施設へ確認することをおすすめします。',
      },
      {
        q: 'タトゥーがあっても入れる？',
        a: '個室サウナは他のお客様と空間を共有しないため、タトゥーOKの施設が大型サウナより多い傾向にあります。ただし施設ごとに方針が異なるため、公式サイトの利用規約をご確認ください。',
      },
    ],
  },
  {
    title: 'サウナ子について',
    items: [
      {
        q: 'サウナ子ってどんなサービス？',
        a: `全国の個室・プライベートサウナを比較・検索できるサービスです。水風呂の温度やロウリュの有無など、サウナ好きが気になるポイントで施設を探せます。47都道府県・${FACILITY_COUNT}施設を掲載しており、料金や設備を横並びで比較できます。`,
      },
      {
        q: 'どんな基準で施設を掲載している？',
        a: '「他のグループと共有がない状態で使えるサウナ」を掲載基準としています。屋内個室サウナ、グループ貸切サウナ、常設のバレルサウナ・サウナ小屋が対象です。一方、テントサウナやキャンプ場、大型スパ・スーパー銭湯の共用サウナ、宿泊者専用のサウナは掲載していません。',
      },
      {
        q: '掲載情報は正確？',
        a: '公式サイトや予約ページで裏取りしたうえで掲載していますが、料金や営業時間は変更になる場合があります。最新情報は各施設の公式サイトでご確認ください。誤りを見つけた場合はお問い合わせフォームからご連絡いただけると助かります。',
      },
      {
        q: '施設はどうやって探すのがおすすめ？',
        a: 'エリアから探す方法と、条件から探す方法があります。都道府県ページでは市区町村ごとの絞り込みができ、検索ページでは料金・水風呂の有無・人数などの条件で絞り込めます。目的が決まっている場合は、カップル向け・一人向け・24時間営業といったガイド記事から探すのも便利です。',
      },
      {
        q: 'サウナ子で予約できる？',
        a: 'サウナ子では直接予約は受け付けておりません。各施設ページの予約リンクから、公式サイトや予約サービスを通じてご予約ください。予約手数料はかからず、施設の正規料金でご利用いただけます。',
      },
      {
        q: '利用は無料？会員登録は必要？',
        a: 'すべての機能を無料でご利用いただけます。会員登録も不要です。お気に入り機能はブラウザ内に保存される仕組みのため、登録なしでそのままお使いいただけます。',
      },
    ],
  },
  {
    title: '施設オーナー様へ',
    items: [
      {
        q: '施設を掲載するには？',
        a: '完全無料で掲載いただけます。詳しくは施設掲載のご案内ページをご覧ください。',
      },
      {
        q: '掲載情報の修正は？',
        a: 'お問い合わせフォームからご連絡ください。確認の上、修正対応いたします。',
      },
    ],
  },
];

// FAQで触れたテーマを深掘りするガイド記事への導線。
// FAQは検索流入の受け皿になりやすいため、ここから記事・エリアページへ回遊させる。
const RELATED_LINKS = [
  {
    href: '/articles/private-sauna-beginners-guide',
    title: '個室サウナ初心者ガイド',
    description: '初めての予約から当日の流れまで、迷いやすいポイントを解説',
  },
  {
    href: '/articles/couple-private-sauna',
    title: 'カップルで行く個室サウナ',
    description: '男女2人で使える施設の選び方と、デートで外さない施設',
  },
  {
    href: '/articles/cheap-private-sauna',
    title: '安い個室サウナの探し方',
    description: '1人あたりの料金を抑えるコツと、コスパの高い施設',
  },
  {
    href: '/articles/solo-private-sauna-guide',
    title: '一人で使う個室サウナ',
    description: '1名から予約できる施設と、ソロ利用に向いた選び方',
  },
  {
    href: '/articles/24h-private-sauna',
    title: '24時間・深夜の個室サウナ',
    description: '終電後や早朝でも利用できる施設をまとめて紹介',
  },
  {
    href: '/area/tokyo',
    title: '東京の個室サウナを探す',
    description: 'エリア別・料金別に東京都内の施設を比較',
  },
];

// 全Q&Aをフラットに展開（JSON-LD用）
const allFaqItems = faqCategories.flatMap((cat) => cat.items);

export default function FaqPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TOP', item: 'https://www.saunako.jp/' },
      { '@type': 'ListItem', position: 2, name: 'よくある質問', item: 'https://www.saunako.jp/faq' },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />

      <main className="max-w-3xl mx-auto px-5 md:px-8 py-8 md:py-16">
        <nav className="text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary transition-colors">TOP</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">よくある質問</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">
          よくある質問
        </h1>

        <div className="space-y-8">
          {faqCategories.map((category) => (
            <section key={category.title}>
              <h2 className="text-lg md:text-xl font-bold text-text-primary mb-4">
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <details
                    key={item.q}
                    className="bg-surface border border-border rounded-xl overflow-hidden group"
                  >
                    <summary className="px-5 py-4 cursor-pointer text-text-primary font-medium hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <span>{item.q}</span>
                      <svg
                        className="w-5 h-5 text-text-tertiary flex-shrink-0 ml-2 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-4 text-text-secondary text-sm leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12" aria-labelledby="faq-related-heading">
          <h2 id="faq-related-heading" className="mb-4 text-lg md:text-xl font-bold text-text-primary">
            もっと詳しく知りたい方へ
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {RELATED_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block h-full rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-primary"
                >
                  <span className="block font-medium text-text-primary">{link.title}</span>
                  <span className="mt-1 block text-sm text-text-secondary">{link.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <AskAI context={{ kind: 'site' }} className="mt-12" />
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
