import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import { PublicationModel } from "@/models/Publication";

async function getLatestPublications() {
  try {
    await dbConnect();
    const items = await PublicationModel.find({ status: "public" })
      .populate("author", "name")
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean() as any[];
    return items;
  } catch {
    return [];
  }
}

export default async function Home() {
  const latest = await getLatestPublications();

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "var(--color-ijf-bg)", color: "var(--color-ijf-surface)" }}>

      {/* HERO */}
      <section className="relative w-full h-[700px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img src="/images/home-hero.jpg" alt="Irish Jazz Performance" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/70"></div>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-8">
          <span className="inline-block text-sm tracking-widest uppercase mb-4 font-bold" style={{ color: "var(--color-ijf-accent)" }}>
            National Sector Platform
          </span>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg">
            Irish Jazz Forum
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-white/90 max-w-2xl drop-shadow-md">
            A unified national voice for jazz and improvised music in Ireland — supporting artists, presenters, educators, festivals, labels, and audiences across the island.
          </p>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="w-full py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center gap-8 mb-16">
            <img src="/images/IJF_Logo.png" alt="Irish Jazz Forum" className="w-24 h-24 object-contain flex-shrink-0" />
            <div>
              <h2 className="text-4xl font-bold mb-4" style={{ color: "var(--color-ijf-primary)" }}>Our Mission</h2>
              <p className="text-lg text-gray-600 max-w-2xl">Three pillars guide our work to strengthen Ireland's jazz community</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Advocacy", img: "/images/advocacy-image.jpg", text: "Coordinating national representation to funders, policymakers, and cultural partners, ensuring the needs of the jazz community are clearly communicated." },
              { title: "Development", img: "/images/development-image.jpg", text: "Strengthening Ireland's jazz infrastructure — regional networking, data-sharing, audience development, and fair artist working conditions." },
              { title: "Collaboration", img: "/images/collaboration-image.jpg", text: "Connecting festivals, venues, artists, educators, and labels to create a stronger, more sustainable, all-island jazz ecosystem." },
            ].map(({ title, img, text }) => (
              <div key={title} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition group">
                <div className="h-64 overflow-hidden">
                  <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4" style={{ color: "var(--color-ijf-primary)" }}>{title}</h3>
                  <p className="text-gray-600 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="py-24" style={{ backgroundColor: "var(--color-ijf-bg)", color: "var(--color-ijf-surface)" }}>
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-4xl font-bold mb-8" style={{ color: "var(--color-ijf-accent)" }}>What We Do</h2>
          <p className="text-lg leading-8 mb-12 text-gray-300">
            The Irish Jazz Forum brings together promoters, artists, educators, festivals, venues, labels, and sector leaders to articulate shared needs, support the development of national policy, and strengthen the ecosystem of jazz and improvised music in Ireland.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Represent the Irish jazz sector nationally with unified messaging",
              "Develop shared data and sector insights",
              "Build regional connections and cross-border collaboration",
              "Advocate for fair artist pay and sustainable conditions",
            ].map((item) => (
              <div key={item} className="flex items-start gap-4 p-6 rounded-lg" style={{ backgroundColor: "rgba(228, 185, 91, 0.1)" }}>
                <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: "var(--color-ijf-accent)" }}></div>
                <p className="text-lg text-gray-300">{item}</p>
              </div>
            ))}
            <div className="flex items-start gap-4 p-6 rounded-lg md:col-span-2" style={{ backgroundColor: "rgba(228, 185, 91, 0.1)" }}>
              <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: "var(--color-ijf-accent)" }}></div>
              <p className="text-lg text-gray-300">Support the creation of a coordinated national strategy for jazz</p>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST FROM IJF */}
      {latest.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-8">

            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold" style={{ color: "var(--color-ijf-primary)" }}>Latest from IJF</h2>
                <p className="text-gray-500 mt-2">News and resources from the Irish Jazz Forum</p>
              </div>
              <Link href="/news" className="text-sm font-semibold hover:underline" style={{ color: "var(--color-ijf-accent)" }}>
                View all →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {latest.map((item: any) => {
                const href = item.category === "news" ? `/news/${item.slug}` : `/resources/${item.slug}`;
                const date = item.publishedAt
                  ? new Date(item.publishedAt).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" })
                  : null;

                return (
                  <Link key={item._id} href={href} className="group block bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                    {/* Image or category colour band */}
                    {item.images?.[0] ? (
                      <div className="h-48 overflow-hidden">
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      </div>
                    ) : (
                      <div className="h-3 w-full" style={{ backgroundColor: item.category === "news" ? "var(--color-ijf-primary)" : "var(--color-ijf-accent)" }} />
                    )}

                    <div className="p-6">
                      {/* Category + date */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{ backgroundColor: item.category === "news" ? "rgba(155,29,29,0.08)" : "rgba(228,185,91,0.15)", color: item.category === "news" ? "var(--color-ijf-primary)" : "#92660a" }}>
                          {item.category === "news" ? "News" : item.resourceType || "Resource"}
                        </span>
                        {date && <span className="text-xs text-gray-400">{date}</span>}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:underline">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                        {item.excerpt}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/cta-background.jpg" alt="Get Involved" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(155, 29, 29, 0.95), rgba(228, 185, 91, 0.85))" }}></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center text-white">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">Get Involved</h2>
          <p className="text-xl md:text-2xl leading-relaxed mb-12 max-w-2xl mx-auto drop-shadow-md">
            The Forum welcomes participation from musicians, educators, venues, festivals, students, organisations, and supporters of Irish jazz. As we build our digital infrastructure, we'll share ways to collaborate and contribute.
          </p>
          <a href="/contact" className="inline-block px-12 py-5 bg-white font-bold text-lg rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl" style={{ color: "var(--color-ijf-primary)" }}>
            Contact Us →
          </a>
        </div>
      </section>

    </div>
  );
}