// /app/members/[slug]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface MemberProfile {
  _id: string;
  name: string;
  slug: string;
  memberType: string | string[];
  region?: string;
  cityTown?: string;
  county?: string;
  shortTagline?: string;
  longBio?: string;
  logoUrl?: string;           // ADD THIS
  heroImageUrl?: string;
  galleryImageUrls: string[];
  publicTags: string[];
  geographicReach?: string;
  primaryArtformTags: string[];
  activityModes: string[];
  keyProjects: {
    name: string;
    year?: number;
    summary?: string;
    url?: string;
  }[];
  pressQuotes: {
    quote: string;
    source: string;
    year?: number;
  }[];
  contactInfo?: {
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      youtube?: string;
      spotify?: string;
      bandcamp?: string;
    };
  };
  partnerships?: {
    networkMemberships: string[];
  };
}

export default function PublicMemberProfilePage() {
const params = useParams();
const slug = params.slug as string;  // Remove await, just cast directly
  
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug) {
      fetchMember();
    }
  }, [slug]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/members/public/${slug}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch member profile");
      }

      setMember(data.data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getMemberTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      artist: "Artist",
      collective: "Collective",
      venue: "Venue",
      festival: "Festival",
      promoter: "Promoter",
      organisation: "Organisation",
      education: "Education",
      media: "Media",
      label: "Label",
      audience_rep: "Audience Representative",
    };
    return labels[type] || type;
  };

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, string> = {
      facebook: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
      instagram: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 21h11a2.5 2.5 0 002.5-2.5v-11A2.5 2.5 0 0017.5 5h-11A2.5 2.5 0 004 7.5v11A2.5 2.5 0 006.5 21z",
      twitter: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
      youtube: "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z",
      spotify: "M12 2a10 10 0 100 20 10 10 0 000-20zm3.67 14.3c-.14.23-.42.3-.65.16a12.06 12.06 0 00-5.92-1.55c-.7 0-1.4.08-2.07.23a.5.5 0 01-.58-.36.5.5 0 01.36-.58c.75-.17 1.53-.25 2.29-.25 2.28 0 4.43.6 6.21 1.7.23.13.3.42.16.65zm.92-2.05c-.17.28-.53.37-.81.2a14.5 14.5 0 00-7.15-1.87c-.86 0-1.7.1-2.5.29-.34.08-.68-.13-.76-.47-.08-.34.13-.68.47-.76.88-.21 1.8-.32 2.79-.32 2.73 0 5.32.71 7.52 2.03.28.17.37.53.2.81z",
      bandcamp: "M0 5.5v13l9.8-13H24v-13L14.2 5.5z",
    };
    return icons[platform] || icons.facebook;
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)' }}>
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Link href="/members" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold">Back to Directory</span>
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)' }}>
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Link href="/members" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold">Back to Directory</span>
            </Link>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Member Not Found</h2>
          <p className="text-gray-300 mb-8">{error || "This member profile is not available or not public."}</p>
          <Link
            href="/members"
            className="inline-block px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl cursor-pointer"
            style={{ backgroundColor: 'var(--color-ijf-accent)', color: 'var(--color-ijf-bg)' }}
          >
            Browse All Members
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6 border-b border-white/10">
          <Link href="/members" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold">Back to Directory</span>
          </Link>
        </div>

        {member.heroImageUrl ? (
          <div className="relative h-96">
            <img
              src={member.heroImageUrl}
              alt={member.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 py-12">
              <div className="flex items-center gap-3 mb-4">
                {Array.isArray(member.memberType) ? (
                  member.memberType.map((type, idx) => (
                    <span key={idx} className="px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                      {getMemberTypeLabel(type)}
                    </span>
                  ))
                ) : (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                    {getMemberTypeLabel(member.memberType)}
                  </span>
                )}
                {member.region && (
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                    {member.cityTown ? `${member.cityTown}, ${member.region}` : member.region}
                  </span>
                )}
              </div>
              <h1 className="text-5xl font-bold text-white mb-3">{member.name}</h1>
              {member.shortTagline && (
                <p className="text-xl text-gray-200 max-w-3xl">{member.shortTagline}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex items-center gap-3 mb-4">
              {Array.isArray(member.memberType) ? (
                member.memberType.map((type, idx) => (
                  <span key={idx} className="px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                    {getMemberTypeLabel(type)}
                  </span>
                ))
              ) : (
                <span className="px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                  {getMemberTypeLabel(member.memberType)}
                </span>
              )}
              {member.region && (
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                  {member.cityTown ? `${member.cityTown}, ${member.region}` : member.region}
                </span>
              )}
            </div>
            <h1 className="text-5xl font-bold text-white mb-3">{member.name}</h1>
            {member.shortTagline && (
              <p className="text-xl text-gray-200 max-w-3xl">{member.shortTagline}</p>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {member.longBio && (
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {member.longBio}
                  </p>
                </div>
              </div>
            )}

            {/* Key Projects */}
            {member.keyProjects && member.keyProjects.length > 0 && (
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Projects</h2>
                <div className="space-y-6">
                  {member.keyProjects.map((project, idx) => (
                    <div key={idx} className="border-l-4 pl-6" style={{ borderColor: 'var(--color-ijf-accent)' }}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        {project.year && (
                          <span className="text-sm font-medium text-gray-500">{project.year}</span>
                        )}
                      </div>
                      {project.summary && (
                        <p className="text-gray-600 mb-2">{project.summary}</p>
                      )}
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium hover:underline cursor-pointer"
                          style={{ color: 'var(--color-ijf-primary)' }}
                        >
                          Learn more
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Press Quotes */}
            {member.pressQuotes && member.pressQuotes.length > 0 && (
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Press</h2>
                <div className="space-y-6">
                  {member.pressQuotes.map((quote, idx) => (
                    <div key={idx} className="border-l-4 pl-6" style={{ borderColor: 'var(--color-ijf-primary)' }}>
                      <p className="text-gray-700 text-lg italic mb-3">"{quote.quote}"</p>
                      <p className="text-sm font-medium text-gray-900">
                        — {quote.source}
                        {quote.year && <span className="text-gray-500 ml-2">({quote.year})</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {member.galleryImageUrls && member.galleryImageUrls.length > 0 && (
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
                <div className="grid grid-cols-2 gap-4">
                  {member.galleryImageUrls.map((url, idx) => (
                    <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={url}
                        alt={`${member.name} gallery ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact & Links */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Connect</h3>
              
              {/* Website */}
              {member.contactInfo?.website && (
                <a
                  href={member.contactInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer mb-2"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                    <svg className="w-5 h-5" style={{ color: 'var(--color-ijf-bg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Visit Website</span>
                </a>
              )}

              {/* Social Media */}
              {member.contactInfo?.socialMedia && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {Object.entries(member.contactInfo.socialMedia).map(([platform, url]) => 
                    url ? (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-lg flex items-center justify-center hover:opacity-80 transition cursor-pointer"
                        style={{ backgroundColor: 'var(--color-ijf-bg)' }}
                        title={platform}
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getSocialIcon(platform)} />
                        </svg>
                      </a>
                    ) : null
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            {member.publicTags && member.publicTags.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {member.publicTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Details</h3>
              <dl className="space-y-3">
                {member.geographicReach && (
                  <div>
                    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Geographic Reach
                    </dt>
                    <dd className="text-sm text-gray-900 capitalize">{member.geographicReach.replace(/_/g, ' ')}</dd>
                  </div>
                )}
                
                {member.activityModes && member.activityModes.length > 0 && (
                  <div>
                    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Activity
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {member.activityModes.map(m => m.replace(/_/g, ' ')).join(', ')}
                    </dd>
                  </div>
                )}

                {member.primaryArtformTags && member.primaryArtformTags.length > 0 && (
                  <div>
                    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Genres
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {member.primaryArtformTags.join(', ')}
                    </dd>
                  </div>
                )}

                {member.partnerships?.networkMemberships && member.partnerships.networkMemberships.length > 0 && (
                  <div>
                    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Networks
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {member.partnerships.networkMemberships.join(', ')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Member of IJF Badge */}
            <div className="rounded-xl p-6 shadow-sm" style={{ background: 'linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)' }}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                  <svg className="w-8 h-8" style={{ color: 'var(--color-ijf-bg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <p className="text-white font-semibold text-sm">Member of</p>
                <p className="text-white font-bold text-lg">Irish Jazz Forum</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}