export default function AboutPage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--color-ijf-bg)', color: 'var(--color-ijf-surface)' }}>
      
      {/* HERO SECTION - Full width image with overlay */}
      <section className="relative w-full h-[600px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-jazz.jpg" 
            alt="Irish Jazz Performance"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
          <span className="inline-block text-sm tracking-widest uppercase mb-4 font-bold" style={{ color: 'var(--color-ijf-accent)' }}>
            About the Forum
          </span>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg">
            Who We Are
          </h1>

          <p className="text-xl md:text-2xl leading-relaxed text-white/95 max-w-3xl mx-auto drop-shadow-md">
            The Irish Jazz Forum is a collective voice for jazz in Ireland. We bring together 
            professional organisations, festivals, venues, musicians, educators, media representatives, 
            and audience voices, alongside grassroots and emerging initiatives.
          </p>
        </div>
      </section>

      {/* WHY WE EXIST - Card Layout with Image */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Image Column */}
            <div className="order-2 md:order-1">
              <img 
                src="/images/musicians-collaboration.jpg" 
                alt="Musicians collaborating"
                className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            </div>

            {/* Text Column */}
            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-bold mb-8" style={{ color: 'var(--color-ijf-primary)' }}>
                Why We Exist
              </h2>

              <div className="space-y-6 text-lg leading-8 text-gray-800">
                <p>
                  The Irish Jazz Forum was established to provide a voice for the Irish jazz community, 
                  to represent jazz practitioners and organisations working in the sector, and to ensure 
                  that there is a voice and representation for Irish jazz in national cultural policy 
                  and music development strategies.
                </p>

                <p>
                  The Forum seeks to draw on the experiences of its members to speak authoritatively 
                  on a range of issues, including the infrastructure, organisational, structural and 
                  fiscal supports available to support Irish jazz practitioners and audiences.
                </p>

                <div className="border-l-4 p-6 rounded-r-lg" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)', borderColor: 'var(--color-ijf-accent)' }}>
                  <p className="font-semibold text-xl" style={{ color: 'var(--color-ijf-primary)' }}>
                    Our goal is to secure a sustainable future for the jazz music community and its 
                    practitioners in Ireland.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* OUR INTENT - Dark red background with white text */}
      <section className="py-24 text-white" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
        <div className="max-w-5xl mx-auto px-8">

          <h2 className="text-4xl font-bold mb-12 text-center">
            Our Intent
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            
            {/* Card 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition">
              <h3 className="text-2xl font-bold mb-4">Research & Data</h3>
              <p className="text-white/90 text-lg">
                Through collective discussion, surveys, and comparative research with our European neighbours.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition">
              <h3 className="text-2xl font-bold mb-4">Clear Recommendations</h3>
              <p className="text-white/90 text-lg">
                Present evidence-based recommendations to Government and the Arts Council.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition">
              <h3 className="text-2xl font-bold mb-4">Collective Voice</h3>
              <p className="text-white/90 text-lg">
                Our recommendations are as strong as the collective knowledge we bring together.
              </p>
            </div>

          </div>

          <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl p-10">
            <p className="text-xl leading-relaxed mb-6">
              We are committed to gathering and publishing data regularly, creating a clear 
              evidence base to track progress and inform future policy.
            </p>

            <p className="text-2xl font-bold">
              These recommendations come at an important time. The Arts Council is consulting 
              on its Irish Music Policy, and it is our intention that our recommendations represent 
              the needs of the jazz community fairly and clearly.
            </p>
          </div>

        </div>
      </section>

      {/* OUR STORY - Image Right */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Text Column */}
            <div>
              <h2 className="text-4xl font-bold mb-8" style={{ color: 'var(--color-ijf-primary)' }}>
                Our Story
              </h2>

              <div className="space-y-6 text-lg leading-8 text-gray-800">
                <p>
                  The Irish Jazz Forum was established in August 2021 to discuss the current status 
                  of jazz in Ireland — from its infrastructure and organisational supports, to the 
                  working conditions of its key practitioners.
                </p>

                <p>
                  Together, we represent the breadth and diversity of Ireland's jazz community, 
                  working collectively to outline the necessary steps to secure a sustainable future 
                  for jazz music and its practitioners across the island.
                </p>

                <div className="flex gap-4 mt-8">
                  <div className="rounded-lg p-6 flex-1 text-center" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)' }}>
                    <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-ijf-primary)' }}>2021</div>
                    <div className="text-sm text-gray-600">Founded</div>
                  </div>
                  <div className="rounded-lg p-6 flex-1 text-center" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)' }}>
                    <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-ijf-primary)' }}>32</div>
                    <div className="text-sm text-gray-600">Counties of Ireland</div>
                  </div>
                  <div className="rounded-lg p-6 flex-1 text-center" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)' }}>
                    <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-ijf-primary)' }}>∞</div>
                    <div className="text-sm text-gray-600">Voices United</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Column */}
            <div>
              <img 
                src="/images/venue-crowd.jpg" 
                alt="Jazz venue and engaged audience"
                className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            </div>

          </div>
        </div>
      </section>

      {/* CTA SECTION - Bold and engaging */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Image with overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/community-jazz.jpg" 
            alt="Jazz community"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(155, 29, 29, 0.95), rgba(228, 185, 91, 0.9))' }}></div>
        </div>

        {/* CTA Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center text-white">

          <h2 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Join the Conversation
          </h2>

          <p className="text-xl md:text-2xl leading-relaxed mb-12 max-w-2xl mx-auto drop-shadow-md">
            The Forum welcomes participation from musicians, educators, venues, festivals, 
            and all supporters of Irish jazz. Together, we're building a stronger, more 
            sustainable future for jazz in Ireland.
          </p>

          <a
            href="/contact"
            className="inline-block px-12 py-5 bg-white font-bold text-lg rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
            style={{ color: 'var(--color-ijf-primary)' }}
          >
            Get Involved →
          </a>

        </div>
      </section>

    </div>
  );
}