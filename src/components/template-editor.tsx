import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ERTemplate } from "@/types/er-diagram";

interface TemplateEditorProps {
  initialTemplate: ERTemplate;
  onDraftChange: (template: ERTemplate) => void;
  onTemplateUpdate: (template: ERTemplate) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  initialTemplate,
  onDraftChange,
  onTemplateUpdate,
}) => {
  const [templateText, setTemplateText] = useState(
    JSON.stringify(initialTemplate, null, 2)
  );
  const [error, setError] = useState<string>("");

  // Sync templateText with initialTemplate when it changes (only when not editing)
  useEffect(() => {
    setTemplateText(JSON.stringify(initialTemplate, null, 2));
  }, [initialTemplate]);

  // Handle textarea changes (draft changes)
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setTemplateText(newText);

      // Try to parse and save as draft if valid JSON
      try {
        const parsed = JSON.parse(newText);
        onDraftChange(parsed);
        setError("");
      } catch {
        // Don't show error for draft changes, only for update button
      }
    },
    [onDraftChange]
  );

  // Handle manual template update
  const updateTemplate = useCallback(() => {
    try {
      const parsed = JSON.parse(templateText);
      onTemplateUpdate(parsed);
      setError("");
    } catch (err) {
      setError("Invalid JSON format");
      console.error("JSON parsing error:", err);
    }
  }, [templateText, onTemplateUpdate]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>ER Diagram Template Editor</CardTitle>
        <div className="flex gap-2">
          <Button onClick={updateTemplate} size="sm">
            Update Diagram
          </Button>
          {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>
      </CardHeader>
      <CardContent className="h-full pb-4">
        <textarea
          value={templateText}
          onChange={handleTextChange}
          className="w-full h-full p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your ER diagram template JSON here..."
          spellCheck={false}
        />
      </CardContent>
    </Card>
  );
};
