'use client'
import { Config } from '@/payload-types'
import { Autocomplete, AutocompleteItem } from '@heroui/react'
import { FC } from 'react'
import { useAsyncList } from '@react-stately/data'
import { stringify } from 'qs-esm'

type Props = {
  collection: keyof Config['collections']
  id: string
  label: string
  onChange: (key: any) => void
}

const AutoComplete: FC<Props> = (props) => {
  const list = useAsyncList({
    async load({ filterText }) {
      const stringifiedQuery = stringify(
        {
          where: {
            [props.label]: {
              contains: filterText,
            },
          },
          select: {
            id: true,
            [props.id]: true,
            [props.label]: true,
          },
          limit: 10,
        },
        { addQueryPrefix: true },
      )
      const res = await fetch(`/api/${props.collection}${stringifiedQuery}`, {
        credentials: 'include',
      })
      const json = await res.json()

      return {
        items: json.docs,
      }
    },
  })

  return (
    <div>
      <Autocomplete
        className="w-full"
        inputValue={list.filterText}
        isLoading={list.isLoading}
        items={list.items}
        variant="bordered"
        onInputChange={list.setFilterText}
        onSelectionChange={(key) => {
          props.onChange(key)
        }}
        classNames={{
          base: 'w-full bg-neutral-700 rounded-md border border-neutral-400',
          listboxWrapper: 'bg-neutral-700 rounded-md overflow-auto shadow',
          endContentWrapper: 'w-min',
        }}
        inputProps={{
          className: 'w-full',
          style: {
            border: 0,
          },
        }}
      >
        {(item: any) => (
          <AutocompleteItem key={item[props.id]}>{item[props.label]}</AutocompleteItem>
        )}
      </Autocomplete>
    </div>
  )
}

export default AutoComplete
