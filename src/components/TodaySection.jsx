import PropTypes from "prop-types"

export default function TodaySection({ title, items, color }) {

  if (!items || items.length === 0) return null

  return (
    <div className={`p-5 rounded-xl border ${color}`}>

      <h2 className="font-bold text-lg mb-3">
        {title}
      </h2>

      <div className="space-y-3">

        {items.map(a => (
          <div
            key={a.id}
            className="flex justify-between bg-slate-900 p-3 rounded-lg"
          >
            <div>
              <p className="font-bold">{a.title}</p>
              <p className="text-xs opacity-60">{a.target_date}</p>
            </div>

            <div className="font-bold">
              {a.hours}h
            </div>
          </div>
        ))}

      </div>

    </div>
  )
}

TodaySection.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.array,
  color: PropTypes.string.isRequired
}