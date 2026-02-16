export default function CategoriesList({
  categories,
}: {
  categories: { name: string; slug: string }[];
}) {
  return (
    <div>
      {categories.map((category) => (
        <p
          key={category.slug}
          className="m-0.5 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 focus:bg-gray-200 focus:outline-hidden"
        >
          {category.name}
        </p>
      ))}
    </div>
  );
}
