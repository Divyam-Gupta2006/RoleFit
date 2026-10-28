This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
RoleFit
RoleFit is an AI-powered resume-to-job-description analyzer. Upload a PDF resume, paste a job description, and get an evidence-based breakdown of how the candidate aligns with the role—including matched requirements, partial matches, missing evidence, seniority fit, and actionable recommendations.
RoleFit is a decision-support tool, not a hiring decision or a prediction of whether an employer will make an offer. Its results depend on the text extracted from the resume and the criteria identified in the job description.

Features
- PDF resume parsing with unpdf.
- Two-pass AI analysis using Groq and LangChain:
  1. Extract hiring criteria from the job description without using the resume.
  2. Assess the resume against those criteria.
- Structured model output validated with Zod schemas.
- Evidence-backed assessments with resume excerpts checked against the extracted PDF text.
- Skill keyword cross-checks to reduce unsupported positive matches and irrelevant evidence.
- Experience and seniority analysis, including date-range checks where the resume provides explicit dates.
- Weighted matching score for required and preferred criteria.
- Confidence and coverage metrics that show how much of the assessment is supported by verified evidence.
- Actionable recommendations to help identify gaps and improve how relevant experience is communicated.
Tech stack
- Next.js with the App Router and TypeScript
- Tailwind CSS for styling
- LangChain.js with @langchain/groq
- Groq for model inference (openai/gpt-oss-120b)
- Zod for structured output validation
- unpdf for extracting text from PDF files
Getting started
Prerequisites
- Node.js compatible with your installed Next.js version
- npm
- A Groq API key
1. Install dependencies
npm install
2. Configure environment variables
Create a .env.local file in the project root:
GROQ_API_KEY=your_groq_api_key_here
Get an API key from the Groq Console. Keep this key on the server: do not prefix it with NEXT_PUBLIC_ or commit it to source control.
3. Run the development server
npm run dev
Open http://localhost:3000 in your browser.
4. Create a production build
npm run build
npm run start
If your project defines a lint script, you can also run npm run lint to check for linting issues.
How it works
RoleFit deliberately separates job-criteria extraction from candidate assessment to reduce the risk of the resume influencing what the system looks for.
1. Input validation — the API checks the uploaded file, PDF signature, file size, and job-description length.
2. PDF text extraction — unpdf extracts text from the resume. The analyzer currently requires extractable text; scanned/image-only PDFs are not OCR-processed.
3. Criteria extraction — the model reads only the job description and identifies up to 15 distinct hiring criteria. Each criterion is classified as required or preferred and assigned a dimension.
4. Resume assessment — a second model call assesses each criterion and returns a status, a concise reason, and a supporting quote when available.
5. Evidence verification — the server checks quotes against the extracted resume text, cross-checks keywords for technical skills, and rejects unsupported positive assessments in relevant cases.
6. Experience checks — when a criterion specifies a year range and the resume includes dated roles/projects, the server calculates evidenced duration from verified date ranges rather than relying on the model to do the arithmetic.
7. Scoring and response — the server calculates scores, confidence metrics, evidence summaries, hard gaps, unresolved requirements, and recommendations.
API
POST /api/analyze
Submit a multipart/form-data request with these fields:
Field	Type	Requirements
resume	File	PDF, non-empty, maximum 5 MB
jobDescription	String	50–15,000 characters


Example using curl:
curl -X POST http://localhost:3000/api/analyze \
  -F "resume=@./resume.pdf;type=application/pdf" \
  -F "jobDescription=Paste the full job description here. Include at least 50 characters..."
Response overview
A successful request returns JSON containing fields such as:
Field	Description
candidateSummary	Short factual summary of the candidate based on the resume
resumeSkills	Skills reported by the model and cross-checked against resume text
criteria	Detailed per-criterion assessments, evidence, checks, and scores/statuses
evidence	Compact list of verified excerpts supporting positive assessments
matchedRequired / partiallyMatchedRequired / missingRequired / unclearRequired	Required criteria grouped by status
matchedPreferred / partiallyMatchedPreferred / missingPreferred / unclearPreferred	Preferred criteria grouped by status
requiredScore	Score for required criteria
preferredScore	Score for preferred criteria, or null when none are available
overallMatchScore	Weighted overall score
seniorityMatchScore	Score for criteria explicitly classified as seniority, or null when none exist
scoreRange	Conservative-to-optimistic score range for unresolved assessments
confidence	low, medium, or high confidence classification based on assessment coverage and verified evidence coverage
confidenceMetrics	Counts and percentages showing determinacy and evidence coverage
hardGaps	Required technical, experience, seniority, or education criteria without evidence (not_met)
unresolvedRequirements	Required criteria marked unclear, with reasons
recommendations	Actionable suggestions based on the assessment
matchScore	Backward-compatible alias of overallMatchScore
scoringNote	Description of the scoring rules and key caveats


