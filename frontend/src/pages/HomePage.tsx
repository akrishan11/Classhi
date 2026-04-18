import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function HomePage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-classhi-bg">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-[#111111]">
              Classhi
            </h1>
            <p className="mt-2 text-base text-gray-500">
              Markets loading in Phase 2.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogOut}
            className="text-sm font-semibold text-classhi-coral hover:underline"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
