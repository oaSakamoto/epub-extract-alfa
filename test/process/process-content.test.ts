import { describe, it } from "vitest";
import { processContent } from "../../src/process-resources/process-content.ts";
import { Blob } from "buffer";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
global.Blob = Blob;

describe("processContent", async () => {
  const createMockBlob = (
    textContent: string,
    type: string = "text/xml",
  ): Blob => {
    return new Blob([textContent], { type });
  };
  const textBlob = `
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0" >
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"  xmlns:opf="http://www.idpf.org/2007/opf">
<dc:title>Epub de teste</dc:title>
<dc:creator opf:file-as="Epub creator" opf:role="aut">Epub creator</dc:creator>
<dc:publisher>Manning Publications</dc:publisher>
<dc:language>en-US</dc:language>
<dc:identifier id="bookid">9999999999999</dc:identifier>
<meta name="cover" content="Images/default_cover.jpeg"/>
</metadata>
<manifest>
<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />
<item id="default_cover" href="default_cover.xhtml" media-type="application/xhtml+xml" />
<item id="IFC" href="IFC.xhtml" media-type="application/xhtml+xml" />
<item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml" />
<item id="title" href="title.htm" media-type="application/xhtml+xml" />
<item id="copyright" href="copyright.htm" media-type="application/xhtml+xml" />
<item id="dedication" href="dedication.htm" media-type="application/xhtml+xml" />
<item id="TOC" href="TOC.htm" media-type="application/xhtml+xml" />
<item id="FM" href="FM.htm" media-type="application/xhtml+xml" />
<item id="ch01" href="ch01.htm" media-type="application/xhtml+xml" />
<item id="ch02" href="ch02.htm" media-type="application/xhtml+xml" />
<item id="ch03" href="ch03.htm" media-type="application/xhtml+xml" />
<item id="IBC" href="IBC.htm" media-type="application/xhtml+xml" />
<item id="ch04" href="ch04.htm" media-type="application/xhtml+xml" />
<item id="ch05" href="ch05.htm" media-type="application/xhtml+xml" />
<item id="ch06" href="ch06.htm" media-type="application/xhtml+xml" />
<item id="ch07" href="ch07.htm" media-type="application/xhtml+xml" />
<item id="ch08" href="ch08.htm" media-type="application/xhtml+xml" />
<item id="ch09" href="ch09.htm" media-type="application/xhtml+xml" />
<item id="StreetCoderIX" href="StreetCoderIX.htm" media-type="application/xhtml+xml" />
</manifest>
<spine toc="ncx">
<itemref idref="default_cover"/>
<itemref idref="IFC"/>
<itemref idref="titlepage"/>
<itemref idref="title"/>
<itemref idref="copyright"/>
<itemref idref="dedication"/>
<itemref idref="TOC"/>
<itemref idref="FM"/>
<itemref idref="ch01"/>
<itemref idref="ch02"/>
<itemref idref="ch03"/>
<itemref idref="IBC"/>
<itemref idref="ch04"/>
<itemref idref="ch05"/>
<itemref idref="ch06"/>
<itemref idref="ch07"/>
<itemref idref="ch08"/>
<itemref idref="ch09"/>
<itemref idref="StreetCoderIX"/></spine>
</package>

`;
  it("should show console.log", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    processContent(createMockBlob(textBlob));
  });
});
