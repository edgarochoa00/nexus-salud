import ClientPage from "./ClientPage";

export function generateStaticParams() {
  return [{ id: '0' }, { id: '1' }, { id: '2' }];
}

export default function HistoryDetail({ params }: { params: { id: string } }) {
  return <ClientPage params={params} />;
}
