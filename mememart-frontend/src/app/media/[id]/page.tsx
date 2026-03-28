import MediaDetailClient from "./MediaDetailClient";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function MediaDetailPage() {
  return <MediaDetailClient />;
}
