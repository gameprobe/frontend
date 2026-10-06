import { LineupDetail } from "../../../components/LineupDetail";

interface LineupDetailPageProps {
  params: { id: string };
}

export default function LineupDetailPage({ params }: LineupDetailPageProps) {
  return <LineupDetail lineupId={params.id} />;
}
