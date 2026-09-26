import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface GalleryProps { onNavigate: (page: Page) => void; }

const categories = ["All", "AGM", "REUNION", "EVENTS", "GRADUATION", "WELFARE", "NETWORKING", "HISTORICAL", "CLASS_PHOTOS"];

export default function Gallery({ onNavigate }: GalleryProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadAlbumTitle, setUploadAlbumTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("INDIVIDUAL_ALUMNI");
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [captions, setCaptions] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAlbums = () => {
    setLoading(true);
    let url = "/api/gallery/albums";
    if (activeCategory !== "All") url += `?category=${encodeURIComponent(activeCategory)}`;
    apiFetch(url)
      .then(res => setAlbums(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlbums();
  }, [activeCategory]);

  const fetchAlbumDetail = async (id: string) => {
    try {
      const data = await apiFetch(`/api/gallery/albums/${id}`);
      setSelectedAlbum(data);
    } catch (err) {
      console.error("Failed to load album details:", err);
    }
  };

  const handleAddImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
    setCaptions([...captions, ""]);
  };

  const handleRemoveImageUrl = (index: number) => {
    if (imageUrls.length <= 1) return;
    setImageUrls(imageUrls.filter((_, i) => i !== index));
    setCaptions(captions.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const updatedUrls = [...imageUrls];
      updatedUrls[index] = result;
      setImageUrls(updatedUrls);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validPhotos = imageUrls
      .map((url, idx) => ({ url: url.trim(), caption: captions[idx] ? captions[idx].trim() : "" }))
      .filter(p => p.url.length > 0);

    if (validPhotos.length === 0) {
      alert("Please enter at least one photo URL or upload an image file.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch("/api/gallery/upload-multiple", {
        method: "POST",
        body: JSON.stringify({
          albumId: selectedAlbumId || undefined,
          albumTitle: uploadAlbumTitle || undefined,
          category: uploadCategory,
          photos: validPhotos,
        }),
      });

      alert(`Successfully uploaded ${validPhotos.length} photo(s) to gallery showcase!`);
      setShowUploadModal(false);
      setUploadAlbumTitle("");
      setImageUrls([""]);
      setCaptions([""]);
      fetchAlbums();
    } catch (err: any) {
      alert(err.message || "Failed to upload photos");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = albums;

  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center relative">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Memories</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Photo Gallery</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto mb-6">
          A visual record of our events, reunions, milestones and shared memories.
        </p>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-[var(--accent)] text-white font-bold rounded-lg text-sm hover:bg-[#A87A0A] transition-colors shadow-md"
        >
          📷 + Upload Multiple Photos to Showcase
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Album Grid */}
        {loading ? (
          <div className="text-center py-12 text-[var(--muted-foreground)]">Loading photo gallery...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((album) => {
              const coverImg = album.photos?.[0]?.media?.url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&auto=format";
              const photoCount = album._count?.photos || album.photos?.length || 0;

              return (
                <div key={album.id || album.title} onClick={() => fetchAlbumDetail(album.id)} className="bg-white border border-[var(--border)] rounded overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="h-48 bg-[var(--muted)] overflow-hidden relative">
                    <img src={coverImg} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                    </div>
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-[var(--secondary)] text-[var(--accent)] text-[10px] font-semibold uppercase tracking-wide rounded">
                      {album.category || "GALLERY"}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1 leading-snug">{album.title}</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">{album.year || new Date(album.createdAt).getFullYear()}</p>
                    <p className="text-xs text-[var(--primary)] font-medium mt-1">{photoCount} photo{photoCount === 1 ? '' : 's'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <p className="text-4xl mb-3">🖼️</p>
            <p className="font-semibold">No photo albums found</p>
            <p className="text-sm mt-1">Check back later for newly published albums.</p>
          </div>
        )}

        <div className="mt-10 text-center bg-[var(--muted)] rounded p-8">
          <p className="font-display text-xl font-bold text-[var(--secondary)] mb-2">Have alumni photos to share?</p>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">Submit your photos from events, reunions or university memories directly to our community gallery.</p>
          <button onClick={() => setShowUploadModal(true)} className="px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded text-sm hover:bg-[var(--accent)] transition-colors">
            + Upload Photos Now
          </button>
        </div>
      </div>

      {/* Album Detail Modal */}
      {selectedAlbum && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAlbum(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b border-[var(--border)] pb-3">
              <div>
                <span className="px-2 py-0.5 bg-[var(--muted)] text-[var(--primary)] text-[10px] font-bold rounded uppercase">{selectedAlbum.category}</span>
                <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mt-1">{selectedAlbum.title}</h2>
                <p className="text-xs text-[var(--muted-foreground)]">{selectedAlbum.description || "Album Photos Showcase"}</p>
              </div>
              <button onClick={() => setSelectedAlbum(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-2">
              {(selectedAlbum.photos || []).map((p: any) => (
                <div key={p.id} className="bg-slate-50 border border-[var(--border)] rounded-lg overflow-hidden flex flex-col">
                  <div className="h-48 bg-[var(--muted)] overflow-hidden">
                    <img src={p.media?.secureUrl} alt={p.caption || "Gallery photo"} className="w-full h-full object-cover" />
                  </div>
                  {p.caption && (
                    <p className="p-2.5 text-xs text-[var(--foreground)] font-medium leading-snug">{p.caption}</p>
                  )}
                  {p.uploadedBy && (
                    <p className="p-2 text-[10px] text-[var(--muted-foreground)] bg-slate-100 border-t border-[var(--border)] mt-auto">
                      Uploaded by: <strong>{p.uploadedBy.firstName} {p.uploadedBy.lastName}</strong>
                    </p>
                  )}
                </div>
              ))}
              {(selectedAlbum.photos || []).length === 0 && (
                <p className="col-span-full text-center py-8 text-xs text-[var(--muted-foreground)]">No photos uploaded to this album yet.</p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--border)]">
              <button onClick={() => setSelectedAlbum(null)} className="px-5 py-2 bg-[var(--primary)] text-white rounded text-xs font-semibold">Close Album</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Multiple Photos Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-[var(--border)] pb-3">
              <div>
                <h2 className="font-display text-xl font-bold text-[var(--secondary)]">Upload Showcase Photos</h2>
                <p className="text-xs text-[var(--muted-foreground)]">Select and upload multiple pictures to share with the alumni community.</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Select Existing Album or Create New</label>
                  <select
                    value={selectedAlbumId}
                    onChange={e => {
                      setSelectedAlbumId(e.target.value);
                      if (e.target.value) setUploadAlbumTitle("");
                    }}
                    className="w-full p-2 border border-[var(--border)] rounded bg-white"
                  >
                    <option value="">-- Create New Album --</option>
                    {albums.map(a => (
                      <option key={a.id} value={a.id}>{a.title} ({a.category})</option>
                    ))}
                  </select>
                </div>
                {!selectedAlbumId && (
                  <div>
                    <label className="block font-medium mb-1">New Album Title</label>
                    <input
                      type="text"
                      placeholder="e.g. 2025 Reunion Memories"
                      value={uploadAlbumTitle}
                      onChange={e => setUploadAlbumTitle(e.target.value)}
                      className="w-full p-2 border border-[var(--border)] rounded"
                    />
                  </div>
                )}
              </div>

              {!selectedAlbumId && (
                <div>
                  <label className="block font-medium mb-1">Album Category</label>
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value)}
                    className="w-full p-2 border border-[var(--border)] rounded bg-white"
                  >
                    <option value="INDIVIDUAL_ALUMNI">INDIVIDUAL_ALUMNI</option>
                    <option value="GRADUATING_SET">GRADUATING_SET</option>
                    <option value="REUNION">REUNION</option>
                    <option value="AGM">AGM</option>
                    <option value="ALUMNI_EVENT">ALUMNI_EVENT</option>
                    <option value="UNIVERSITY_MEMORIES">UNIVERSITY_MEMORIES</option>
                    <option value="HISTORICAL_ARCHIVE">HISTORICAL_ARCHIVE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              )}

              {/* Photos List Inputs */}
              <div>
                <label className="block font-semibold text-sm mb-2 text-[var(--foreground)]">Select Images / Provide Photo URLs ({imageUrls.length})</label>
                <div className="space-y-3">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="p-3 bg-[var(--muted)] border border-[var(--border)] rounded space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--primary)]">Photo #{idx + 1}</span>
                        {imageUrls.length > 1 && (
                          <button type="button" onClick={() => handleRemoveImageUrl(idx)} className="text-red-500 text-xs font-semibold hover:underline">
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-[var(--muted-foreground)] mb-1">Upload File (Image File)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleFileChange(e, idx)}
                            className="w-full text-[11px] bg-white border rounded p-1"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[var(--muted-foreground)] mb-1">Or Direct Image URL</label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            value={url.startsWith("data:") ? "[Local File Uploaded]" : url}
                            onChange={e => {
                              const newUrls = [...imageUrls];
                              newUrls[idx] = e.target.value;
                              setImageUrls(newUrls);
                            }}
                            className="w-full p-2 border rounded bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-[var(--muted-foreground)] mb-1">Caption / Description (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Group picture at the 2025 Annual Reunion"
                          value={captions[idx]}
                          onChange={e => {
                            const newCaps = [...captions];
                            newCaps[idx] = e.target.value;
                            setCaptions(newCaps);
                          }}
                          className="w-full p-2 border rounded bg-white"
                        />
                      </div>

                      {url && (
                        <div className="mt-1 h-20 w-20 rounded overflow-hidden border border-[var(--border)]">
                          <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="mt-3 px-4 py-2 bg-white border border-[var(--primary)] text-[var(--primary)] rounded text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors"
                >
                  + Add Another Photo
                </button>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-[var(--border)]">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 border rounded font-medium">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[var(--primary)] text-white rounded font-bold hover:bg-[var(--accent)] transition-colors">
                  {isSubmitting ? "Uploading..." : `Upload ${imageUrls.filter(Boolean).length} Photo(s)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
