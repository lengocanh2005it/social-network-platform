import { getFingerprint } from "@/utils";
import { useEffect, useState } from "react";

export const useFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    const fetchFingerprint = async () => {
      const id = await getFingerprint();
      setFingerprint(id);
    };

    fetchFingerprint();
  }, []);

  return fingerprint;
};
