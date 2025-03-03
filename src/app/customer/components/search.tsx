import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

interface SearchHeroProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function SearchHero({ search, setSearch }: SearchHeroProps) {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?query=${encodeURIComponent(search)}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative flex items-center bg-white p-3 rounded-lg shadow-md max-w-md mx-auto mt-6"
    >
      <FaSearch className="text-gray-500 absolute left-3" />
      <input
        type="text"
        placeholder="Search for businesses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10 pr-4 py-2 w-full rounded-lg focus:outline-none"
      />
      <button
        type="submit"
        className="absolute right-3 text-blue-600 font-bold"
      >
        Go
      </button>
    </form>
  );
}
