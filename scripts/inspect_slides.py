import pptx
import sys

def main():
    prs = pptx.Presentation("KAUSHAL-26-AI-Resume.pptx")
    with open("scripts/slides_dump.txt", "w", encoding="utf-8") as out:
        for s_idx, slide in enumerate(prs.slides):
            out.write(f"\n==================== SLIDE {s_idx+1} ====================\n")
            for sh_idx, shape in enumerate(slide.shapes):
                if shape.has_text_frame:
                    out.write(f"--- Shape {sh_idx} ({shape.name}) [shape_type={shape.shape_type}] ---\n")
                    for p_idx, p in enumerate(shape.text_frame.paragraphs):
                        runs_info = []
                        for r in p.runs:
                            color = None
                            try:
                                if r.font.color and r.font.color.rgb:
                                    color = str(r.font.color.rgb)
                            except Exception:
                                pass
                            runs_info.append({
                                "text": r.text,
                                "font": r.font.name,
                                "size": str(r.font.size),
                                "bold": r.font.bold,
                                "italic": r.font.italic,
                                "color": color
                            })
                        out.write(f"  P{p_idx}: full='{p.text}' | runs={runs_info}\n")

if __name__ == "__main__":
    main()
