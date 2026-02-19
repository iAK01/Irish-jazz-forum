export default function PrinciplesPage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--color-ijf-bg)', color: 'var(--color-ijf-surface)' }}>
      
      {/* HERO SECTION - Full width with background image */}
      <section className="relative w-full h-[600px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/principles-hero.jpg" 
            alt="Principles"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
          <span className="inline-block text-sm tracking-widest uppercase mb-4 font-bold" style={{ color: 'var(--color-ijf-accent)' }}>
            Our Foundation
          </span>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg">
            Principles of the Irish Jazz Forum
          </h1>

          <p className="text-xl md:text-2xl leading-relaxed text-white/95 max-w-3xl mx-auto drop-shadow-md">
            These principles guide our work as a collective voice for jazz in Ireland, 
            ensuring we represent the breadth and diversity of our community with 
            integrity, transparency, and collaboration.
          </p>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">

          <h2 className="text-4xl font-bold mb-8" style={{ color: 'var(--color-ijf-primary)' }}>
            Who We Are
          </h2>

          <p className="text-lg leading-8 text-gray-800">
            The Irish Jazz Forum is a collective voice for jazz in Ireland. We bring together 
            professional organisations, festivals, venues, musicians, educators, media representatives, 
            and audience voices, alongside grassroots and emerging initiatives. Together, we represent 
            the breadth and diversity of Ireland's jazz community.
          </p>

        </div>
      </section>

      {/* WHY WE EXIST */}
      <section className="py-24" style={{ backgroundColor: 'var(--color-ijf-bg)', color: 'var(--color-ijf-surface)' }}>
        <div className="max-w-4xl mx-auto px-8">

          <h2 className="text-4xl font-bold mb-8" style={{ color: 'var(--color-ijf-accent)' }}>
            Why We Exist
          </h2>

          <div className="space-y-6 text-lg leading-8 text-gray-300">
            <p className="font-semibold text-xl mb-6" style={{ color: 'var(--color-ijf-accent)' }}>
              The Forum was created to:
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)' }}>
                <span className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></span>
                <span>Represent and advocate for jazz practitioners and organisations at national level</span>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)' }}>
                <span className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></span>
                <span>Address the structural, organisational, and fiscal supports needed for jazz in Ireland</span>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)' }}>
                <span className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></span>
                <span>Secure a sustainable future for artists, audiences, and the wider community</span>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)' }}>
                <span className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></span>
                <span>Ensure that jazz is clearly and fairly represented within national music policy and cultural strategy</span>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)' }}>
                <span className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></span>
                <span>Provide a unified voice for jazz, built through shared discussion and collective agreement</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* OUR INTENT */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">

          <h2 className="text-4xl font-bold mb-8" style={{ color: 'var(--color-ijf-primary)' }}>
            Our Intent
          </h2>

          <div className="space-y-6 text-lg leading-8 text-gray-800">
            <p>
              Through collective discussion, surveys, fact-gathering, and comparative research with 
              our European neighbours, the Forum will present clear recommendations to Government and 
              the Arts Council, setting out the minimum requirements needed to sustain and grow jazz 
              in Ireland.
            </p>

            <div className="bg-white border-l-4 p-8 rounded-r-lg shadow-lg" style={{ borderColor: 'var(--color-ijf-primary)' }}>
              <p className="font-semibold text-xl" style={{ color: 'var(--color-ijf-primary)' }}>
                This work depends on every member sharing data, insight, and experience — our 
                recommendations will be as strong as the collective knowledge we bring together.
              </p>
            </div>

            <p>
              We are committed to gathering and publishing data regularly, creating a clear evidence 
              base to track progress and inform future policy.
            </p>
          </div>

        </div>
      </section>

      {/* OUR GOALS */}
      <section className="py-24" style={{ backgroundColor: 'var(--color-ijf-bg)', color: 'var(--color-ijf-surface)' }}>
        <div className="max-w-6xl mx-auto px-8">

          <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: 'var(--color-ijf-accent)' }}>
            Our Goals
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-ijf-accent)' }}>
                National Recognition
              </h3>
              <p className="text-gray-300 leading-7 text-sm">
                Establish a recognised national voice for jazz, trusted by Government and funders
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-ijf-accent)' }}>
                Sustainable Funding
              </h3>
              <p className="text-gray-300 leading-7 text-sm">
                Secure increased, sustainable funding for jazz at local, regional, and national levels
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-ijf-accent)' }}>
                Infrastructure Development
              </h3>
              <p className="text-gray-300 leading-7 text-sm">
                Strengthen touring networks, rehearsal spaces, and performance venues across Ireland
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-ijf-accent)' }}>
                Fair Working Conditions
              </h3>
              <p className="text-gray-300 leading-7 text-sm">
                Advocate for sustainable artist fees, employment standards, and career pathways
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-ijf-accent)' }}>
                Education & Development
              </h3>
              <p className="text-gray-300 leading-7 text-sm">
                Support jazz education initiatives, youth programmes, and professional development
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-ijf-accent)' }}>
                Audience Growth
              </h3>
              <p className="text-gray-300 leading-7 text-sm">
                Expand and diversify audiences through innovative programming and community engagement
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-ijf-accent)' }}>
                Cross-Border Collaboration
              </h3>
              <p className="text-gray-300 leading-7 text-sm">
                Foster all-island partnerships and strengthen connections with international networks
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-ijf-accent)' }}>
                Inclusion & Diversity
              </h3>
              <p className="text-gray-300 leading-7 text-sm">
                Ensure the sector reflects Ireland's diverse communities and removes barriers to participation
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-32" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
        <div className="max-w-5xl mx-auto px-8">

          <h2 className="text-5xl font-bold mb-16 text-center text-white">
            Our Core Values
          </h2>

          <div className="grid md:grid-cols-2 gap-10">
            
            <div className="bg-white/10 backdrop-blur-sm p-10 rounded-2xl border border-white/20 text-center hover:bg-white/15 transition">
              <h3 className="text-3xl font-bold mb-4 text-white">Collaboration</h3>
              <p className="text-white/90 leading-7 text-lg">
                Sector-first, not organisation-first
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-10 rounded-2xl border border-white/20 text-center hover:bg-white/15 transition">
              <h3 className="text-3xl font-bold mb-4 text-white">Transparency</h3>
              <p className="text-white/90 leading-7 text-lg">
                Open communication and shared information
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-10 rounded-2xl border border-white/20 text-center hover:bg-white/15 transition">
              <h3 className="text-3xl font-bold mb-4 text-white">Inclusion</h3>
              <p className="text-white/90 leading-7 text-lg">
                Representation of diverse voices, regions, and identities
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-10 rounded-2xl border border-white/20 text-center hover:bg-white/15 transition">
              <h3 className="text-3xl font-bold mb-4 text-white">Integrity</h3>
              <p className="text-white/90 leading-7 text-lg">
                Artistic independence and fair representation
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-10 rounded-2xl border border-white/20 text-center md:col-span-2 hover:bg-white/15 transition">
              <h3 className="text-3xl font-bold mb-4 text-white">Sustainability</h3>
              <p className="text-white/90 leading-7 text-lg">
                Long-term thinking, environmental responsibility, and fair working conditions
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}