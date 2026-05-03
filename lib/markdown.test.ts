import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  test("renders headings", () => {
    expect(renderMarkdown("# Heading")).toContain("<h1>Heading</h1>");
    expect(renderMarkdown("### Third")).toContain("<h3>Third</h3>");
  });

  test("renders bold and italic", () => {
    expect(renderMarkdown("**strong** and *em*")).toContain(
      "<strong>strong</strong>",
    );
    expect(renderMarkdown("**strong** and *em*")).toContain("<em>em</em>");
  });

  test("renders bullet list", () => {
    const out = renderMarkdown("- one\n- two");
    expect(out).toContain("<ul>");
    expect(out).toContain("<li>one</li>");
    expect(out).toContain("<li>two</li>");
  });

  test("renders numbered list", () => {
    const out = renderMarkdown("1. a\n2. b");
    expect(out).toContain("<ol>");
    expect(out).toContain("<li>a</li>");
  });

  test("renders fenced code", () => {
    const out = renderMarkdown("```\nconst x = 1;\n```");
    expect(out).toContain("<pre><code>const x = 1;</code></pre>");
  });

  test("escapes html in body", () => {
    expect(renderMarkdown("<script>")).toContain("&lt;script&gt;");
  });

  test("renders links", () => {
    const out = renderMarkdown("[site](https://example.com)");
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain(">site<");
  });
});
