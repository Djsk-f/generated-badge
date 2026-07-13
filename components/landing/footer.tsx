export function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
            <span className="text-white font-bold text-[10px]">BG</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">BadgeGen</span>
        </div>
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} BadgeGen. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
