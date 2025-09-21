
from dotenv import load_dotenv
from fastapi import File, UploadFile
from google import genai
from google.genai import types
import os
import tempfile

import json_repair



querysaved = " "


load_dotenv()


class GeminiService:
    
    def get_response(self, query: str):
        global querysaved
        querysaved = query # wth is this syntax :(
            # print(f"{Settings.GEMINI_API_KEY}")

        client = genai.Client(api_key=f"{os.getenv('GEMINI_API_KEY')}") # as a string chahiye isko :)
        
        
        
        def fun1():
            full_prompt =f"""  
           System:
You are a precise legal-document analyst for laypeople. Output must be one valid JSON object that exactly matches the structure below. Do not include any prose, comments, code fences, or fields not specified. Ground every statement strictly in the provided document text. Use plain, concise, decision-oriented language. If a value is not explicit in the text, write "Not specified" only where allowed by the rules. All scores are integers.

User:
Analyze the following legal document text and return ONLY this single JSON object without using /n or any unnecessary chraacyers, nothing else:
Output format: ONLY the single JSON object, no comments, no prose, no Markdown fences, no backticks.


{{
"verdict": {{
"overall_assessment": "string (plain language, ≤50 words)",
"risk_level": "Low|Medium|High|Critical",
"key_findings": ["string", "..."],
"recommended_actions": ["string", "..."]
}},
"explanations": {{
"document_type": "string",
"document_purpose": "string",
"key_sections": [
{{
"section_title": "string",
"explanation": "string (technical)",
"layman_summary": "string (≤30 words, plain language)",
"importance": "Low|Medium|High",
"location": "string (e.g., 'Section 3.2, p.4')"
}}
],
"legal_terms_decoded": [
{{ "term": "string", "definition": "string (simple, 1–2 sentences)" }}
]
}},
"automatic_summary": {{
"executive_summary": "string (2–3 sentences, plain language)",
"main_obligations": {{
"your_obligations": ["string", "..."],
"their_obligations": ["string", "..."]
}},
"important_dates": [
{{ "date_label": "string", "value": "ISO-8601 or 'Not specified'", "significance": "string (plain language)" }}
],
"financial_implications": {{
"costs": "string",
"payment_terms": "string",
"penalties": "string"
}}
}},
"risk_and_red_flags": {{
"red_flags": [
{{ "issue": "string", "severity": "Low|Medium|High|Critical", "location": "string", "why_it_matters": "string", "mitigation": "string" }}
],
"omissions_or_ambiguities": [
{{ "topic": "string", "impact": "string", "suggested_clarification": "string" }}
]
}},
"digital_literacy_tips": [
{{ "tip": "string (≤24 words)", "category": "Best Practices|Document Management|Time Management|Legal Language|Financial Protection|Security|Due Diligence|Consumer Rights", "importance": "Low|Medium|High|Critical" }}
],
"verified_links": [
{{ "title": "string", "url": "string", "description": "string", "relevance": "string", "verification_status": "Verified|Caution", "jurisdiction": "string" }}
],
"context_aware_credibility_score": {{
"overall_score": 0,
"score_breakdown": {{
"source_reputation": {{ "score": 0, "explanation": "string" }},
"document_authenticity": {{ "score": 0, "explanation": "string" }},
"content_consistency": {{ "score": 0, "explanation": "string" }},
"legal_compliance": {{ "score": 0, "explanation": "string" }},
"clarity_and_transparency": {{ "score": 0, "explanation": "string" }}
}},
"warning_flags": [
{{ "flag": "string", "severity": "Low|Medium|High|Critical", "explanation": "string" }}
],
"positive_indicators": ["string", "..."],
"recommendation": "string (one sentence, clear next step)"
}}
}}

Rules to enforce:

Output format: only the single JSON object above; no extra text, no code fences.

Use only facts from the document text; if absent, write "Not specified" where permitted. Do not invent parties, dates, or amounts.

verdict: overall_assessment ≤ 50 words; risk_level ∈ {{Low, Medium, High, Critical}}; key_findings 3–7 items; recommended_actions 3–7 actionable steps for non-experts.

explanations: key_sections 5–10 items (payments, term/termination, renewal, liability/indemnity, dispute resolution, IP, privacy/data use, warranties, remedies, SLAs); importance ∈ {{Low, Medium, High}}; layman_summary ≤ 30 words; legal_terms_decoded 5–12 terms actually present in the text.

automatic_summary: your_obligations 3–6 bullets; their_obligations 3–6 bullets; important_dates 2–6 items (ISO‑8601 if explicit else "Not specified"); financial_implications in plain English.

risk_and_red_flags: red_flags 4–12 with severity, location, why_it_matters, mitigation; omissions_or_ambiguities 2–8 with impact and specific clarification.

digital_literacy_tips: 6–12 unique tips ≤ 24 words; category must be one of the allowed values.

verified_links: 5–10 items; infer jurisdiction only if explicitly indicated in the document text, otherwise set jurisdiction to "Not specified" and prefer national-level resources; verification_status = "Verified" only for official/widely recognized sources.

context_aware_credibility_score: all scores are integers 0–100; overall_score = rounded mean of the five category scores; warning_flags 2–8; positive_indicators 3–8; recommendation is one clear sentence.

Document text (verbatim):
{query}

        """
            

            model = "gemini-2.5-pro"
            contents = full_prompt
            
            response = client.models.generate_content(
                model=model, contents=contents, 
                )
            return response.text
        res = fun1()
        res1 = json_repair.loads(res)
        # print(res)
        return res1
    
    
    def get_answer(self,  ques):  
        
        
        client = genai.Client(api_key=f"{os.getenv('GEMINI_API_KEY')}") # as a string chahiye isko :)
       
        full_prompt =f"""  
           answer the question: {ques} 
           very briely for the document : {querysaved}

        """
            

        model = "gemini-2.0-flash"
        contents = full_prompt
            
        response = client.models.generate_content(
            model=model, contents=contents, 
            )
        # res1 = json_repair.loads(response.text)
    
        return response.text
    
    async def Getfromdoc(self, file: UploadFile = File(...) ):
        client = genai.Client(api_key=f"{os.getenv('GEMINI_API_KEY')}") # as a string chahiye isko :)
        
        # def get_file_bytes(file_path):
        #     with open(file_path, "rb") as f: # rb means read binary
        #         return f.read()
        file_path1 = "C:\dev\pages-29-deed-sample.pdf"
        # mime_type = "application/pdf"
        # file_bytes = get_file_bytes(file_path1)
        # file_data = types.FileData(
        # mime_type=mime_type,
        # data=file_bytes
        # )
        
        # Read file content
        content = await file.read()
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Upload the file to Gemini's file service
        sample_pdf = client.files.upload(file=tmp_file_path)  # Pass string path
        
        # Wait for processing
        import time
        while sample_pdf.state.name == "PROCESSING":
            print("Processing file...")
            time.sleep(2)
            sample_pdf = client.files.get(name=sample_pdf.name)
        
        if sample_pdf.state.name == "FAILED":
            return {"error": "File processing failed"}
        
        # Extract text from the PDF using the uploaded file
        resp = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=[
                sample_pdf,  # Use uploaded file directly
                "Extract all text content from this document. Return only the raw text without any formatting or analysis."
            ]
        )
        print(resp.text)
        
        respo = GeminiService.get_response(self=self,query=resp.text)
        print(respo)
        return respo
        # return file_data
        
        
        
        

