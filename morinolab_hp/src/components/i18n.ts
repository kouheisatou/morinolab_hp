import type { Lang } from "./LanguageContext";

type Texts = {
  navbar: Record<string, string>;
  home: {
    title: string;
    body: string;
    announcementsTitle: string;
    updatesTitle: string;
    researchTitle: string;
  };
  access: { title: string; body: string };
  members: { title: string };
  research: { title: string; body: string };
  publications: { title: string };
  class: { title: string };
  awards: { title: string };
};

const en: Texts = {
  navbar: {
    Home: "Morino Lab",
    Access: "Access",
    Members: "Members",
    Research: "Research",
    Publications: "Publications",
    Class: "Class",
    Awards: "Awards",
    Language: "Language",
    Toggle: "日本語",
  },
  home: {
    title: "Mobile Communication Network Laboratory",
    body: "Welcome to the Morino Laboratory at Shibaura Institute of Technology. Our research focuses on autonomous and distributed networks enabling ubiquitous connectivity.",
    announcementsTitle: "Announcements",
    updatesTitle: "Updates",
    researchTitle: "Research Themes",
  },
  access: {
    title: "Access",
    body: "Toyosu Campus 12-I-32, 3-7-5 Toyosu, Koto-ku, Tokyo. 7 min from Toyosu St. (Yurakucho Line).",
  },
  members: { title: "Members" },
  research: {
    title: "Research",
    body: "We study user-participatory autonomous distributed networks, focusing on multi-hop wireless LAN, P2P streaming, blockchain, and 3D point-cloud sensing.",
  },
  publications: { title: "Publications" },
  class: { title: "Classes / Lectures" },
  awards: { title: "Awards" },
};

const ja: Texts = {
  navbar: {
    Home: "森野研究室",
    Access: "アクセス",
    Members: "メンバー",
    Research: "研究内容",
    Publications: "論文",
    Class: "講義",
    Awards: "受賞",
    Language: "Language",
    Toggle: "English",
  },
  home: {
    title: "移動通信ネットワーク研究室",
    body: "森野研究室のホームページへようこそ。私たちは自律分散ネットワークや3次元点群センシングなどの研究に取り組んでいます。",
    announcementsTitle: "お知らせ",
    updatesTitle: "更新履歴",
    researchTitle: "研究テーマ",
  },
  access: {
    title: "アクセス",
    body: "東京都江東区豊洲3-7-5 芝浦工業大学豊洲キャンパス 研究棟12階 12-I-32。有楽町線豊洲駅徒歩7分。",
  },
  members: { title: "メンバー" },
  research: {
    title: "研究内容",
    body: "ユーザ参加型の自律分散ネットワーク、多段無線LAN、P2Pストリーミング、ブロックチェーン決済チャネル、3次元点群センシング等を対象としています。",
  },
  publications: { title: "論文" },
  class: { title: "講義" },
  awards: { title: "受賞" },
};

export const texts = (lang: Lang) => (lang === "ja" ? ja : en);
