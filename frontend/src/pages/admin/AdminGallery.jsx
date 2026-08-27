import { useEffect, useState } from "react";
import api, { FILE_BASE } from "../../api/client";
import { Card, Button, Input } from "../../components/ui";

export default function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  function load() {
    api.get("/gallery").then((res) => setPhotos(res.data)).catch(() => setError("Could not load the gallery."));
  }
  useEffect(load, []);

  const featured = photos.filter((p) => p.isFeatured).sort((a, b) => a.sortOrder - b.sortOrder);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("caption", caption);
      await api.post("/gallery", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage("Photo uploaded.");
      setFile(null);
      setCaption("");
      e.target.reset();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not upload photo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleToggleFeatured(photo) {
    setError("");
    try {
      await api.put(`/gallery/${photo.id}`, { isFeatured: !photo.isFeatured });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update photo.");
    }
  }

  async function handleDelete(photo) {
    if (!confirm("Remove this photo from the gallery?")) return;
    await api.delete(`/gallery/${photo.id}`);
    load();
  }

  async function handleMove(photo, direction) {
    const sorted = [...photos].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((p) => p.id === photo.id);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;
    await Promise.all([
      api.put(`/gallery/${photo.id}`, { sortOrder: swapWith.sortOrder }),
      api.put(`/gallery/${swapWith.id}`, { sortOrder: photo.sortOrder }),
    ]);
    load();
  }

  return (
    <div className="space-y-6">
      {message && <div className="bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] text-sm rounded-lg px-3 py-2">{message}</div>}
      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}

      <Card title="Homepage Slideshow Preview">
        <p className="text-xs text-[var(--color-slate)] mb-3">
          These are the photos currently featured (max 5) — they run as an auto-rotating slideshow on the main website.
        </p>
        <SlideshowPreview photos={featured} />
      </Card>

      <Card title="Upload a Photo">
        <form onSubmit={handleUpload} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Photo</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Caption (optional)</label>
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Annual Sports Day 2026" />
          </div>
          <Button type="submit" disabled={uploading || !file}>{uploading ? "Uploading..." : "Upload"}</Button>
        </form>
      </Card>

      <Card title={`All Photos (${photos.length})`}>
        {!photos.length ? (
          <p className="text-sm text-[var(--color-slate)] py-6 text-center">No photos uploaded yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...photos].sort((a, b) => a.sortOrder - b.sortOrder).map((photo, i, arr) => (
              <div key={photo.id} className="border border-[var(--color-line)] rounded-xl overflow-hidden bg-white">
                <img src={`${FILE_BASE}${photo.imageUrl}`} alt={photo.caption || "Gallery photo"} className="w-full h-36 object-cover" />
                <div className="p-3 space-y-2">
                  {photo.caption && <p className="text-sm truncate" title={photo.caption}>{photo.caption}</p>}
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleFeatured(photo)}
                      className={`px-2 py-1 rounded-full font-medium ${photo.isFeatured ? "bg-[var(--color-brand)] text-white" : "bg-gray-100 text-[var(--color-slate)] hover:bg-gray-200"}`}
                    >
                      {photo.isFeatured ? "★ In slideshow" : "☆ Add to slideshow"}
                    </button>
                    <div className="flex gap-1">
                      <button disabled={i === 0} onClick={() => handleMove(photo, -1)} className="px-1.5 py-1 rounded border border-[var(--color-line)] disabled:opacity-30">↑</button>
                      <button disabled={i === arr.length - 1} onClick={() => handleMove(photo, 1)} className="px-1.5 py-1 rounded border border-[var(--color-line)] disabled:opacity-30">↓</button>
                      <button onClick={() => handleDelete(photo)} className="px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function SlideshowPreview({ photos }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % photos.length), 3500);
    return () => clearInterval(t);
  }, [photos.length]);

  if (!photos.length) {
    return <p className="text-sm text-[var(--color-slate)] py-6 text-center border border-dashed border-[var(--color-line)] rounded-xl">No photos featured yet — mark up to 5 below as "In slideshow".</p>;
  }

  const photo = photos[index % photos.length];
  return (
    <div className="relative rounded-xl overflow-hidden bg-black/5 h-64">
      <img src={`${FILE_BASE}${photo.imageUrl}`} alt={photo.caption || "Featured photo"} className="w-full h-full object-cover" />
      {photo.caption && <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-sm px-3 py-2">{photo.caption}</div>}
      <div className="absolute bottom-2 right-2 flex gap-1">
        {photos.map((_, i) => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
