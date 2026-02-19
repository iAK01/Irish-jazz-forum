// app/news/page.tsx

import Link from "next/link";

async function getNews() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/publications?category=news`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <>
  
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">News</h1>
            <p className="text-lg text-gray-600">
              Updates, statements, and announcements from the Irish Jazz Forum.
            </p>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>No news items published yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {news.map((item: any) => (
                <article
                  key={item._id}
                  className="border-b border-gray-200 pb-8 last:border-0"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {item.tags?.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded capitalize"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.status === "members_only" && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                        Members only
                      </span>
                    )}
                  </div>

                  <Link href={`/news/${item.slug}`}>
                    <h2 className="text-2xl font-bold text-gray-900 hover:text-ijf-accent transition-colors mb-3">
                      {item.title}
                    </h2>
                  </Link>

                  <p className="text-gray-600 mb-4 leading-relaxed">{item.excerpt}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString("en-IE", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                    <Link
                      href={`/news/${item.slug}`}
                      className="text-sm font-medium text-ijf-accent hover:underline"
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}