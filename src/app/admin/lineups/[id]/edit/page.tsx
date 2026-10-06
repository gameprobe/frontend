import { LineupWorkspace } from "../../../../../features/admin/LineupWorkspace";

export default function EditLineupPage({ params }: { params: { id: string } }) {
  return <LineupWorkspace initialMode="edit" initialId={params.id} />;
}
