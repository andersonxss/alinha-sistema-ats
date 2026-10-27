export function Icon({ type }: { type: string }) {
  const paths: Record<string, string[]> = {
    home: ["M3 10.8 12 3l9 7.8", "M5.5 9.5V21h13V9.5", "M9.5 21v-7h5v7"],
    resume: [
      "M7 3.8h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.8a1 1 0 0 1 1-1Z",
      "M14 4v5h5",
      "M9 13h6",
      "M9 16.5h6",
    ],
    history: [
      "M3.5 11a8.5 8.5 0 1 1 1.8 5.7",
      "M3.5 5.5V11h5.5",
      "M12 7v5l3.5 2",
    ],
    settings: [
      "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z",
      "m19.4 15 .1.1 1.2.9-1.2 2.1-1.4-.5a7.7 7.7 0 0 1-1.5.9l-.2 1.5h-2.5l-.3-1.5a7.7 7.7 0 0 1-1.5-.9l-1.4.5-1.2-2.1 1.2-.9a7.4 7.4 0 0 1 0-1.8l-1.2-.9 1.2-2.1 1.4.5a7.7 7.7 0 0 1 1.5-.9l.3-1.5h2.5l.2 1.5a7.7 7.7 0 0 1 1.5.9l1.4-.5 1.2 2.1-1.2.9a7.4 7.4 0 0 1 0 1.8Z",
    ],
    plus: ["M12 5v14", "M5 12h14"],
    arrow: ["M7 17 17 7", "M8 7h9v9"],
    check: ["m5 12.5 4.3 4.3L19 7"],
    spark: [
      "m12 3 1.9 5.9L20 11l-6.1 2.1L12 19l-1.9-5.9L4 11l6.1-2.1L12 3Z",
      "m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z",
    ],
  };
  return (
    <span aria-hidden="true" className="icon">
      <svg viewBox="0 0 24 24" focusable="false">
        {(paths[type] ?? paths.arrow).map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  );
}
