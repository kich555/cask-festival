import ExhibitorForm from "./ExhibitorForm"
import { exhibitorMetadata, renderExhibitorTab } from "./exhibitorPage"

export const metadata = exhibitorMetadata
export const dynamic = "force-dynamic"

export default function ExhibitorPage() {
  return renderExhibitorTab("apply", (data) => <ExhibitorForm {...data} />)
}
