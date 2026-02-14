export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-5">
      <img src="/images/m2c-logo-orange.png" alt="M2C" className="h-8 w-8" />
      {!collapsed && (
        <span className="font-serif text-xl tracking-tight">Media2Cloud</span>
      )}
    </div>
  );
}
