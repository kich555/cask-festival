import DesignAssets from "../DesignAssets"
import { exhibitorMetadata, renderExhibitorTab } from "../exhibitorPage"

export const metadata = exhibitorMetadata
export const dynamic = "force-dynamic"

export default function ExhibitorAssetsPage() {
  return renderExhibitorTab("assets", () => <DesignAssets />, { wide: true })
}
