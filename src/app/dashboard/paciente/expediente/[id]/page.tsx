import ClientPage from "./ClientPage";

export function generateStaticParams() {
  return [{ id: '0' }, { id: '1' }, { id: '2' }];
}

export default async function HistoryDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ClientPage params={resolvedParams} />;
}
