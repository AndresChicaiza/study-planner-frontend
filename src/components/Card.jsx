export default function Card({ title, children }) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <p className="text-xs text-slate-400">
        {title}
      </p>

      <p className="text-2xl font-bold">
        {children}
      </p>
    </div>
  )
}