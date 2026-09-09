import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "拾物 · 产品发现库",
  description: "提交产品链接，整理介绍、标签与缩略图，构建你的产品发现库。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
