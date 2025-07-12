import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ERTemplate } from "@/types/er-diagram";

interface TemplateEditorProps {
  initialTemplate: ERTemplate;
  onTemplateUpdate: (template: ERTemplate) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  initialTemplate,
  onTemplateUpdate,
}) => {
  const [templateText, setTemplateText] = useState(
    JSON.stringify(initialTemplate, null, 2)
  );
  const [error, setError] = useState<string>("");

  // Handle template update
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
          onChange={(e) => setTemplateText(e.target.value)}
          className="w-full h-full p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your ER diagram template JSON here..."
          spellCheck={false}
        />
      </CardContent>
    </Card>
  );
};
