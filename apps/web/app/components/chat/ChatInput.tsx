'use client';

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
};

export default function ChatInput({ value, onChange, onSubmit, disabled }: ChatInputProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      className="flex gap-2"
    >
      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type message..."
        className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
      />

      <button
        type="submit"
        disabled={disabled}
        className="bg-blue-600 px-6 py-2 rounded-lg"
      >
        Send
      </button>
    </form>
  );
}
