import { useLocation } from "react-router-dom";
import { useBannerAd } from "@/hooks/useAdMob";
import { ADS_ENABLED } from "@/config/ads";

// Mounts a persistent banner ad at the bottom of the app.
// Automatically disables on routes where we don't want ads (e.g., /timer).
const AdBanner = () => {
  const location = useLocation();
  const enabled = ADS_ENABLED && location.pathname !== "/timer";

  // Will initialize AdMob lazily and show/hide the banner.
  useBannerAd(enabled, "bottom");
  return null;
};

export default AdBanner;
