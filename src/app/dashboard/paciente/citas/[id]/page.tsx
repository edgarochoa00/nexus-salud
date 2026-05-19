import ClientPage from "./ClientPage";

export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}

export default function AppointmentDetail({ params }: { params: { id: string } }) {
  return <ClientPage params={params} />;
}
