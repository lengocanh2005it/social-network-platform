import { Button } from "@heroui/react";
import { TrashIcon } from "lucide-react";
import React from "react";

const DeleteAccountSettings = () => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-2">Account Deletion</h2>
      <p className="text-gray-600 mb-4">
        Please note that deleting your account will erase all your data. If
        you&apos;re sure, you can proceed below.
      </p>

      <Button startContent={<TrashIcon />} color="danger">
        Delete Account
      </Button>
    </>
  );
};

export default DeleteAccountSettings;
