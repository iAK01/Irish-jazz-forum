export default function CharterPage() {
  return (
    <div className="min-h-screen font-sans bg-white">
      
      {/* HERO - Subdued, professional */}
      <section className="w-full py-20" style={{ backgroundColor: 'var(--color-ijf-bg)' }}>
        <div className="max-w-4xl mx-auto px-8">
          
          <span className="inline-block text-sm tracking-widest uppercase mb-4 font-bold" style={{ color: 'var(--color-ijf-accent)' }}>
            Governance
          </span>

          <h1 className="text-5xl font-extrabold tracking-tight text-white mb-6">
            Irish Jazz Forum Charter
          </h1>

          <p className="text-xl leading-relaxed text-gray-300 max-w-3xl mb-8">
            This charter defines our structure, values, and operating principles as we work 
            together to build a unified, national platform for Ireland's jazz and improvised 
            music sector.
          </p>

          <a
            href="/documents/IJF-Charter.pdf"
            className="inline-block px-8 py-3 font-semibold rounded-lg transition shadow-lg"
            style={{ backgroundColor: 'var(--color-ijf-accent)', color: 'var(--color-ijf-bg)' }}
          >
            Download Charter PDF →
          </a>

        </div>
      </section>

      {/* TABLE OF CONTENTS */}
      <section className="w-full py-8 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="#purpose" className="hover:underline" style={{ color: 'var(--color-ijf-primary)' }}>1. Purpose</a>
            <span className="text-gray-400">|</span>
            <a href="#values" className="hover:underline" style={{ color: 'var(--color-ijf-primary)' }}>2. Values</a>
            <span className="text-gray-400">|</span>
            <a href="#membership" className="hover:underline" style={{ color: 'var(--color-ijf-primary)' }}>3. Membership</a>
            <span className="text-gray-400">|</span>
            <a href="#structure" className="hover:underline" style={{ color: 'var(--color-ijf-primary)' }}>4. Structure</a>
            <span className="text-gray-400">|</span>
            <a href="#decision-making" className="hover:underline" style={{ color: 'var(--color-ijf-primary)' }}>5. Decision-Making</a>
            <span className="text-gray-400">|</span>
            <a href="#communication" className="hover:underline" style={{ color: 'var(--color-ijf-primary)' }}>6. Communication</a>
            <span className="text-gray-400">|</span>
            <a href="#data" className="hover:underline" style={{ color: 'var(--color-ijf-primary)' }}>7. Data</a>
            <span className="text-gray-400">|</span>
            <a href="#external" className="hover:underline" style={{ color: 'var(--color-ijf-primary)' }}>8. External Relations</a>
            <span className="text-gray-400">|</span>
            <a href="#accountability" className="hover:underline" style={{ color: 'var(--color-ijf-primary)' }}>9. Accountability</a>
            <span className="text-gray-400">|</span>
            <a href="#amendments" className="hover:underline" style={{ color: 'var(--color-ijf-primary)' }}>10. Amendments</a>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto px-8 py-16">

        {/* PURPOSE */}
        <section id="purpose" className="mb-20 scroll-mt-20">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
              1
            </div>
            <h2 className="text-3xl font-bold mt-2" style={{ color: 'var(--color-ijf-primary)' }}>
              Purpose
            </h2>
          </div>

          <div className="space-y-4 text-lg leading-8 text-gray-800 ml-16">
            <p>
              The Irish Jazz Forum exists to provide a unified, national platform for Ireland's 
              jazz and improvised music sector.
            </p>
            <p>
              Its purpose is to coordinate the sector's needs, strengthen advocacy, develop shared 
              infrastructure, and represent the interests of artists, promoters, educators, festivals, 
              and organisations across the island.
            </p>
          </div>
        </section>

        {/* VALUES */}
        <section id="values" className="mb-20 scroll-mt-20">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
              2
            </div>
            <h2 className="text-3xl font-bold mt-2" style={{ color: 'var(--color-ijf-primary)' }}>
              Values and Principles
            </h2>
          </div>

          <div className="space-y-3 text-lg leading-8 text-gray-800 ml-16">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-l-4" style={{ borderColor: 'var(--color-ijf-accent)' }}>
              <span className="font-bold" style={{ color: 'var(--color-ijf-accent)' }}>Collaboration</span>
              <span>—</span>
              <span>sector-first, not organisation-first</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-l-4" style={{ borderColor: 'var(--color-ijf-accent)' }}>
              <span className="font-bold" style={{ color: 'var(--color-ijf-accent)' }}>Transparency</span>
              <span>—</span>
              <span>open communication and shared information</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-l-4" style={{ borderColor: 'var(--color-ijf-accent)' }}>
              <span className="font-bold" style={{ color: 'var(--color-ijf-accent)' }}>Inclusion</span>
              <span>—</span>
              <span>representation of diverse voices, regions, and identities</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-l-4" style={{ borderColor: 'var(--color-ijf-accent)' }}>
              <span className="font-bold" style={{ color: 'var(--color-ijf-accent)' }}>Integrity</span>
              <span>—</span>
              <span>artistic independence and fair representation of Irish artists</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-l-4" style={{ borderColor: 'var(--color-ijf-accent)' }}>
              <span className="font-bold" style={{ color: 'var(--color-ijf-accent)' }}>Sustainability</span>
              <span>—</span>
              <span>long-term thinking, environmental responsibility, and fair working conditions</span>
            </div>
          </div>
        </section>

        {/* MEMBERSHIP */}
        <section id="membership" className="mb-20 scroll-mt-20">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
              3
            </div>
            <h2 className="text-3xl font-bold mt-2" style={{ color: 'var(--color-ijf-primary)' }}>
              Membership
            </h2>
          </div>

          <div className="ml-16">
            <p className="text-lg leading-8 text-gray-800 mb-6">
              The Forum is open to:
            </p>

            <div className="grid md:grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-800">Independent musicians</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-800">Promoters and venues</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-800">Festivals</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-800">Educators and institutions</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-800">Jazz/improvised music organisations</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-800">Sector-support bodies</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg md:col-span-2">
                <p className="font-semibold text-gray-800">Individuals contributing to the ecosystem</p>
              </div>
            </div>

            <p className="text-lg leading-8 text-gray-600 italic">
              Membership is voluntary and free during the development stage.
            </p>
          </div>
        </section>

        {/* STRUCTURE */}
        <section id="structure" className="mb-20 scroll-mt-20">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
              4
            </div>
            <h2 className="text-3xl font-bold mt-2" style={{ color: 'var(--color-ijf-primary)' }}>
              Structure
            </h2>
          </div>

          <div className="space-y-8 ml-16">
            
            {/* Plenary Forum */}
            <div className="p-6 bg-white border-2 rounded-xl" style={{ borderColor: 'var(--color-ijf-accent)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-ijf-primary)' }}>
                4.1 Plenary Forum
              </h3>
              <ul className="space-y-2 text-lg text-gray-800">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></span>
                  <span>Full-group meeting of all members</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></span>
                  <span>Meets 3–4 times per year</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></span>
                  <span>Approves major positions, recommendations, and sector submissions</span>
                </li>
              </ul>
            </div>

            {/* Steering Group */}
            <div className="p-6 bg-white border-2 rounded-xl" style={{ borderColor: 'var(--color-ijf-accent)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-ijf-primary)' }}>
                4.2 Steering Group
              </h3>
              <ul className="space-y-2 text-lg text-gray-800">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></span>
                  <span>6–8 members</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></span>
                  <span>Balanced across geography (North/South/East/West) and roles (artist/promoter/org/education)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></span>
                  <span>Term length: 18 months, renewable once</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></span>
                  <span>Role: coordinate meetings, oversee working groups, communicate with funders, and consolidate sector feedback</span>
                </li>
              </ul>
            </div>

            {/* Working Groups */}
            <div className="p-6 bg-white border-2 rounded-xl" style={{ borderColor: 'var(--color-ijf-accent)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-ijf-primary)' }}>
                4.3 Working Groups
              </h3>
              <p className="text-lg text-gray-800 mb-4">
                Working groups implement agreed priorities. Initial groups include:
              </p>
              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <div className="px-4 py-2 bg-gray-50 rounded border border-gray-200">
                  <p className="font-semibold text-gray-800">Advocacy</p>
                </div>
                <div className="px-4 py-2 bg-gray-50 rounded border border-gray-200">
                  <p className="font-semibold text-gray-800">Data & Research</p>
                </div>
                <div className="px-4 py-2 bg-gray-50 rounded border border-gray-200">
                  <p className="font-semibold text-gray-800">Education & Youth</p>
                </div>
                <div className="px-4 py-2 bg-gray-50 rounded border border-gray-200">
                  <p className="font-semibold text-gray-800">Inclusion & EDI</p>
                </div>
                <div className="px-4 py-2 bg-gray-50 rounded border border-gray-200">
                  <p className="font-semibold text-gray-800">Festival & Events Development</p>
                </div>
                <div className="px-4 py-2 bg-gray-50 rounded border border-gray-200">
                  <p className="font-semibold text-gray-800">Cross-Border Collaboration</p>
                </div>
              </div>
              <p className="text-lg text-gray-800">
                Each group has a coordinator, meets as needed, and reports back at every plenary.
              </p>
            </div>

          </div>
        </section>

        {/* DECISION MAKING */}
        <section id="decision-making" className="mb-20 scroll-mt-20">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
              5
            </div>
            <h2 className="text-3xl font-bold mt-2" style={{ color: 'var(--color-ijf-primary)' }}>
              Decision-Making
            </h2>
          </div>

          <div className="space-y-3 text-lg leading-8 text-gray-800 ml-16">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-primary)' }}></span>
              <span>The plenary approves sector positions by simple majority (50%+1)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-primary)' }}></span>
              <span>The steering group handles operational decisions between plenaries</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-primary)' }}></span>
              <span>Working groups make recommendations but do not set Forum-wide policy</span>
            </div>
          </div>
        </section>

        {/* COMMUNICATION */}
        <section id="communication" className="mb-20 scroll-mt-20">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
              6
            </div>
            <h2 className="text-3xl font-bold mt-2" style={{ color: 'var(--color-ijf-primary)' }}>
              Communication
            </h2>
          </div>

          <div className="space-y-3 text-lg leading-8 text-gray-800 ml-16">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-primary)' }}></span>
              <span>One official communication channel (Slack/Google Groups — to be decided)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-primary)' }}></span>
              <span>Monthly sector update: deadlines, opportunities, advocacy alerts</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-primary)' }}></span>
              <span>Shared document repository for minutes, data, templates, and policy files</span>
            </div>
          </div>
        </section>

        {/* DATA & EVIDENCE */}
        <section id="data" className="mb-20 scroll-mt-20">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
              7
            </div>
            <h2 className="text-3xl font-bold mt-2" style={{ color: 'var(--color-ijf-primary)' }}>
              Data & Evidence-Sharing
            </h2>
          </div>

          <div className="ml-16">
            <p className="text-lg leading-8 text-gray-800 mb-4">
              The Forum will coordinate:
            </p>

            <div className="space-y-3 text-lg leading-8 text-gray-800">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-primary)' }}></span>
                <span>Collection of national sector data</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-primary)' }}></span>
                <span>Shared tools (e.g., Looker Studio)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-primary)' }}></span>
                <span>Annual review of key statistics to support advocacy</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-primary)' }}></span>
                <span>Anonymised reporting where appropriate (e.g. Arts Council feedback)</span>
              </div>
            </div>
          </div>
        </section>

        {/* EXTERNAL RELATIONS */}
        <section id="external" className="mb-20 scroll-mt-20">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
              8
            </div>
            <h2 className="text-3xl font-bold mt-2" style={{ color: 'var(--color-ijf-primary)' }}>
              External Relations
            </h2>
          </div>

          <div className="ml-16">
            <p className="text-lg leading-8 text-gray-800 mb-6">
              The Forum acts as a unified voice in dealings with:
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="font-semibold text-gray-800">Arts Council</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="font-semibold text-gray-800">Culture Ireland</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="font-semibold text-gray-800">Local Authorities</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="font-semibold text-gray-800">Media</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="font-semibold text-gray-800">International Partners</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="font-semibold text-gray-800">Art-form Networks</p>
              </div>
            </div>

            <p className="text-lg leading-8 text-gray-600 italic">
              Submissions, briefings, and position papers are approved by the plenary or, when 
              time-sensitive, by the steering group.
            </p>
          </div>
        </section>

        {/* ACCOUNTABILITY & AMENDMENTS */}
        <section id="accountability" className="mb-20 scroll-mt-20">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
              9
            </div>
            <h2 className="text-3xl font-bold mt-2" style={{ color: 'var(--color-ijf-primary)' }}>
              Accountability
            </h2>
          </div>

          <div className="ml-16">
            <p className="text-lg text-gray-800 mb-3">The Forum commits to:</p>
            <div className="space-y-3 text-lg leading-8 text-gray-800">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-primary)' }}></span>
                <span>Publishing an annual summary of sector activity and priorities</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-primary)' }}></span>
                <span>Sharing outcomes of meetings with funders</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ backgroundColor: 'var(--color-ijf-primary)' }}></span>
                <span>Transparent reporting on working group outputs</span>
              </div>
            </div>
          </div>
        </section>

        <section id="amendments" className="mb-20 scroll-mt-20">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
              10
            </div>
            <h2 className="text-3xl font-bold mt-2" style={{ color: 'var(--color-ijf-primary)' }}>
              Amendments
            </h2>
          </div>

          <div className="ml-16">
            <p className="text-lg leading-8 text-gray-800">
              This Charter can be updated by majority vote at any plenary meeting.
            </p>
          </div>
        </section>

      </div>

      {/* FOOTER CTA */}
      <section className="w-full py-16 border-t border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">
            Questions about the Charter?
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Contact the steering group for clarifications or to discuss membership.
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 font-semibold rounded-lg transition"
            style={{ backgroundColor: 'var(--color-ijf-primary)', color: 'white' }}
          >
            Contact Us
          </a>
        </div>
      </section>

    </div>
  );
}