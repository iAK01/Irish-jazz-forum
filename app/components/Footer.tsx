export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black mt-16">
      <div className="max-w-5xl mx-auto py-10 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          © {new Date().getFullYear()} Irish Jazz Forum.  
          <span className="block sm:inline">All rights reserved.</span>
        </div>

        <div className="flex gap-6 text-sm font-medium">

          <a
            href="/contact"
            className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
          >
            Contact
          </a>
        </div>

      </div>
    </footer>
  );
}