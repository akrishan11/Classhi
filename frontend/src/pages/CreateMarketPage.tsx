import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../lib/api';

export function CreateMarketPage() {
  const navigate = useNavigate();
  const { idToken } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [openAt, setOpenAt] = useState('');
  const [closeAt, setCloseAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch('/markets', idToken, {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          openAt: new Date(openAt).toISOString(),
          closeAt: new Date(closeAt).toISOString(),
        }),
      });
      if (res.status === 201 || res.ok) {
        navigate('/markets');
        return;
      }
      if (res.status === 403) {
        setError('Admin access required.');
        return;
      }
      setError('Failed to create market. Please try again.');
    } catch {
      setError('Failed to create market. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-classhi-bg">
      <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-8">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate('/markets')}
          className="mb-6 text-sm text-gray-500 hover:text-[#111111]"
        >
          ← Markets
        </button>

        <h1 className="mb-6 text-xl font-semibold text-[#111111]">Create Market</h1>

        {error && (
          <p className="mb-4 text-sm text-classhi-coral">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111111]" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-gray-200 px-3 py-2 text-sm text-[#111111] outline-none focus:border-classhi-green"
              placeholder="How many times will professor say 'AWS'?"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111111]" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border border-gray-200 px-3 py-2 text-sm text-[#111111] outline-none focus:border-classhi-green"
              placeholder="Market resolves based on lecture recording."
            />
          </div>

          {/* Opens at */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111111]" htmlFor="openAt">
              Opens at
            </label>
            <input
              id="openAt"
              type="datetime-local"
              required
              value={openAt}
              onChange={(e) => setOpenAt(e.target.value)}
              className="w-full rounded border border-gray-200 px-3 py-2 text-sm text-[#111111] outline-none focus:border-classhi-green"
            />
          </div>

          {/* Closes at */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111111]" htmlFor="closeAt">
              Closes at
            </label>
            <input
              id="closeAt"
              type="datetime-local"
              required
              value={closeAt}
              onChange={(e) => setCloseAt(e.target.value)}
              className="w-full rounded border border-gray-200 px-3 py-2 text-sm text-[#111111] outline-none focus:border-classhi-green"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded bg-classhi-green px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create Market'}
          </button>
        </form>
      </div>
    </div>
  );
}
