"use client";

import DOMPurify from "dompurify";

interface Props {
    content: string;
}

export default function MarkdownContent({ content }: Props) {
    // HTML을 sanitize하여 XSS 공격 방지
    const sanitizedContent = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
            "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li", "blockquote", "code", "pre", "a", "img", "hr",
            "table", "thead", "tbody", "tr", "th", "td", "div", "span"
        ],
        ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "style", "target", "rel"],
    });

    return (
        <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
    );
}
