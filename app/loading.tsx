export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 text-zinc-700 backdrop-blur-sm">
      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-500" />
      <p className="text-sm font-medium tracking-wide">Updating hero statistics…</p>
    </div>
  );
}
