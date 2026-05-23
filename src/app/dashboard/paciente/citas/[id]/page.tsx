import ClientPage from "./ClientPage";

export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}

export default async function AppointmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ClientPage params={resolvedParams} />;
}
