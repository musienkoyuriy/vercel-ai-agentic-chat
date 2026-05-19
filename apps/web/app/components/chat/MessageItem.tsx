'use client';

import { UIMessage } from "ai";
import { memo } from "react";
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { WeatherCard, WeatherData } from "../tools/WeatherCard";
import remarkGfm from "remark-gfm";

export interface MessageItemProps {
  message: UIMessage;
}

const MessageItem = memo(function MessageItem({ message }: MessageItemProps) {
  return (<div
    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`max-w-[80%] overflow-x-auto rounded-lg px-4 py-2 ${message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"}`}
    >
      <div className="text-xs font-semibold mb-1 opacity-70">
        {message.role === "user" ? "You" : "Assistant"}
      </div>
      <div className="space-y-3">
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <div key={index} className="whitespace-pre-wrap">
                <ReactMarkdown components={{
                  code({ className, children }) {
                    const isBlock = className?.includes("language-");
                    const match = /language-(\w+)/.exec(className || "");

                    return isBlock && match ? (
                      <SyntaxHighlighter language={match[1]} style={oneDark}>
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code>{children}</code>
                    );
                  },
                }}
                  remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
              </div>
            );
          }

          if (
            part.type === "tool-weather" &&
            part.state === "output-available"
          ) {
            return (
              <WeatherCard
                key={index}
                data={part.output as WeatherData}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  </div>
  )
});

export default MessageItem;
