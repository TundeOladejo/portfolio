'use client';

import { useEffect, useRef, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
  ORDERED_LIST,
  UNORDERED_LIST,
  HEADING,
  QUOTE,
  INLINE_CODE,
} from '@lexical/markdown';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  $createParagraphNode,
  $isParagraphNode,
  $isTextNode,
  type EditorState,
} from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';

// Only use transformers whose nodes are registered
const SAFE_TRANSFORMERS = [
  HEADING,
  QUOTE,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
  ORDERED_LIST,
  UNORDERED_LIST,
  INLINE_CODE,
];

// ── Theme ────────────────────────────────────────────────────────────────────

const theme = {
  heading: {
    h1: 'text-3xl font-semibold text-white mt-8 mb-4 leading-tight',
    h2: 'text-2xl font-semibold text-white mt-6 mb-3 leading-tight',
    h3: 'text-xl font-semibold text-white mt-5 mb-2 leading-tight',
  },
  paragraph: 'text-neutral-300 leading-relaxed mb-3',
  quote: 'border-l-2 border-neutral-600 pl-4 italic text-neutral-400 my-4',
  list: {
    ul: 'list-disc list-inside text-neutral-300 mb-3 space-y-1 pl-4',
    ol: 'list-decimal list-inside text-neutral-300 mb-3 space-y-1 pl-4',
    listitem: 'text-neutral-300',
    nested: { listitem: 'list-none' },
  },
  text: {
    bold: 'font-semibold text-white',
    italic: 'italic',
    underline: 'underline underline-offset-2',
    strikethrough: 'line-through text-neutral-500',
    code: 'font-mono bg-neutral-800 px-1 py-0.5 text-sm text-neutral-200 rounded',
  },
  link: 'text-white underline underline-offset-2 hover:text-neutral-300 cursor-pointer',
};

// ── Initial HTML loader ───────────────────────────────────────────────────────

function InitialContentPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !html.trim()) return;
    initialized.current = true;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();

      // Wrap any inline/text nodes in a paragraph so Lexical doesn't throw
      const wrapped = nodes.map((node) => {
        if ($isTextNode(node) || node.getType() === 'linebreak') {
          const p = $createParagraphNode();
          p.append(node);
          return p;
        }
        return node;
      });

      root.append(...wrapped);
    });
  }, [editor, html]);

  return null;
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatText = (
    format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'
  ) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatBlock = (
    tag: 'h1' | 'h2' | 'h3' | 'paragraph' | 'quote'
  ) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      if (tag === 'paragraph') {
        $setBlocksType(selection, () => $createParagraphNode());
      } else if (tag === 'quote') {
        $setBlocksType(selection, () => $createQuoteNode());
      } else {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  };

  const insertList = (type: 'bullet' | 'number') => {
    editor.dispatchCommand(
      type === 'bullet'
        ? INSERT_UNORDERED_LIST_COMMAND
        : INSERT_ORDERED_LIST_COMMAND,
      undefined
    );
  };

  const btn =
    'px-2 py-1 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors rounded-sm select-none';
  const sep = <div className="w-px h-4 bg-neutral-700 mx-0.5 shrink-0" />;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-800 bg-neutral-900 px-2 py-1.5 sticky top-0 z-10">
      <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText('bold'); }} className={btn} title="Bold (Ctrl+B)">
        <strong>B</strong>
      </button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText('italic'); }} className={btn} title="Italic (Ctrl+I)">
        <em>I</em>
      </button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText('underline'); }} className={btn} title="Underline (Ctrl+U)">
        <span className="underline">U</span>
      </button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText('strikethrough'); }} className={btn} title="Strikethrough">
        <span className="line-through">S</span>
      </button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText('code'); }} className={btn} title="Inline code">
        {'<>'}
      </button>

      {sep}

      <button type="button" onMouseDown={(e) => { e.preventDefault(); formatBlock('h1'); }} className={btn} title="Heading 1">H1</button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); formatBlock('h2'); }} className={btn} title="Heading 2">H2</button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); formatBlock('h3'); }} className={btn} title="Heading 3">H3</button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); formatBlock('paragraph'); }} className={btn} title="Paragraph">¶</button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); formatBlock('quote'); }} className={btn} title="Blockquote">"</button>

      {sep}

      <button type="button" onMouseDown={(e) => { e.preventDefault(); insertList('bullet'); }} className={btn} title="Bullet list">• List</button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); insertList('number'); }} className={btn} title="Numbered list">1. List</button>
    </div>
  );
}

// ── HTML export ───────────────────────────────────────────────────────────────

function HtmlExportPlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();

  const handleChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        onChange(html);
      });
    },
    [editor, onChange]
  );

  return <OnChangePlugin onChange={handleChange} ignoreSelectionChange />;
}

// ── Main component ────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  defaultValue = '',
  onChange,
  placeholder = 'Write your content here…',
  minHeight = '200px',
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: 'CaseStudyEditor',
    theme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
    ],
    onError: (error: Error) => {
      // Suppress non-critical Lexical internal errors in dev
      if (process.env.NODE_ENV === 'development') {
        console.warn('Lexical:', error.message);
      }
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border border-neutral-800 bg-neutral-950 overflow-hidden">
        <ToolbarPlugin />
        <div className="relative" style={{ minHeight }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="outline-none px-4 py-3 text-sm text-neutral-200 leading-relaxed"
                style={{ minHeight }}
                aria-placeholder={placeholder}
                placeholder={
                  <div className="absolute top-3 left-4 text-sm text-neutral-700 pointer-events-none select-none">
                    {placeholder}
                  </div>
                }
              />
            }
            ErrorBoundary={({ children }) => <>{children}</>}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={SAFE_TRANSFORMERS} />
        {defaultValue && <InitialContentPlugin html={defaultValue} />}
        {onChange && <HtmlExportPlugin onChange={onChange} />}
      </div>
    </LexicalComposer>
  );
}
