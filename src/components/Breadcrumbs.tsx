interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-[#666666] mb-6">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !last ? (
                <a href={item.href} className="hover:text-black underline-offset-2 hover:underline">
                  {item.label}
                </a>
              ) : (
                <span className={last ? 'text-black' : ''}>{item.label}</span>
              )}
              {!last && <span>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
