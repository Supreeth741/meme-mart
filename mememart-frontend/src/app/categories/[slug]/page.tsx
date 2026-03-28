import CategoryDetailClient from "./CategoryDetailClient";

export function generateStaticParams() {
  return [{ slug: "_" }];
}

export default function CategoryDetailPage() {
  return <CategoryDetailClient />;
}
