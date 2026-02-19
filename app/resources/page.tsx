// app/resources/page.tsx

import Link from "next/link";


async function getResources() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/publications?category=resource`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

const resourceTypeLabel: Record<string, string> = {
  policy: "Policy",
  data: "Data & Research",
  guidance: "Guidance",
  statement: "Statement",
  other: "Other",
};

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <>
   
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Resources</h1>
            <p className="text-lg text-gray-600">
              Policy documents, sector data, guidance, and reference materials from the Irish Jazz Forum.
            </p>
          </div>

          {resources.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>No resources published yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {resources.map((item: any) => (
                <Link
                  key={item._id}
                  href={`/resources/${item.slug}`}
                  className="block border border-gray-200 rounded-lg p-6 hover:border-ijf-accent hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
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
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h2>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.excerpt}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  {item.publishedAt && (
                    <p className="text-xs text-gray-400 mt-4">
                      Published {new Date(item.publishedAt).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}