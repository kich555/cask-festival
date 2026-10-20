import Certificates from "../Certificates"
import DesignAssets from "../DesignAssets"
import { exhibitorMetadata, renderExhibitorTab } from "../exhibitorPage"
import ScrollHint from "../ScrollHint"

export const metadata = exhibitorMetadata
export const dynamic = "force-dynamic"

export default function ExhibitorAssetsPage() {
  return renderExhibitorTab(
    "assets",
    (data) => (
      <>
        <Certificates loginId={data.state.login_id} />
        <DesignAssets />
        <ScrollHint />
      </>
    ),
    { wide: true },
  )
}
