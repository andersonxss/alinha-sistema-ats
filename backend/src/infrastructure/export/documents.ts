import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import PDFDocument from "pdfkit";

const heading = (line: string) =>
  /^(resumo( profissional)?|perfil( profissional)?|objetivo|experi[eê]ncias?( profissionais?| profissional)?|forma[çc][aã]o( acad[eê]mica)?|compet[eê]ncias( t[eé]cnicas)?|habilidades|certifica[çc][oõ]es|idiomas|projetos( relevantes)?|cursos)\s*:?$/i.test(
    line.trim(),
  );
export async function exportDocuments(text: string) {
  const paragraphs = text.split("\n");
  const docx = await Packer.toBuffer(
    new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 },
            },
          },
          children: paragraphs.map(
            (line, i) =>
              new Paragraph({
                heading:
                  i === 0
                    ? HeadingLevel.TITLE
                    : heading(line)
                      ? HeadingLevel.HEADING_1
                      : undefined,
                keepNext: heading(line),
                spacing: { after: 100, before: heading(line) ? 160 : 0 },
                children: [
                  new TextRun({
                    text: line,
                    font: "Arial",
                    color: "202820",
                    bold: i === 0 || heading(line),
                    size: i === 0 ? 32 : heading(line) ? 25 : 22,
                  }),
                ],
              }),
          ),
        },
      ],
    }),
  );
  const pdf = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const document = new PDFDocument({
      size: "A4",
      margin: 56,
      info: { Title: "Currículo profissional" },
    });
    document.on("data", (c) => chunks.push(c));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
    for (const [i, line] of paragraphs.entries()) {
      if (
        heading(line) &&
        document.y > document.page.height - document.page.margins.bottom - 65
      )
        document.addPage();
      document
        .font(i === 0 || heading(line) ? "Helvetica-Bold" : "Helvetica")
        .fontSize(i === 0 ? 16 : heading(line) ? 12.5 : 11);
      document.text(line || " ", { lineGap: 4 });
    }
    document.end();
  });
  return { pdf, docx };
}
