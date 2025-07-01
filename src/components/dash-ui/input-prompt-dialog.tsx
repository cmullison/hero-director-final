import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputPromptDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  dialogTitle: string;
  promptLabel: string;
  placeholder?: string;
  initialValue?: string;
  onSave: (value: string) => void;
  saveButtonText?: string;
  cancelButtonText?: string;
}

export const InputPromptDialog: React.FC<InputPromptDialogProps> = ({
  isOpen,
  setIsOpen,
  dialogTitle,
  promptLabel,
  placeholder,
  initialValue = "",
  onSave,
  saveButtonText = "Save",
  cancelButtonText = "Cancel",
}) => {
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSave = () => {
    if (inputValue.trim()) {
      onSave(inputValue.trim());
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-1.5">
            <Label htmlFor="input-prompt-field">{promptLabel}</Label>
            <Input
              id="input-prompt-field"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {cancelButtonText}
          </Button>
          <Button onClick={handleSave} disabled={!inputValue.trim()}>
            {saveButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
