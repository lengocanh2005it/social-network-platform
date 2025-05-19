"use client";
import { Button } from "@heroui/react";
import React from "react";

interface UndoPostToastProps {
  onUndo: () => void;
  remaining: number;
}

const UndoPostToast: React.FC<UndoPostToastProps> = ({ onUndo, remaining }) => {
  return (
    <div
      className="flex items-center justify-between gap-4 p-4 rounded-lg bg-white shadow-md
    w-full max-w-sm text-black"
    >
      <span className="text-sm">
        The post was hidden. You can undo this within {remaining}s.
      </span>

      <Button size="sm" color="primary" onPress={onUndo}>
        Undo
      </Button>
    </div>
  );
};

export default UndoPostToast;
