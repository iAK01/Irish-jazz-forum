// /app/members/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PublicMember {
  _id: string;
  name: string;
  slug: string;
  memberType: string | string[];
  region?: string;
  cityTown?: string;
  shortTagline?: string;
  logoUrl?: string;  
  heroImageUrl?: string;
  publicTags: string[];
}

export default function PublicMembersPage() {
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<PublicMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const memberTypes = [
    { value: "artist", label: "Artists" },
    { value: "collective", label: "Collectives" },
    { value: "venue", label: "Venues" },
    { value: "festival", label: "Festivals" },
    { value: "promoter", label: "Promoters" },
    { value: "organisation", label: "Organisations" },
    { value: "education", label: "Education" },
    { value: "media", label: "Media" },
    { value: "label", label: "Labels" },
    { value: "audience_rep", label: "Audience Representatives" },
  ];

  const regions = [
    "Dublin",
    "Leinster",
    "Munster",
    "Connacht",
    "Ulster (ROI)",
    "Northern Ireland",
  ];

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, typeFilter, regionFilter, members]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/members/public");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch members");
      }

      setMembers(data.data || []);
      setFilteredMembers(data.data || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...members];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.cityTown?.toLowerCase().includes(query) ||
          m.shortTagline?.toLowerCase().includes(query) ||
          m.publicTags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((m) => 
        Array.isArray(m.memberType) 
          ? m.memberType.includes(typeFilter)
          : m.memberType === typeFilter
      );
    }

    // Region filter
    if (regionFilter !== "all") {
      filtered = filtered.filter((m) => m.region === regionFilter);
    }

    setFilteredMembers(filtered);
  };

  const getMemberTypeIcon = (type: string | string[]) => {
    const typeValue = Array.isArray(type) ? type[0] : type;
    const icons: Record<string, string> = {
      artist: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
      venue: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      festival: "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9",
      education: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222",
      default: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    };
    return icons[typeValue] || icons.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)' }}>
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Link href="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold">Back to Home</span>
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6 border-b border-white/10">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold">Back to Home</span>
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-6">
           <img
  src="/images/IJF_Logo.png"
  alt="Irish Jazz Forum"
  className="w-20 h-20 object-contain"
/>
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">Member Directory</h1>
              <p className="text-xl text-gray-300">
                Discover {filteredMembers.length} members of Ireland's jazz community
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, location, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all shadow-sm focus:ring-ijf-accent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 transition-all shadow-sm focus:ring-ijf-accent cursor-pointer"
            >
              <option value="all">All Types</option>
              {memberTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Region Filter */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 transition-all shadow-sm focus:ring-ijf-accent cursor-pointer"
            >
              <option value="all">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-md transition cursor-pointer ${
                  viewMode === "grid"
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                style={viewMode === "grid" ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-md transition cursor-pointer ${
                  viewMode === "list"
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                style={viewMode === "list" ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Members Grid/List */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {filteredMembers.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No members found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Link key={member._id} href={`/members/${member.slug}`}>
                <div className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300 h-full">
                  {/* Image */}
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
  {member.logoUrl ? (
    <div className="w-full h-full flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-ijf-bg)' }}>
      <img
        src={member.logoUrl}
        alt={member.name}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  ) : member.heroImageUrl ? (
    <img
      src={member.heroImageUrl}
      alt={member.name}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-ijf-bg)' }}>
                        <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getMemberTypeIcon(member.memberType)} />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-ijf-primary transition line-clamp-2">
                        {member.name}
                      </h3>
                    </div>

                    {member.shortTagline && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {member.shortTagline}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {Array.isArray(member.memberType) ? (
                        member.memberType.map((type, typeIdx) => (
                          <span key={typeIdx} className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                            {memberTypes.find((t) => t.value === type)?.label || type}
                          </span>
                        ))
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                          {memberTypes.find((t) => t.value === member.memberType)?.label || member.memberType}
                        </span>
                      )}
                      {member.region && (
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                          {member.cityTown ? `${member.cityTown}, ${member.region}` : member.region}
                        </span>
                      )}
                    </div>

                    {member.publicTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {member.publicTags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-50 rounded text-xs text-gray-600">
                            {tag}
                          </span>
                        ))}
                        {member.publicTags.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500">
                            +{member.publicTags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <Link key={member._id} href={`/members/${member.slug}`}>
                <div className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300">
                  <div className="flex items-center gap-6">
                    {/* Image */}
                    <div className="w-24 h-24 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
  {member.logoUrl ? (
    <div className="w-full h-full flex items-center justify-center p-3" style={{ backgroundColor: 'var(--color-ijf-bg)' }}>
      <img
        src={member.logoUrl}
        alt={member.name}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  ) : member.heroImageUrl ? (
    <img
      src={member.heroImageUrl}
      alt={member.name}
      className="w-full h-full object-cover"
    />
  ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-ijf-bg)' }}>
                          <svg className="w-10 h-10 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getMemberTypeIcon(member.memberType)} />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-ijf-primary transition mb-2">
                        {member.name}
                      </h3>
                      
                      {member.shortTagline && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-1">
                          {member.shortTagline}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(member.memberType) ? (
                          member.memberType.map((type, typeIdx) => (
                            <span key={typeIdx} className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                              {memberTypes.find((t) => t.value === type)?.label || type}
                            </span>
                          ))
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                            {memberTypes.find((t) => t.value === member.memberType)?.label || member.memberType}
                          </span>
                        )}
                        {member.region && (
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                            {member.cityTown ? `${member.cityTown}, ${member.region}` : member.region}
                          </span>
                        )}
                        {member.publicTags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-50 rounded text-xs text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow */}
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
