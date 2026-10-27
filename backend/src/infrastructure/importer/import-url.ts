import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import * as cheerio from "cheerio";
import ipaddr from "ipaddr.js";

export function publicAddress(address: string) {
  try {
    const ip = ipaddr.process(address);
    return ip.range() === "unicast" && ip.toString() !== "168.63.129.16";
  } catch {
    return false;
  }
}

export function validateUrl(input: string) {
  const url = new URL(input);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && !["80", "443"].includes(url.port))
  )
    throw new Error(
      "Use uma URL pública HTTP ou HTTPS sem credenciais ou portas especiais.",
    );
  return url;
}

export async function importUrl(input: string) {
  let url = validateUrl(input);
  const deadline = Date.now() + 15000;
  for (let redirects = 0; redirects <= 3; redirects++) {
    if (Date.now() > deadline)
      throw new Error("A importação demorou demais. Cole a descrição.");
    const host = url.hostname.replace(/^\[|\]$/g, "");
    const addresses = await Promise.race([
      dns.lookup(host, { all: true, verbatim: true }),
      new Promise<never>((_, reject) => {
        const t = setTimeout(
          () => reject(new Error("Tempo de DNS excedido.")),
          3000,
        );
        t.unref();
      }),
    ]);
    if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
      throw new Error("Endereço privado ou reservado bloqueado.");
    const resolved = addresses[0];
    const response = await new Promise<{
      status: number;
      location?: string;
      type: string;
      body: string;
    }>((resolve, reject) => {
      const request = (url.protocol === "https:" ? https : http).get(
        url,
        {
          family: resolved.family,
          headers: {
            "User-Agent": "ATS-Resume/1.0",
            Accept: "text/html,text/plain",
            "Accept-Encoding": "identity",
          },
          lookup: ((
            _hostname: unknown,
            _options: unknown,
            cb: (err: null, address: string, family: number) => void,
          ) => cb(null, resolved.address, resolved.family)) as never,
        },
        (res) => {
          let size = 0;
          const chunks: Buffer[] = [];
          res.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > 2 * 1024 * 1024) {
              request.destroy(
                new Error("Página muito grande. Cole a descrição."),
              );
              return;
            }
            chunks.push(chunk);
          });
          res.on("error", reject);
          res.on("end", () =>
            resolve({
              status: res.statusCode ?? 500,
              location: res.headers.location,
              type: res.headers["content-type"] ?? "",
              body: Buffer.concat(chunks).toString("utf8"),
            }),
          );
        },
      );
      const timer = setTimeout(
        () => request.destroy(new Error("Tempo limite de importação.")),
        Math.max(1, deadline - Date.now()),
      );
      request.on("close", () => clearTimeout(timer));
      request.on("error", reject);
    });
    if (
      [301, 302, 303, 307, 308].includes(response.status) &&
      response.location
    ) {
      url = validateUrl(new URL(response.location, url).href);
      continue;
    }
    if (response.status !== 200 || !/text\/(html|plain)/i.test(response.type))
      throw new Error("A página não está acessível. Cole a descrição da vaga.");
    const $ = cheerio.load(response.body);
    $("script,style,nav,header,footer,aside,form,noscript,svg").remove();
    $("br").replaceWith("\n");
    $("p,li,div,h1,h2,h3").append("\n");
    const text = (
      $("main").text() ||
      $("article").text() ||
      $("body").text() ||
      response.body
    )
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim()
      .slice(0, 30000);
    if (text.length < 100)
      throw new Error(
        "Não foi encontrada uma descrição suficiente. Cole o texto da vaga.",
      );
    return { text, url: url.href };
  }
  throw new Error("A página redirecionou muitas vezes. Cole a descrição.");
}
