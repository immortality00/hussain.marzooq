import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProseImage } from "./ProseImage";

export function BlogContent({ content }: { content: string }) {
  return (
    <div className="blog-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, title, children }) => (
            <a href={href} title={title} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt, title }) => <ProseImage src={src} alt={alt} title={title} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
