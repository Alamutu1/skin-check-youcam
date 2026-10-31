# Skin Check — YouCam Skin AI prototype (Smartlife Tools)

Single flow: photo upload or public image URL → YouCam Skin AI analysis → score, skin type, top concerns, and one clear next step.

## How it works (verified 31 Oct 2026)
- API base: https://yce-api-01.makeupar.com
- Auth: `Authorization: Bearer [API key]` — the key lives ONLY in the server environment, never in this page or repo.
- Workflow: POST /s2s/v2.0/file to initialise an upload (or supply a public `src_file_url` directly), PUT the image to the pre-signed URL if uploading, POST /s2s/v2.0/task/skin-analysis, then GET /s2s/v2.0/task/skin-analysis/<task ID> to poll. Results are retained 24 hours.
- Verified test (playground Sample 1, 31 Oct 2026): status 200, 6 s, task_status success, overall score 75.13, skin_type Oily. That playground test used 1 free trial, not the 1,000-unit balance.
- Image rules: JPEG or PNG, ≤10 MB; SD short side ≥480 px, long side ≤4096 px; HD short side ≥1080 px.
- Pricing reference (docs): 13–16 SD concerns = 16 units (HD 22 units) per successful direct call.

## Server proxy (required, not included as a key)
`index.html` posts to `/api/skin-analysis`. The proxy must:
1. Accept the photo or `src_file_url`.
2. Call the YouCam workflow above with the key from its environment.
3. Return only scores, skin type, top concerns, and a next step to the page.

## Run locally
Serve this folder, set `YOUCAM_API_KEY` in the proxy server environment, and implement `/api/skin-analysis` as above. Do not commit the key.

## Disclaimer
General skin information only, not medical advice. Do not use it to diagnose or treat any condition.
