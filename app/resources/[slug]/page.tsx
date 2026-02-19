// app/resources/[slug]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

async function getPublication(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/publications/${slug}`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

const resourceTypeLabel: Record<string, string> = {
  policy: "Policy",
  data: "Data & Research",
  guidance: "Guidance",
  statement: "Statement",
  other: "Other",
};

export default async function ResourceItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getPublication(slug);

  if (!item || item.category !== "resource") notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="mb-8">
            <Link href="/resources" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              ← Back to Resources
            </Link>
          </div>

          <article>
            <header className="mb-10">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {item.resourceType && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {resourceTypeLabel[item.resourceType] || item.resourceType}
                  </span>
                )}
                {item.status === "members_only" && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                    Members only
                  </span>
                )}
                {item.tags?.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded capitalize">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{item.title}</h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-6">{item.excerpt}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-b border-gray-100 py-4">
                {item.publishedAt && (
                  <span>
                    {new Date(item.publishedAt).toLocaleDateString("en-IE", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                )}
                {item.author?.name && <span>By {item.author.name}</span>}
              </div>
            </header>

            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: item.body }}
            />

            {item.attachments?.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Attachments
                </h3>
                <div className="space-y-2">
                  {item.attachments.map((att: any, i: number) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-ijf-accent hover:underline text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {att.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}