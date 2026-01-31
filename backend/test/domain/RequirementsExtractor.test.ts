import { describe, it, expect } from "vitest";
import { RequirementsExtractor } from "../../src/domain/services/RequirementsExtractor.js";

describe("RequirementsExtractor", () => {
  const extractor = new RequirementsExtractor();

  it("should return empty array if no sentences contain keywords", () => {
    const text = "Hola mundo. Esto es una prueba. No hay nada aqui.";
    const result = extractor.extract(text);
    expect(result).toEqual([]);
  });

  it("should extract requirements if keywords are present", () => {
    const text = "El sistema deberá tener login. También es obligatorio usar HTTPS.";
    const result = extractor.extract(text);

    expect(result).toHaveLength(2);
    expect(result[0].text).toContain("El sistema deberá tener login");
    expect(result[0].type).toBe("MANDATORY");
    expect(result[0].keywords).toContain("deberá");
    
    expect(result[1].text).toContain("obligatorio usar HTTPS");
    expect(result[1].type).toBe("MANDATORY");
    expect(result[1].keywords).toContain("obligatorio");
  });

  it("should ignore empty sentences", () => {
    const text = "El sistema debe ser rápido...    . ! ";
    // "debe" is not in the keyword list in the file ["deberá", "must", "requiere", "obligatorio", "shall"]
    // Let's use a known keyword "must"
    const text2 = "It must be fast...   . !";
    const result = extractor.extract(text2);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("It must be fast");
  });
});
