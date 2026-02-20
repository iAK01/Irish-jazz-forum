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
                  className="flex gap-6 border border-gray-200 rounded-xl p-5 hover:border-ijf-accent hover:shadow-sm transition-all"
                >
                  {/* Thumbnail */}
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
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
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h2>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{item.excerpt}</p>
                    {item.publishedAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(item.publishedAt).toLocaleDateString("en-IE", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

    </>
  );
}