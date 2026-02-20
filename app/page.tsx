import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--color-ijf-bg)', color: 'var(--color-ijf-surface)' }}>
      
      {/* HERO SECTION - Full width with background image */}
      <section className="relative w-full h-[700px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/home-hero.jpg" 
            alt="Irish Jazz Performance"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-8">
          <span className="inline-block text-sm tracking-widest uppercase mb-4 font-bold" style={{ color: 'var(--color-ijf-accent)' }}>
            National Sector Platform
          </span>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg">
            Irish Jazz Forum
          </h1>

          <p className="text-xl md:text-2xl leading-relaxed text-white/90 max-w-2xl drop-shadow-md">
            A unified national voice for jazz and improvised music in Ireland — 
            supporting artists, presenters, educators, festivals, labels, and audiences 
            across the island.
          </p>
        </div>
      </section>

      {/* THREE-PILLARS SECTION - Cards with images */}
      <section className="w-full py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          
        <div className="flex items-center gap-8 mb-16">
  <img
    src="/images/IJF_Logo.png"
    alt="Irish Jazz Forum"
    className="w-24 h-24 object-contain flex-shrink-0"
  />
  <div>
    <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-ijf-primary)' }}>
      Our Mission
    </h2>
    <p className="text-lg text-gray-600 max-w-2xl">
      Three pillars guide our work to strengthen Ireland's jazz community
    </p>
  </div>
</div>

          <div className="grid md:grid-cols-3 gap-10">

            {/* Advocacy Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition group">
              <div className="h-64 overflow-hidden">
                <img 
                  src="/images/advocacy-image.jpg" 
                  alt="Advocacy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-ijf-primary)' }}>
                  Advocacy
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Coordinating national representation to funders, policymakers, and cultural 
                  partners, ensuring the needs of the jazz community are clearly communicated.
                </p>
              </div>
            </div>

            {/* Development Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition group">
              <div className="h-64 overflow-hidden">
                <img 
                  src="/images/development-image.jpg" 
                  alt="Development"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-ijf-primary)' }}>
                  Development
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Strengthening Ireland's jazz infrastructure — regional networking, data-sharing, 
                  audience development, and fair artist working conditions.
                </p>
              </div>
            </div>

            {/* Collaboration Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition group">
              <div className="h-64 overflow-hidden">
                <img 
                  src="/images/collaboration-image.jpg" 
                  alt="Collaboration"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-ijf-primary)' }}>
                  Collaboration
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Connecting festivals, venues, artists, educators, and labels to create 
                  a stronger, more sustainable, all-island jazz ecosystem.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHAT WE DO SECTION */}
      <section className="py-24" style={{ backgroundColor: 'var(--color-ijf-bg)', color: 'var(--color-ijf-surface)' }}>
        <div className="max-w-4xl mx-auto px-8">

          <h2 className="text-4xl font-bold mb-8" style={{ color: 'var(--color-ijf-accent)' }}>
            What We Do
          </h2>

          <p className="text-lg leading-8 mb-12 text-gray-300">
            The Irish Jazz Forum brings together promoters, artists, educators, festivals, 
            venues, labels, and sector leaders to articulate shared needs, support the 
            development of national policy, and strengthen the ecosystem of jazz and 
            improvised music in Ireland.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-6 rounded-lg" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)' }}>
              <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></div>
              <p className="text-lg text-gray-300">
                Represent the Irish jazz sector nationally with unified messaging
              </p>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)' }}>
              <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></div>
              <p className="text-lg text-gray-300">
                Develop shared data and sector insights
              </p>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)' }}>
              <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></div>
              <p className="text-lg text-gray-300">
                Build regional connections and cross-border collaboration
              </p>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)' }}>
              <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></div>
              <p className="text-lg text-gray-300">
                Advocate for fair artist pay and sustainable conditions
              </p>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg md:col-span-2" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)' }}>
              <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></div>
              <p className="text-lg text-gray-300">
                Support the creation of a coordinated national strategy for jazz
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CALL TO ACTION - Background image */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/cta-background.jpg" 
            alt="Get Involved"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(155, 29, 29, 0.95), rgba(228, 185, 91, 0.85))' }}></div>
        </div>

        {/* CTA Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center text-white">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Get Involved
          </h2>

          <p className="text-xl md:text-2xl leading-relaxed mb-12 max-w-2xl mx-auto drop-shadow-md">
            The Forum welcomes participation from musicians, educators, venues, festivals, 
            students, organisations, and supporters of Irish jazz. As we build our digital 
            infrastructure, we'll share ways to collaborate and contribute.
          </p>

          <a
            href="/contact"
            className="inline-block px-12 py-5 bg-white font-bold text-lg rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
            style={{ color: 'var(--color-ijf-primary)' }}
          >
            Contact Us →
          </a>
        </div>
      </section>

    </div>
  );
}