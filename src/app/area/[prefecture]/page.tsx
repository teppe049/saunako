import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { getFacilitiesByPrefecture, getAllPrefectures, getAreaFacilityCounts, getPrefectureFacilityCounts } from '@/lib/facilities';
import { getArticlesByFacilityId } from '@/lib/articles';
import ArticleCard from '@/components/ArticleCard';
import { PREFECTURES, AREA_GROUPS, REGION_GROUPS, Facility } from '@/lib/types';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'));
import AreaFilters from './AreaFilters';

interface PageProps {
  params: Promise<{ prefecture: string }>;
}

// 都道府県ごとのサウナ子コメント
const SAUNAKO_AREA_COMMENTS: Record<string, string> = {
  hokkaido: '北海道は札幌を中心に、大自然の中で整える個室サウナがそろってるわ！冬は雪景色を眺めながらの外気浴が最高よ。',
  aomori: '青森は八戸・青森市を中心に、温泉文化と融合した個性的な個室サウナが点在してるわ。りんごのロウリュが体験できる施設もあるのよ！',
  iwate: '岩手は盛岡を中心に、自然豊かな環境で贅沢にととのえる施設がそろってるわ。東北の隠れたサウナスポットよ！',
  miyagi: '宮城は仙台を中心に個室サウナが増えてきてるわ！牛タンの後にサウナ、なんて仙台ならではの楽しみ方もおすすめよ。',
  akita: '秋田は温泉大国ならではの、お湯とサウナを両方楽しめる施設が魅力よ。自然の中でゆっくり整うのにぴったりね。',
  yamagata: '山形は温泉文化が根付いた土地ならではの、サウナと温泉を同時に楽しめる施設があるわ。蔵王や月山の大自然も魅力よ！',
  fukushima: '福島は会津・磐梯エリアの自然豊かなサウナから、郡山・いわきの街なかサウナまで幅広い選択肢があるのよ。',
  ibaraki: '茨城はつくば・水戸を中心に、個性的な個室サウナが増えてきてるよ! 大子や高萩など自然豊かなエリアのサウナも注目だね。',
  tochigi: '栃木は那須・日光エリアを中心に、自然に囲まれた贅沢なプライベートサウナがそろってるよ! 旅行ついでにサウナも楽しめるのが魅力だね。',
  gunma: '群馬は高崎・前橋の街なかサウナから、みなかみ・赤城山の大自然サウナまで個性派ぞろいだよ! 渓流で冷水浴できる施設もあって、自然好きにはたまらないかも!',
  saitama: '埼玉は大宮・浦和エリアを中心に、コスパ抜群の個室サウナがそろってるわ。都心より広々とした施設が多いのが魅力ね！',
  chiba: '千葉は船橋・浦安エリアを中心に、個性豊かな個室サウナが点在してるの。東京のベッドタウンだからアクセスも便利よ。',
  tokyo: '東京は個室サウナの激戦区! 新宿・渋谷・池袋を中心に、こだわりの施設がたくさんあるわ。駅チカで仕事帰りにサクッと整えるのがおすすめよ。',
  kanagawa: '神奈川は横浜・川崎を中心に個室サウナが増えてきてるわ！都内からのアクセスも良いから、休日にゆっくり整うのにぴったりよ。',
  niigata: '新潟は日本海側ならではの風情ある施設が魅力的よ。お米どころの食事と合わせて、サウナ旅を楽しむのもおすすめ！',
  yamanashi: '山梨は富士山を望むロケーション抜群の個室サウナが人気よ！都心から日帰りで行けるサウナ旅におすすめだわ。',
  nagano: '長野は軽井沢や蓼科など、リゾートエリアに上質な個室サウナが点在してるわ。高原の澄んだ空気での外気浴は格別よ！',
  toyama: '富山は立山連峰の絶景を楽しめるサウナや、富山湾の新鮮な海の幸とセットで楽しめる施設があるわ。',
  ishikawa: '石川は金沢の情緒ある街並みの中に、おしゃれな個室サウナが登場してきてるわ。加賀温泉郷のサウナも注目よ！',
  fukui: '福井は日本海の絶景を楽しめるサウナ施設が魅力的よ。恐竜博物館とサウナの合わせ技もおすすめだわ！',
  shizuoka: '静岡は伊豆や熱海のリゾートサウナから、浜松の街なかサウナまで幅広い選択肢があるわ。富士山ビューの施設も要チェックよ！',
  gifu: '岐阜は飛騨高山の自然に囲まれたサウナから、岐阜市街の便利な施設まで、バリエーション豊かなラインナップがそろってるわ。',
  mie: '三重は伊勢志摩の海を感じられるサウナや、自然豊かなロケーションの施設が魅力よ。お伊勢参りの後にサウナも最高ね！',
  aichi: '愛知は名古屋を中心に個室サウナが充実してるよ! サウナの聖地・名古屋ならではのこだわり施設が多いのが特徴だね。',
  shiga: '滋賀は琵琶湖を望むロケーション抜群のサウナが魅力よ。京都からのアクセスも良くて、穴場的な存在ね！',
  kyoto: '京都は町家を改装した風情ある個室サウナが人気よ。和の空間でととのう贅沢、京都ならではの体験ができるわ。',
  osaka: '大阪は東京に負けないくらい個室サウナが充実してきてるわ! 梅田・心斎橋エリアを中心に、コスパ抜群の施設が多いのが特徴ね。',
  hyogo: '兵庫は神戸・三宮を中心におしゃれな個室サウナが増えてきてるわ。有馬温泉エリアのサウナも見逃せないわよ！',
  nara: '奈良は歴史ある街並みの中に、こだわりの個室サウナが点在してるわ。古都の雰囲気とサウナの組み合わせが新鮮よ！',
  wakayama: '和歌山は白浜や熊野の大自然の中で楽しめるサウナが魅力よ。温泉文化が根付いた土地だからこそのクオリティがあるわ。',
  tottori: '鳥取は砂丘や日本海の絶景を楽しめるサウナが魅力的よ。自然の中で心からリフレッシュできるわ！',
  shimane: '島根は出雲や松江の歴史ある街並みの中に、こだわりのサウナ施設が点在してるわ。縁結びの後にサウナも素敵ね！',
  okayama: '岡山は倉敷の美しい街並みや、瀬戸内海を感じられるサウナが魅力よ。晴れの国ならではの爽快な外気浴を楽しめるわ！',
  hiroshima: '広島は瀬戸内海のおだやかな風景を楽しめるサウナが魅力的よ。牡蠣とサウナの組み合わせ、広島ならではのぜいたくね！',
  yamaguchi: '山口は下関・山口市を中心に、自然豊かな環境でととのえる施設がそろってるわ。関門海峡の絶景サウナも注目よ！',
  tokushima: '徳島は大自然の中でととのえる施設が魅力的よ。渓谷や吉野川沿いのサウナは開放感抜群だわ！',
  kagawa: '香川はうどん県ならではの食とサウナの組み合わせが最高よ。瀬戸内海の穏やかな景色を眺めながらの外気浴もおすすめ！',
  ehime: '愛媛は道後温泉で有名な温泉文化と融合した個室サウナが魅力よ。みかんのロウリュが体験できる施設もあるわ！',
  kochi: '高知は太平洋を望むダイナミックなロケーションのサウナが魅力的よ。カツオのたたきとサウナ、高知ならではの楽しみ方ね！',
  fukuoka: '福岡は博多・天神エリアを中心に個室サウナが急増中だよ! 九州のサウナシーンを引っ張る勢いがあるね。',
  saga: '佐賀は嬉野温泉や武雄温泉など、温泉地ならではのサウナ体験ができるのが魅力よ。のどかな環境でゆっくり整えるわ！',
  nagasaki: '長崎は異国情緒あふれる街並みの中に、個性的な個室サウナが点在してるわ。島々を望むサウナも魅力的よ！',
  kumamoto: '熊本は阿蘇の大自然や天草の海を感じられるサウナが魅力的よ。雄大な景色の中でととのう体験は格別だわ！',
  oita: '大分は「おんせん県」ならではの温泉×サウナの組み合わせが最高よ！別府・湯布院エリアの施設は見逃せないわ。',
  miyazaki: '宮崎は南国の温暖な気候の中で、一年中快適にサウナを楽しめるのが魅力よ。サーフィンとサウナの組み合わせも人気ね！',
  kagoshima: '鹿児島は桜島を望むロケーション抜群のサウナが魅力よ。温泉大国ならではのクオリティの高い施設がそろってるわ！',
  okinawa: '沖縄は美しい海を眺めながらサウナを楽しめる施設が増えてきてるわ。リゾート気分で整う、南国ならではのサウナ体験ができるのよ！',
};

