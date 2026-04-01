import { useState } from "react";
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Link, Image, Quote, Code, Eye, Edit3 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TOOLBAR_ACTIONS = [
  { icon: Bold, label: "Bold", prefix: "**", suffix: "**" },
  { icon: Italic, label: "Italic", prefix: "_", suffix: "_" },
  { icon: Heading1, label: "H1", prefix: "# ", suffix: "" },
  { icon: Heading2, label: "H2", prefix: "## ", suffix: "" },
  { icon: List, label: "Bullet list", prefix: "- ", suffix: "" },
  { icon: ListOrdered, label: "Numbered list", prefix: "1. ", suffix: "" },
  { icon: Quote, label: "Quote", prefix: "> ", suffix: "" },
  { icon: Code, label: "Code", prefix: "`", suffix: "`" },
  { icon: Link, label: "Link", prefix: "[", suffix: "](url)" },
  { icon: Image, label: "Image", prefix: "![alt](", suffix: ")" },
];

export const ContentEditor = ({ content, onChange }: ContentEditorProps) => {
  const [preview, setPreview] = useState(false);

  const insertMarkdown = (prefix: string, suffix: string) => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + (selected || "text") + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    onChange(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected || "text").length);
    }, 0);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/30">
        <div className="flex items-center gap-0.5 flex-wrap">
          {TOOLBAR_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => insertMarkdown(action.prefix, action.suffix)}
              title={action.label}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <action.icon size={15} />
            </button>
          ))}
        </div>
        <button
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
        >
          {preview ? <Edit3 size={13} /> : <Eye size={13} />}
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div className="prose prose-sm max-w-none p-6 min-h-[400px]">
          <ReactMarkdown>{content || "*No content yet...*"}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          id="content-editor"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          rows={20}
          placeholder="Write your content in Markdown..."
          className="w-full p-6 font-mono text-sm bg-transparent border-none outline-none resize-y min-h-[400px] text-foreground placeholder:text-muted-foreground/50"
        />
      )}
    </div>
  );
};
