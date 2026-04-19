import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { NavBar } from '../components/NavBar';

function FlowNode({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-xl border border-classhi-green bg-white px-4 py-2 text-center dark:bg-dark-card">
        <p className="text-sm font-semibold text-[#111111] dark:text-white">{label}</p>
        {sub && <p className="text-xs text-gray-500 dark:text-[#8A8A90]">{sub}</p>}
      </div>
    </div>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {label && <p className="text-xs text-gray-400 dark:text-[#8A8A90]">{label}</p>}
      <div className="text-classhi-green text-lg leading-none">↓</div>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-classhi-bg dark:bg-dark-bg">
      <NavBar onSignOut={handleSignOut} />

      <main className="mx-auto max-w-5xl px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <img src="/logo.png" alt="Classhi" className="h-14 mb-4" />
          <p className="text-lg text-gray-600 dark:text-[#8A8A90] max-w-2xl">
            A prediction market for CS 1660 — built for our final project, actually used in class.
          </p>
        </div>

        {/* Why section */}
        <section className="mb-12 max-w-2xl">
          <h2 className="text-xl font-condensed font-bold text-[#111111] dark:text-white mb-4">Why we built this</h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-gray-700 dark:text-[#B0B0B8]">
            <p>
              Honestly, the assignment was to use 9 AWS services and build something real. Most groups
              build a to-do app or a blog. We wanted to build something people would actually open
              during class — so we made a prediction market for the lecture itself.
            </p>
            <p>
              The idea is simple: Dan creates markets before class ("Will he say 'serverless' more
              than 5 times?"), everyone bets play money, and the prices shift in real time as people
              update their views. When class ends, Dan resolves them and the leaderboard updates.
              It sounds dumb but it genuinely makes you pay more attention.
            </p>
            <p>
              On the technical side, the whole thing is serverless — no EC2, no containers. It's
              Cognito for auth, API Gateway for REST + WebSocket, 15 Lambda functions, 4 DynamoDB
              tables with Streams for live price pushes, EventBridge Scheduler for auto-opening
              markets, and CloudFront + S3 for the frontend. Everything deploys from a single{' '}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-classhi-green dark:bg-[#1a1a1f]">
                sam deploy
              </code>
              .
            </p>
            <p>
              We're CS students, not finance people — so if the pricing model is janky, that's on us.
              But it works, it's live, and we actually used it in class. That felt like enough.
            </p>
          </div>
        </section>

        {/* Flow chart */}
        <section className="mb-12">
          <h2 className="text-xl font-condensed font-bold text-[#111111] dark:text-white mb-6">How it works</h2>

          <div className="overflow-x-auto">
            <div className="flex gap-8 min-w-max">

              {/* Auth flow */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-[#8A8A90] mb-1">Auth</p>
                <FlowNode label="Sign Up / Log In" sub="aws-amplify v6" />
                <Arrow />
                <FlowNode label="Cognito User Pool" sub="JWT issued" />
                <Arrow />
                <FlowNode label="PostConfirmation λ" sub="$1000 balance seeded" />
              </div>

              {/* Betting flow */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-[#8A8A90] mb-1">Betting</p>
                <FlowNode label="Place Bet (React)" sub="JWT in header" />
                <Arrow label="HTTPS" />
                <FlowNode label="API Gateway HTTP" sub="JWT authorizer" />
                <Arrow />
                <FlowNode label="PlaceBet λ" sub="atomic TransactWrite" />
                <Arrow />
                <FlowNode label="DynamoDB" sub="Users · Markets · Positions" />
              </div>

              {/* Live prices flow */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-[#8A8A90] mb-1">Live Prices</p>
                <FlowNode label="DynamoDB Stream" sub="MarketsTable" />
                <Arrow />
                <FlowNode label="WS Broadcast λ" sub="reads stream" />
                <Arrow label="PostToConnection" />
                <FlowNode label="API Gateway WS" sub="wss://" />
                <Arrow />
                <FlowNode label="Browser" sub="price flash &lt;3s" />
              </div>

              {/* Scheduling flow */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-[#8A8A90] mb-1">Scheduling</p>
                <FlowNode label="Create Market λ" sub="admin only" />
                <Arrow />
                <FlowNode label="EventBridge Scheduler" sub="at(open) · at(close)" />
                <Arrow />
                <FlowNode label="Scheduler λ" sub="status transition" />
                <Arrow />
                <FlowNode label="Market open → closed" sub="auto, no cron" />
              </div>

            </div>
          </div>
        </section>

        {/* Sign off */}
        <section className="border-t border-gray-200 dark:border-dark-border pt-8">
          <p className="text-sm text-gray-500 dark:text-[#8A8A90]">
            Built for CS 1660 Cloud Computing, Spring 2026.
          </p>
          <p className="mt-1 text-sm font-semibold text-[#111111] dark:text-white">
            — Shreyash, Akash, Aidan, Haiden & Krishna
          </p>
        </section>

      </main>
    </div>
  );
}