// デフォルトのサウナ子コメント（フォールバック用）
const DEFAULT_SAUNAKO_COMMENT = 'このエリアの個室サウナをまとめてみたわ! 気になる施設があったらチェックしてみてね。';

// 都道府県ごとのカスタム title / description（SEO最適化）
const AREA_META: Record<string, { title: string; description: string }> = {
  hokkaido: {
    title: '北海道の個室・プライベートサウナ一覧｜札幌・千歳の貸切施設を比較 | サウナ子',
    description: '北海道・札幌の個室サウナ・プライベートサウナ全16施設を比較。BORO SAPPORO・SAUNA OOO・solosなど札幌エリアの人気施設から、十勝・旭川の大自然サウナまで網羅。料金・水風呂・ロウリュ・カップルOKなど設備で絞り込み検索。',
  },
  aomori: {
    title: '青森の個室・プライベートサウナ一覧｜青森市・八戸の施設を比較 | サウナ子',
    description: '青森の個室・プライベートサウナを探すならサウナ子。青森市・八戸エリアを中心に、温泉文化と融合した個室サウナを掲載。料金・設備・アクセスを比較。',
  },
  iwate: {
    title: '岩手の個室・プライベートサウナ一覧｜盛岡エリアの施設を比較 | サウナ子',
    description: '岩手の個室・プライベートサウナを探すならサウナ子。盛岡を中心に、自然豊かな環境の個室サウナを掲載。料金・設備・アクセスを比較。',
  },
  miyagi: {
    title: '宮城の個室・プライベートサウナ一覧｜仙台エリアの施設を比較 | サウナ子',
    description: '宮城・仙台の個室・プライベートサウナを探すならサウナ子。仙台市を中心に、駅チカの個室サウナを厳選。料金・設備・アクセスを比較。',
  },
  akita: {
    title: '秋田の個室・プライベートサウナ一覧｜カップルOK・貸切サウナを比較 | サウナ子',
    description: '秋田の個室サウナ・プライベートサウナを探すならサウナ子。秋田市・横手エリアのカップル利用OK・貸切プランありの施設を厳選掲載。温泉大国ならではのサウナ施設の料金・設備・口コミ・アクセスを比較。',
  },
  yamagata: {
    title: '山形の個室・プライベートサウナ一覧｜温泉×サウナ施設を比較 | サウナ子',
    description: '山形の個室・プライベートサウナを探すならサウナ子。蔵王・月山エリアの自然豊かなサウナ施設を掲載。料金・設備・アクセスを比較。',
  },
  fukushima: {
    title: '福島の個室・プライベートサウナ一覧｜会津・郡山の施設を比較 | サウナ子',
    description: '福島の個室・プライベートサウナを探すならサウナ子。会津・磐梯・郡山・いわきエリアの施設を掲載。料金・設備・アクセスを比較。',
  },
  ibaraki: {
    title: '茨城の個室・プライベートサウナ一覧｜つくば・水戸エリアの施設を比較 | サウナ子',
    description: '茨城の個室サウナ・プライベートサウナを探すならサウナ子。つくば・水戸を中心に、料金・設備・アクセスを比較。あなたにぴったりの個室・プライベートサウナが見つかる。',
  },
  tochigi: {
    title: '栃木の個室・プライベートサウナ一覧｜那須・日光の貸切サウナを比較 | サウナ子',
    description: '栃木の個室サウナ・プライベートサウナを探すならサウナ子。那須・日光エリアを中心に自然に囲まれた施設を厳選。料金・設備・アクセスを比較。',
  },
  gunma: {
    title: '群馬の個室・プライベートサウナ一覧｜高崎・みなかみの貸切サウナを比較 | サウナ子',
    description: '群馬の個室サウナ・プライベートサウナを探すならサウナ子。高崎・前橋の街なかサウナからみなかみ・赤城山の大自然サウナまで厳選。料金・設備・アクセスを比較。',
  },
  saitama: {
    title: '埼玉の個室・プライベートサウナ一覧｜カップルOK・大宮・浦和の貸切施設を比較 | サウナ子',
    description: '埼玉の個室サウナ・プライベートサウナをカップル利用OK施設中心に厳選紹介。大宮・浦和・川越エリアの料金比較・アクセス情報を掲載。2名で貸切できるコスパ抜群の施設が見つかる。',
  },
  chiba: {
    title: '千葉の個室・プライベートサウナ一覧｜船橋エリアの施設を比較 | サウナ子',
    description: '千葉の個室・プライベートサウナを探すならサウナ子。船橋・浦安エリアを中心に、料金・設備・アクセスを比較。都心からのアクセスも便利な個室・プライベートサウナが見つかる。',
  },
  tokyo: {
    title: '東京の個室・プライベートサウナ一覧｜新宿・渋谷・池袋の駅チカ施設を比較 | サウナ子',
    description: '東京の個室・プライベートサウナを探すならサウナ子。新宿・渋谷・池袋など駅チカで仕事帰りに寄れる施設を厳選。料金・設備・アクセスを比較して、あなたにぴったりの個室・プライベートサウナが見つかる。',
  },
  kanagawa: {
    title: '神奈川の個室・プライベートサウナ一覧｜横浜・川崎エリアの施設を比較 | サウナ子',
    description: '神奈川の個室・プライベートサウナを探すならサウナ子。横浜・川崎エリアを中心に、カップル利用OK・料金比較・アクセス情報を掲載。あなたにぴったりの個室・プライベートサウナが見つかる。',
  },
  niigata: {
    title: '新潟の個室・プライベートサウナ一覧｜新潟市・湯沢の施設を比較 | サウナ子',
    description: '新潟の個室・プライベートサウナを探すならサウナ子。新潟市・湯沢エリアを中心に、日本海側ならではの施設を掲載。料金・設備・アクセスを比較。',
  },
  yamanashi: {
    title: '山梨の個室・プライベートサウナ一覧｜富士山ビューの貸切サウナを比較 | サウナ子',
    description: '山梨の個室・プライベートサウナを探すならサウナ子。富士山を望むロケーション抜群の施設を厳選。都心から日帰りで行ける個室サウナの料金・設備を比較。',
  },
  nagano: {
    title: '長野の個室・プライベートサウナ一覧｜軽井沢・蓼科の貸切サウナを比較 | サウナ子',
    description: '長野の個室・プライベートサウナを探すならサウナ子。軽井沢・蓼科・白馬エリアのリゾートサウナを厳選。高原の外気浴を楽しめる施設の料金・設備を比較。',
  },
  toyama: {
    title: '富山の個室・プライベートサウナ一覧｜立山連峰ビューの施設を比較 | サウナ子',
    description: '富山の個室・プライベートサウナを探すならサウナ子。立山連峰を望む絶景サウナや富山市街の施設を掲載。料金・設備・アクセスを比較。',
  },
  ishikawa: {
    title: '石川の個室・プライベートサウナ一覧｜金沢・加賀の施設を比較 | サウナ子',
    description: '石川の個室・プライベートサウナを探すならサウナ子。金沢市街や加賀温泉郷エリアの施設を掲載。料金・設備・アクセスを比較。',
  },
  fukui: {
    title: '福井の個室・プライベートサウナ一覧｜日本海沿いの施設を比較 | サウナ子',
    description: '福井の個室・プライベートサウナを探すならサウナ子。日本海の絶景を楽しめる施設を掲載。料金・設備・アクセスを比較。',
  },
  shizuoka: {
    title: '静岡の個室・プライベートサウナ一覧｜伊豆・熱海のリゾートサウナを比較 | サウナ子',
    description: '静岡の個室・プライベートサウナを探すならサウナ子。伊豆・熱海のリゾートサウナから浜松の街なか施設まで厳選。料金・設備・アクセスを比較。',
  },
  gifu: {
    title: '岐阜の個室・プライベートサウナ一覧｜飛騨高山・岐阜市の施設を比較 | サウナ子',
    description: '岐阜の個室・プライベートサウナを探すならサウナ子。飛騨高山の自然豊かなサウナや岐阜市街の施設を掲載。料金・設備・アクセスを比較。',
  },
  mie: {
    title: '三重の個室・プライベートサウナ一覧｜伊勢志摩エリアの施設を比較 | サウナ子',
    description: '三重の個室・プライベートサウナを探すならサウナ子。伊勢志摩の海を感じるサウナ施設を掲載。料金・設備・アクセスを比較。',
  },
  aichi: {
    title: '愛知の個室・プライベートサウナ一覧｜名古屋のプライベートサウナを比較 | サウナ子',
    description: '愛知・名古屋の個室サウナ・プライベートサウナ全14施設を比較。S+（エスプラス）・LOCA THE CLASS・SAUNA MONKEYなど名古屋駅・栄エリアを中心に、刈谷・豊田の人気施設も網羅。料金・水風呂・ロウリュ・カップルOKなど設備で絞り込み検索。',
  },
  shiga: {
    title: '滋賀の個室・プライベートサウナ一覧｜琵琶湖ビューの施設を比較 | サウナ子',
    description: '滋賀の個室・プライベートサウナを探すならサウナ子。琵琶湖を望むロケーション抜群の施設を掲載。料金・設備・アクセスを比較。',
  },
  kyoto: {
    title: '京都の個室・プライベートサウナ一覧｜京都らしい上質な貸切サウナを比較 | サウナ子',
    description: '京都の個室サウナ・貸切サウナを探すならサウナ子。京都ならではの上質な空間で整う、料金・設備・アクセスを比較。あなたにぴったりの個室・プライベートサウナが見つかる。',
  },
  osaka: {
    title: '大阪の個室・プライベートサウナ一覧｜梅田・心斎橋のコスパ抜群施設を比較 | サウナ子',
    description: '大阪の個室・プライベートサウナを探すならサウナ子。梅田・心斎橋エリアを中心に、コスパ抜群の施設を厳選。料金比較・カップル利用OK・設備情報を掲載。',
  },
  hyogo: {
    title: '兵庫の個室・プライベートサウナ一覧｜神戸・三宮の施設を比較 | サウナ子',
    description: '兵庫・神戸の個室サウナ・プライベートサウナ全15施設を比較。XG SAUNA・Prus Sauna姫路・minimal SAUNAなど神戸三宮・姫路・西宮エリアの人気施設を網羅。料金・水風呂・ロウリュ・カップルOKなど設備で絞り込み検索。',
  },
  nara: {
    title: '奈良の個室・プライベートサウナ一覧｜カップルOK・貸切サウナを比較 | サウナ子',
    description: '奈良の個室サウナ・プライベートサウナを探すならサウナ子。奈良市・生駒エリアのカップル利用OK・貸切プランありの個室サウナを厳選掲載。料金・設備・口コミ・アクセスを比較して、奈良でぴったりのプライベートサウナが見つかる。',
  },
  wakayama: {
    title: '和歌山の個室・プライベートサウナ一覧｜白浜・熊野の施設を比較 | サウナ子',
    description: '和歌山の個室・プライベートサウナを探すならサウナ子。白浜・熊野エリアの自然豊かな施設を掲載。料金・設備・アクセスを比較。',
  },
  tottori: {
    title: '鳥取の個室・プライベートサウナ一覧｜砂丘エリアの施設を比較 | サウナ子',
    description: '鳥取の個室・プライベートサウナを探すならサウナ子。日本海の絶景と砂丘エリアの施設を掲載。料金・設備・アクセスを比較。',
  },
  shimane: {
    title: '島根の個室・プライベートサウナ一覧｜出雲・松江の施設を比較 | サウナ子',
    description: '島根の個室・プライベートサウナを探すならサウナ子。出雲・松江エリアの施設を掲載。料金・設備・アクセスを比較。',
  },
  okayama: {
    title: '岡山の個室・プライベートサウナ一覧｜倉敷・岡山市の施設を比較 | サウナ子',
    description: '岡山の個室・プライベートサウナを探すならサウナ子。倉敷・岡山市の施設を掲載。料金・設備・アクセスを比較。',
  },
  hiroshima: {
    title: '広島の個室・プライベートサウナ一覧｜広島市・尾道の施設を比較 | サウナ子',
    description: '広島の個室・プライベートサウナを探すならサウナ子。広島市・尾道エリアの瀬戸内海を感じる施設を掲載。料金・設備・アクセスを比較。',
  },
  yamaguchi: {
    title: '山口の個室・プライベートサウナ一覧｜下関・山口市の施設を比較 | サウナ子',
    description: '山口の個室・プライベートサウナを探すならサウナ子。下関・山口市エリアの施設を掲載。料金・設備・アクセスを比較。',
  },
  tokushima: {
    title: '徳島の個室・プライベートサウナ一覧｜渓谷の自然派サウナを比較 | サウナ子',
    description: '徳島の個室・プライベートサウナを探すならサウナ子。大自然の中のサウナ施設を掲載。料金・設備・アクセスを比較。',
  },
  kagawa: {
    title: '香川の個室・プライベートサウナ一覧｜瀬戸内海ビューの施設を比較 | サウナ子',
    description: '香川の個室・プライベートサウナを探すならサウナ子。瀬戸内海を望む施設を掲載。料金・設備・アクセスを比較。',
  },
  ehime: {
    title: '愛媛の個室・プライベートサウナ一覧｜道後温泉エリアの施設を比較 | サウナ子',
    description: '愛媛の個室・プライベートサウナを探すならサウナ子。道後温泉エリアの温泉×サウナ施設を掲載。料金・設備・アクセスを比較。',
  },
  kochi: {
    title: '高知の個室・プライベートサウナ一覧｜太平洋を望む施設を比較 | サウナ子',
    description: '高知の個室・プライベートサウナを探すならサウナ子。太平洋を望む開放感抜群の施設を掲載。料金・設備・アクセスを比較。',
  },
  fukuoka: {
    title: '福岡の個室・プライベートサウナ一覧｜博多・天神のプライベートサウナを比較 | サウナ子',
    description: '福岡の個室サウナ・プライベートサウナ全14施設を比較。天神・博多のテンジンサウナ・SAUNA OOO・SAUNA Giraffeや小倉TOTONOI等、九州エリアの人気施設を網羅。料金・水風呂・ロウリュ・カップルOKなど設備で絞り込み検索。',
  },
  saga: {
    title: '佐賀の個室・プライベートサウナ一覧｜嬉野温泉エリアの施設を比較 | サウナ子',
    description: '佐賀の個室・プライベートサウナを探すならサウナ子。嬉野温泉・武雄温泉エリアの施設を掲載。料金・設備・アクセスを比較。',
  },
  nagasaki: {
    title: '長崎の個室・プライベートサウナ一覧｜異国情緒ある施設を比較 | サウナ子',
    description: '長崎の個室・プライベートサウナを探すならサウナ子。異国情緒あふれる街並みの個室サウナを掲載。料金・設備・アクセスを比較。',
  },
  kumamoto: {
    title: '熊本の個室・プライベートサウナ一覧｜阿蘇・天草の施設を比較 | サウナ子',
    description: '熊本の個室・プライベートサウナを探すならサウナ子。阿蘇・天草エリアの自然豊かな施設を掲載。料金・設備・アクセスを比較。',
  },
  oita: {
    title: '大分の個室・プライベートサウナ一覧｜別府・湯布院の温泉×サウナを比較 | サウナ子',
    description: '大分の個室・プライベートサウナを探すならサウナ子。おんせん県・大分の別府・湯布院エリアの施設を厳選。料金・設備・アクセスを比較。',
  },
  miyazaki: {
    title: '宮崎の個室・プライベートサウナ一覧｜南国リゾートサウナを比較 | サウナ子',
    description: '宮崎の個室・プライベートサウナを探すならサウナ子。南国の温暖な気候で楽しめるサウナ施設を掲載。料金・設備・アクセスを比較。',
  },
  kagoshima: {
    title: '鹿児島の個室・プライベートサウナ一覧｜桜島ビューの施設を比較 | サウナ子',
    description: '鹿児島の個室・プライベートサウナを探すならサウナ子。桜島を望む温泉大国ならではの施設を掲載。料金・設備・アクセスを比較。',
  },
  okinawa: {
    title: '沖縄の個室・プライベートサウナ一覧｜リゾートサウナを比較 | サウナ子',
    description: '沖縄の個室・プライベートサウナを探すならサウナ子。美しい海を眺めながら整えるリゾートサウナを掲載。料金・設備・アクセスを比較。',
  },
};