The exact set of criteria varies with the job description. The API may return an error JSON response when input validation or analysis fails.
Validation and error responses
The endpoint validates the input before model analysis. Common errors include:
- 400 — uploaded file is not a PDF, exceeds the 5 MB limit, has an invalid PDF signature, or the job description is outside the allowed length.
- 422 — too little text could be extracted from the PDF or no usable hiring criteria could be identified.
- 500 — the API key is missing or analysis fails unexpectedly.
The exact error message is returned in an error field.
Scoring
Each criterion receives one of four statuses:
Status	Base points	Meaning
met	100%	Resume evidence satisfies the criterion
partially_met	50%	Some relevant evidence exists, but the requirement is only partly satisfied
not_met	0%	The resume contains no evidence that satisfies the criterion
unclear	0% by default	Available resume evidence is insufficient to judge the criterion


The overall score weights required criteria at 80% and preferred criteria at 20%. If one category is absent or has no scoreable criteria, the other category carries the full weight. Unclear nontechnical other criteria are excluded from the base score instead of automatically counting as failures; the optimistic end of scoreRange models unresolved criteria being resolved positively.

The seniority score averages criteria classified specifically as seniority; it is not the same as the overall match score. If the job description contains no seniority criteria, seniorityMatchScore is null.

A score is a measure of resume evidence against the extracted criteria—not a probability of getting an interview or job offer. Review individual criteria and quotes rather than relying on one number.
Assessment dimensions
Criteria are classified by their primary purpose:
- skills — technologies, tools, languages, frameworks, and technical knowledge
- experience — demonstrated responsibilities, project delivery, documentation, troubleshooting, and development practices
- seniority — explicit years-of-experience thresholds and career levels
- education — degrees, certifications, and formal qualifications
- other — communication, learning attitude, and other nontechnical traits
Personal, legal, and logistical facts—such as work authorization or availability—are marked unclear when the resume does not provide explicit evidence. Resume silence should not be interpreted as proof that a candidate is ineligible or unavailable.
Limitations
- No OCR yet: scanned PDFs or image-only documents may fail text extraction. Use a text-based PDF for the best results.
- Resume text limit: the analyzer evaluates up to 20,000 extracted characters from the resume.
- Criteria limit: up to 15 distinct criteria are retained from a job description; lower-priority criteria may be omitted when a description contains more.
- Evidence is not truth: a quote can be correctly found in a PDF but still be weak evidence for a requirement. Review the evidence and the reason for each assessment.
- Keyword matching is imperfect: aliases and wording differences may cause relevant skills to be missed or ambiguously interpreted.
- Dates may be incomplete: duration checks require explicit, verifiable dates and can be less accurate for overlapping, vague, or missing entries.
- Model output can be wrong: summaries, categorizations, and recommendations should be reviewed before making decisions.
- Privacy: resume text is sent to the configured Groq model provider for analysis. Do not upload resumes unless you are authorized to process them, and review the provider's current privacy terms before using the app with real candidate data.
Suggested project structure
The relevant route is located at:
app/
└── api/
    └── analyze/
        └── route.ts   # PDF validation, AI analysis, evidence checks, and scoring
The UI and other files may vary depending on the current project structure.
Development notes
- Keep GROQ_API_KEY in .env.local and out of version control.
- The route uses the default Node.js runtime. Do not add an explicit export const runtime = "nodejs" while Next.js Cache Components is enabled, because that configuration combination can cause a build error.
- The endpoint retries model calls once after a failed attempt.
- The API keeps matchScore as an alias for overallMatchScore to help maintain compatibility with an existing frontend.
License
No license has been specified yet. Add a LICENSE file and update this section before distributing the project publicly.