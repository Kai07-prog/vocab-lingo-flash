
import { useIsMobile } from "@/hooks/use-mobile";
import { useCallback } from "react";

export function useMobileDialog() {
  const isMobile = useIsMobile();
  
  const getMobileProps = useCallback(() => {
    if (!isMobile) return {};
    
    return {
      className: "mobile-dialog sm:mobile-dialog-reset",
    };
  }, [isMobile]);
  
  return { isMobile, getMobileProps };
}