function generateAreaStats(facilities: Facility[]) {
  const total = facilities.length;
  if (total === 0) return null;

  const pricedFacilities = facilities.filter(f => f.priceMin > 0);
  const avgPrice = pricedFacilities.length > 0
    ? Math.round(pricedFacilities.reduce((sum, f) => sum + f.priceMin, 0) / pricedFacilities.length / 100) * 100
    : null;
  const minPrice = pricedFacilities.length > 0 ? Math.min(...pricedFacilities.map(f => f.priceMin)) : null;

  const waterBathCount = facilities.filter(f => f.features.waterBath).length;
  const selfLoylyCount = facilities.filter(f => f.features.selfLoyly).length;
  const outdoorAirCount = facilities.filter(f => f.features.outdoorAir).length;
  const coupleOkCount = facilities.filter(f => f.features.coupleOk).length;

  const stationFacilities = facilities.filter(f => f.nearestStation && (f.walkMinutes ?? 0) > 0);
  const avgWalkMinutes = stationFacilities.length > 0
    ? Math.round(stationFacilities.reduce((sum, f) => sum + (f.walkMinutes ?? 0), 0) / stationFacilities.length)
    : null;

  return {
    total,
    avgPrice,
    minPrice,
    waterBathCount,
    selfLoylyCount,
    outdoorAirCount,
    coupleOkCount,
    avgWalkMinutes,
    waterBathRate: Math.round((waterBathCount / total) * 100),
    selfLoylyRate: Math.round((selfLoylyCount / total) * 100),
    coupleOkRate: Math.round((coupleOkCount / total) * 100),
  };
}

