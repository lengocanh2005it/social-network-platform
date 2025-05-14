import { useEffect, useState } from "react";
import { Tooltip } from "@heroui/react";
import { RotateCcw } from "lucide-react";
import { OTP_RESEND_INTERVAL } from "@/utils";

const RequestOtpButton = ({ onRequest }: { onRequest: () => void }) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const lastRequested = localStorage.getItem("otp-last-requested");

    if (lastRequested) {
      const elapsed = Math.floor((Date.now() - parseInt(lastRequested)) / 1000);

      if (elapsed < OTP_RESEND_INTERVAL)
        setRemaining(OTP_RESEND_INTERVAL - elapsed);
    }
  }, []);

  useEffect(() => {
    if (remaining <= 0) return;

    const timer = setInterval(() => {
      setRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining]);

  const handleClick = () => {
    if (remaining > 0) return;

    localStorage.setItem("otp-last-requested", Date.now().toString());

    setRemaining(OTP_RESEND_INTERVAL);

    onRequest();
  };

  return (
    <Tooltip
      content={
        remaining > 0
          ? `Wait ${remaining}s before requesting a new OTP`
          : "Request new OTP"
      }
    >
      <div>
        <RotateCcw
          onClick={handleClick}
          className={`cursor-pointer duration-300 focus:outline-none ease-in-out transition-opacity ${
            remaining > 0
              ? "opacity-30 pointer-events-none"
              : "opacity-70 hover:opacity-100"
          }`}
        />
      </div>
    </Tooltip>
  );
};

export default RequestOtpButton;
