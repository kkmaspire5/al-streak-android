# Turning your sources into lessons and questions

Give Claude the file (PDF, photo of a page, Word, PowerPoint; Sinhala, Tamil or English) and say which subject and chapter it belongs to. Claude reads it and adds content to `app/src/main/assets/questions.js`. This is what each source becomes:

| Source | Becomes | How |
|---|---|---|
| **Past paper MCQs** + marking scheme | `mcq` questions | Copied nearly as they are. Paper, year and question number go in the `src` field, so the student sees "Source: A/L 2019 Paper I Q12" after answering. The explanation comes from the marking scheme or is written by Claude. |
| **Past paper structured and essay questions** | `WRITTEN` entries | The marking scheme becomes tickable marking points. The student writes, reveals the points, ticks what they covered and gets a score. |
| **Tutes and class notes** | Note cards (2 to 4 per chapter) + questions | Each idea is cut into one short card with a key formula or term. Facts become `mcq`, `tf`, `fill`, `match` and `order` questions. |
| **Worked examples (accounting, economics calculations)** | `fill` questions | Same method, new numbers, one numeric answer. |
| **Teacher's guide / syllabus** | The unit list and its order | Competency levels and learning outcomes become the units. Each outcome should have at least 4 questions. |

## Rules Claude follows
- Answers come from the marking scheme or the teacher's guide. If a source has no answer key, the question is marked in the reply as **needs teacher check** and is not added until checked.
- Wrong options for `mcq` are common student mistakes, not silly options.
- No duplicates: a question already in the file is skipped.
- Each chapter ends up with a mix of question types, at least 4 questions.
- Every question has a one or two line explanation.

## What you do
1. Send the source and tell Claude the subject (Accounting, Business Studies, Economics or ICT).
2. Claude sends back the updated `questions.js` and a short list of anything to double-check.
3. Ask your teacher to scan the new questions, then upload the file to GitHub. The app rebuilds.

Past papers are government exam material. Fine for your own and your friends' practice. Check before putting the app on the Play Store.

## Where the questions go
- **Small, hand-written sets**: edit `app/src/main/assets/questions.js` (needs a new app build).
- **Big sets from past papers and tutes**: Claude writes them into `content/packs.json`. Commit it and every phone picks it up on the next start or when the student taps Sync. No new build needed.

`packs.json` looks like this:

```json
{
  "version": 2,
  "chapters": [
    { "s": "A", "title": "Depreciation", "icon": "trending-down",
      "notes": [ { "h": "Heading", "b": "Short text", "k": "Key formula" } ],
      "qs": [ { "t": "mcq", "q": "…", "a": "right", "w": ["x","y","z"], "e": "why", "src": "A/L 2019 P1 Q5" } ] }
  ],
  "written": [ { "s": "A", "q": "…", "marks": 2, "pts": ["point 1", "point 2"] } ]
}
```
Question types: `mcq`, `tf` (`"a": true`), `fill` (`"a": ["answer"]`), `match` (`"pairs": [["l","r"],...]`), `order` (`"items": [...]`). A chapter with the same subject and title as a built-in one adds to it. Badly formed questions are skipped by the app instead of breaking it.

## Size
Text is tiny: a whole past paper is roughly 20 KB, so even hundreds of papers fit easily. The PDFs themselves never go into the app or GitHub; only the extracted questions do. Keep diagrams as small compressed images.