function getNeighborPrefectures(currentCode: string): { code: string; label: string }[] {
  // Find the region that contains the current prefecture
  const currentRegion = REGION_GROUPS.find(r => r.prefectures.some(p => p.code === currentCode));
  if (!currentRegion) return [];

  // Get other prefectures from the same region
  const neighbors = currentRegion.prefectures.filter(p => p.code !== currentCode);
  return neighbors;
}

export async function generateStaticParams() {
  const prefectures = getAllPrefectures();
  return prefectures.map((prefecture) => ({ prefecture }));
}

export async function generateMetadata({ params }: PageProps) {
  const { prefecture } = await params;
  const prefData = PREFECTURES.find((p) => p.code === prefecture);
  if (!prefData) return { title: 'Not Found' };

  const customMeta = AREA_META[prefecture];
  const title = customMeta?.title ?? `${prefData.label}の個室・プライベートサウナ一覧 | サウナ子`;
  const description = customMeta?.description ?? `${prefData.label}の個室・プライベートサウナ・貸切サウナを探すならサウナ子。料金・設備・アクセスを比較して、あなたにぴったりの施設を見つけよう。`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.saunako.jp/area/${prefecture}`,
    },
    openGraph: {
      title,
      description,
    },
  };
}

function generateFaqData(facilities: Facility[], areaLabel: string) {
  const pricedFacilities = facilities.filter(f => f.priceMin > 0);
  const avgPrice = pricedFacilities.length > 0
    ? Math.round(pricedFacilities.reduce((sum, f) => sum + f.priceMin, 0) / pricedFacilities.length / 100) * 100
    : null;

  const popularNames = facilities
    .filter(f => f.images.length > 0)
    .slice(0, 3)
    .map(f => f.name);

  const coupleNames = facilities
    .filter(f => f.features.coupleOk)
    .slice(0, 3)
    .map(f => f.name);

  const faqs: { question: string; answer: string }[] = [];

  if (avgPrice) {
    faqs.push({
      question: `${areaLabel}の個室サウナの料金相場は？`,
      answer: `${areaLabel}の個室サウナの料金相場は1時間あたり約${avgPrice.toLocaleString()}円です。最安値は${Math.min(...pricedFacilities.map(f => f.priceMin)).toLocaleString()}円〜となっています。`,
    });
  }

  if (popularNames.length > 0) {
    faqs.push({
      question: `${areaLabel}で人気の個室サウナは？`,
      answer: `${areaLabel}で人気の個室サウナは${popularNames.join('、')}などがあります。それぞれ特徴が異なるので、設備や料金を比較して選ぶのがおすすめです。`,
    });
  }

  if (coupleNames.length > 0) {
    faqs.push({
      question: `${areaLabel}でカップルで利用できる個室サウナは？`,
      answer: `${areaLabel}でカップル（男女）で利用できる個室サウナは${coupleNames.join('、')}などがあります。事前予約がおすすめです。`,
    });
  }

  return faqs;
}

export default async function AreaPage({ params }: PageProps) {
  const { prefecture } = await params;
  const prefData = PREFECTURES.find((p) => p.code === prefecture);

  if (!prefData) {
    notFound();
  }

  const facilities = getFacilitiesByPrefecture(prefecture);
  const saunakoComment = SAUNAKO_AREA_COMMENTS[prefecture] || DEFAULT_SAUNAKO_COMMENT;
  const areaGroups = AREA_GROUPS[prefecture] || [];
  const areaCounts = getAreaFacilityCounts(prefecture);

  const areaStats = generateAreaStats(facilities);
  const neighborPrefectures = getNeighborPrefectures(prefecture);
  const prefCounts = getPrefectureFacilityCounts();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'TOP',
        item: 'https://www.saunako.jp/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: prefData.label,
        item: `https://www.saunako.jp/area/${prefecture}`,
      },
    ],
  };

  // FAQ JSON-LD
  const faqItems = generateFaqData(facilities, prefData.label);
  const faqJsonLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  } : null;

  // ItemList JSON-LD
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${prefData.label}の個室サウナ一覧`,
    numberOfItems: facilities.length,
    itemListElement: facilities.slice(0, 10).map((f, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: f.name,
      url: `https://www.saunako.jp/facilities/${f.id}`,
    })),
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary transition-colors">TOP</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">{prefData.label}</span>
        </nav>

        {/* Area Navigation */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {REGION_GROUPS.map((region) => (
            <div key={region.label} className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-text-tertiary whitespace-nowrap">{region.label}</span>
              <div className="flex gap-1.5">
                {region.prefectures.map((pref) => (
                  <Link
                    key={pref.code}
                    href={`/area/${pref.code}`}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      pref.code === prefecture
                        ? 'bg-primary text-white'
                        : 'bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary'
                    }`}
                  >
                    {pref.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Area Chips */}
        {areaGroups.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-white">
              すべて ({facilities.length})
            </span>
            {areaGroups.map((area) => (
              <Link
                key={area.slug}
                href={`/area/${prefecture}/${area.slug}`}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary"
              >
                {area.label} ({areaCounts[area.slug] || 0})
              </Link>
            ))}
          </div>
        )}

        {/* Area Header */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                {prefData.label}の個室サウナ
              </h1>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 bg-primary-light text-primary rounded-full text-sm font-semibold">
                  {facilities.length}件の施設
                </span>
                <span className="text-sm text-text-tertiary">
                  最終更新: {new Date().toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Saunako Comment Section */}
        <div className="saunako-comment mb-8">
          <div className="flex items-start gap-3">
            <Image
              src="/saunako-avatar.webp"
              alt="サウナ子"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-saunako font-bold">サウナ子</span>
                <span className="text-xs text-text-tertiary">からのひとこと</span>
              </div>
              <p className="text-text-primary leading-relaxed">
                {saunakoComment}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        {(() => {
          const faqs = generateFaqData(facilities, prefData.label);
          if (faqs.length === 0) return null;
          return (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-text-primary mb-4">よくある質問</h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <details key={i} className="bg-surface border border-border rounded-xl overflow-hidden group">
                    <summary className="px-5 py-4 cursor-pointer text-text-primary font-medium hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <span>{faq.question}</span>
                      <svg className="w-5 h-5 text-text-tertiary flex-shrink-0 ml-2 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-4 text-text-secondary text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Filters and Facility List (Client Component) */}
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="bg-surface border border-border rounded-xl h-16 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface border border-border rounded-xl h-64"></div>
              ))}
            </div>
          </div>
        }>
          <AreaFilters
            facilities={facilities}
            prefectureLabel={prefData.label}
          />
        </Suspense>

        {/* Area Stats Section */}
        {areaStats && (
          <section className="mt-12 mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4">{prefData.label}の個室サウナまとめ</h2>
            <div className="bg-surface border border-border rounded-xl p-5 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary">{areaStats.total}</p>
                  <p className="text-xs text-text-tertiary mt-1">掲載施設数</p>
                </div>
                {areaStats.minPrice && (
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-primary">{areaStats.minPrice.toLocaleString()}<span className="text-sm font-normal">円〜</span></p>
                    <p className="text-xs text-text-tertiary mt-1">最安料金 / 1時間</p>
                  </div>
                )}
                {areaStats.avgPrice && (
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-text-primary">{areaStats.avgPrice.toLocaleString()}<span className="text-sm font-normal">円</span></p>
                    <p className="text-xs text-text-tertiary mt-1">平均料金 / 1時間</p>
                  </div>
                )}
                {areaStats.avgWalkMinutes && (
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-text-primary">{areaStats.avgWalkMinutes}<span className="text-sm font-normal">分</span></p>
                    <p className="text-xs text-text-tertiary mt-1">駅からの平均徒歩</p>
                  </div>
                )}
              </div>
              <div className="border-t border-border mt-5 pt-5">
                <h3 className="text-sm font-semibold text-text-secondary mb-3">設備の充実度</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${areaStats.waterBathRate}%` }}></div>
                    </div>
                    <span className="text-xs text-text-tertiary whitespace-nowrap">水風呂 {areaStats.waterBathRate}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${areaStats.selfLoylyRate}%` }}></div>
                    </div>
                    <span className="text-xs text-text-tertiary whitespace-nowrap">ロウリュ {areaStats.selfLoylyRate}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${areaStats.coupleOkRate}%` }}></div>
                    </div>
                    <span className="text-xs text-text-tertiary whitespace-nowrap">カップル {areaStats.coupleOkRate}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-tertiary whitespace-nowrap">外気浴 {areaStats.outdoorAirCount}施設</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-secondary mt-5 leading-relaxed">
                {prefData.label}には現在{areaStats.total}件の個室サウナが掲載されています。
                {areaStats.avgPrice && `料金の相場は1時間あたり約${areaStats.avgPrice.toLocaleString()}円で、最安${areaStats.minPrice?.toLocaleString()}円から利用できます。`}
                {areaStats.coupleOkCount > 0 && `カップルで利用できる施設は${areaStats.coupleOkCount}件あります。`}
                {areaStats.waterBathCount > 0 && `水風呂を完備している施設は${areaStats.waterBathCount}件（${areaStats.waterBathRate}%）です。`}
              </p>
            </div>
          </section>
        )}

        {/* Nearby Area Links */}
        {neighborPrefectures.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4">近くのエリアの個室サウナ</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {neighborPrefectures.map((pref) => (
                <Link
                  key={pref.code}
                  href={`/area/${pref.code}`}
                  className="bg-surface border border-border rounded-xl p-4 hover:border-primary hover:shadow-sm transition-all text-center"
                >
                  <span className="text-sm font-medium text-text-primary">{pref.label}</span>
                  <span className="block text-xs text-text-tertiary mt-1">
                    {prefCounts[pref.code] || 0}件の施設
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
        {/* エリア関連記事 */}
        {(() => {
          const areaArticles = [...new Map(
            facilities.flatMap((f) => getArticlesByFacilityId(f.id)).map((a) => [a.slug, a])
          ).values()].slice(0, 3);
          if (areaArticles.length === 0) return null;
          return (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-text-primary mb-4">{prefData.label}の個室サウナに関する記事</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {areaArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </section>
          );
        })()}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
