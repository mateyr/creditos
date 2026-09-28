import { SearchIcon } from "lucide-react"
import { useState } from "react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"

type SearchInputProps = {
  value: string
  onSearch: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value,
  onSearch,
  placeholder = "Buscar",
  className,
}: SearchInputProps) {
  const [text, setText] = useState(value)
  const debouncedSearch = useDebouncedCallback(onSearch, 300)

  return (
    <InputGroup className={className}>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          debouncedSearch(event.target.value.trim())
        }}
      />
    </InputGroup>
  )
}
