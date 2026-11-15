interface Props {
  value: string
  onChange: (value: string) => void
}

export function SearchField({ value, onChange }: Props) {
  return (
    <div className="search-field">
      <label htmlFor="search">Buscar</label>
      <input
        id="search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Descrição ou categoria"
      />
    </div>
  )
}
