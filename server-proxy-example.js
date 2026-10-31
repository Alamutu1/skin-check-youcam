// Example server proxy only — set YOUCAM_API_KEY in the server environment.
// Never commit a real API key. This file is an outline, not a production server.
const API_BASE = 'https://yce-api-01.makeupar.com';
// POST /api/skin-analysis with a photo or src_file_url, then:
// 1. POST /s2s/v2.0/file (or use src_file_url directly)
// 2. PUT image to the pre-signed URL if uploading
// 3. POST /s2s/v2.0/task/skin-analysis with dst_actions (16 SD concerns)
// 4. GET /s2s/v2.0/task/skin-analysis/<task ID> until task_status is success
// 5. Return overall score, skin_type, top concerns, and one next step.
// Auth header: Authorization: Bearer <process.env.YOUCAM_API_KEY>
