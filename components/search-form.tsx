import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Small GET form so search works before hydration. The page re-renders with
 * the `q` search parameter and filters the list on the server.
 */
export function SearchForm({
  action,
  label,
  placeholder,
  defaultValue = "",
}: {
  action: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <form
      action={action}
      method='get'
      role='search'
      className='flex flex-wrap items-center gap-2'
    >
      <Input
        type='search'
        name='q'
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={label}
        className='sm:max-w-xs'
      />
      <button type='submit' className={buttonVariants({ variant: "outline" })}>
        Search
      </button>
      {defaultValue ? (
        <Link
          href={action}
          className='text-sm text-muted-foreground underline-offset-4 hover:underline'
        >
          Clear
        </Link>
      ) : null}
    </form>
  );
}
